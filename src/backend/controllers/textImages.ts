import { Response, NextFunction } from 'express';
import { textImageSchema } from 'src/backend/models/TextImage';
import { packageResponse, handleQueries } from './utils';
import * as Interfaces from './utils/interfaces';
import createRegExp from '../shared/utils/createRegExp';

/* Returns all matching Text Image documents */
export const getTextImages = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> | void => {
  try {
    const { searchWord, regexKeyword, mongooseConnection, skip, limit, ...rest } = handleQueries(req);

    // Loosely matches with an included Nsibidi character
    const regex = createRegExp(searchWord).wordReg;
    const query = {
      $or: [{ igbo: { $regex: regex } }],
    };
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);

    console.log({ skip, limit, query: query.$or[0] });
    return TextImage.find(query)
      .skip(skip)
      .limit(limit)
      .then((textImages: Interfaces.TextImage[]) =>
        packageResponse({
          res,
          docs: textImages,
          model: TextImage,
          query,
          ...rest,
        }),
      )
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning text images, double check your provided data');
      });
  } catch (err) {
    return next(err);
  }
};

/* Create a new Text Image */
export const postTextImage = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { mongooseConnection, body } = req;
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);
    const textImage = new TextImage(body);
    const savedTextImage = await textImage.save();
    return res.send(savedTextImage);
  } catch (err) {
    return next(err);
  }
};
