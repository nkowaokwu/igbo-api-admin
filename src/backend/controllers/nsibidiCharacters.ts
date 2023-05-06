import { Response, NextFunction } from 'express';
import { packageResponse, handleQueries } from './utils';
import * as Interfaces from './utils/interfaces';
import { nsibidiSchema } from '../models/Nsibidi';

/* Returns all matching Nsibidi documents */
export const getNsibidiCharacters = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> | void => {
  try {
    const {
      regexKeyword,
      searchWord,
      skip,
      limit,
      mongooseConnection,
      ...rest
    } = handleQueries(req);

    const query = { nsibidi: searchWord };
    const Nsibidi = mongooseConnection.model('Nsibidi', nsibidiSchema);

    return Nsibidi.find(query).then((nsibidiCharacters: [Interfaces.Nsibidi]) => (
      packageResponse({
        res,
        docs: nsibidiCharacters,
        model: Nsibidi,
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
    const Nsibidi = mongooseConnection.model('Nsibidi', nsibidiSchema);
    const nsibidiCharacter = await Nsibidi.findById(id);
    return res.send(nsibidiCharacter.toJSON());
  } catch (err) {
    return next(err);
  }
};
