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
    const { projectId } = req.query;

    // Loosely matches with an included Nsibidi character
    const regex = createRegExp(searchWord).wordReg;
    const query = {
      $and: [{ $or: [{ igbo: { $regex: regex } }] }, { projectId: { $eq: projectId } }],
    };
    const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);

    return TextImage.find(query)
      .skip(skip)
      .limit(limit)
      .then((textImages: Interfaces.TextImage[]) =>
        packageResponse({
          res,
          docs: textImages.map((textImage) => textImage.toObject()),
          model: TextImage,
          query,
          ...rest,
        }),
      )
      .catch(() => {
        // console.log(err);
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
    const textImages = await Promise.all(
      body.map(async (textImagePayload) => {
        const TextImage = mongooseConnection.model<Interfaces.TextImage>('TextImage', textImageSchema);
        const textImage = new TextImage(textImagePayload);
        const savedTextImage = await textImage.save();
        return savedTextImage.toObject();
      }),
    );
    return res.send(textImages);
  } catch (err) {
    return next(err);
  }
};
