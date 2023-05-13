import { Response, NextFunction } from 'express';
import { packageResponse, handleQueries } from './utils';
import * as Interfaces from './utils/interfaces';
import { nsibidiCharacterSchema } from '../models/NsibidiCharacter';
import createRegExp from '../shared/utils/createRegExp';

/* Returns all matching Nsibidi documents */
export const getNsibidiCharacters = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> | void => {
  try {
    const {
      searchWord,
      mongooseConnection,
      ...rest
    } = handleQueries(req);

    // Loosely matches with an included Nsibidi character
    const regex = createRegExp(searchWord).wordReg;
    const query = { nsibidi: { $regex: regex } };
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);

    return NsibidiCharacter.find(query).then((nsibidiCharacters: Interfaces.NsibidiCharacter[]) => (
      packageResponse({
        res,
        docs: nsibidiCharacters,
        model: NsibidiCharacter,
        query,
        ...rest,
      })
    )).catch((err) => {
      console.log(err);
      throw new Error('An error has occurred while returning nsibidi characters, double check your provided data');
    });
  } catch (err) {
    return next(err);
  }
};

/* Returns a single Nsibidi character by using an id */
export const getNsibidiCharacter = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
) : Promise<any | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);
    const nsibidiCharacter = await NsibidiCharacter.findById(id);
    return res.send(nsibidiCharacter.toJSON());
  } catch (err) {
    return next(err);
  }
};
