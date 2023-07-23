import { Response, NextFunction } from 'express';
import { assign } from 'lodash';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
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
    const { searchWord, regexKeyword, mongooseConnection, skip, limit, ...rest } = handleQueries(req);

    // Loosely matches with an included Nsibidi character
    const regex = createRegExp(searchWord).wordReg;
    const query = {
      $or: [{ nsibidi: { $regex: regex } }, { pronunciation: { $regex: regex } }],
    };
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);

    return NsibidiCharacter.find(query)
      .skip(skip)
      .limit(limit)
      .then((nsibidiCharacters: Interfaces.NsibidiCharacter[]) =>
        packageResponse({
          res,
          docs: nsibidiCharacters,
          model: NsibidiCharacter,
          query,
          ...rest,
        }),
      )
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning Nsịbịdị characters, double check your provided data');
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
): Promise<any | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);
    const nsibidiCharacter = await NsibidiCharacter.findById(id);
    if (!nsibidiCharacter) {
      throw new Error("Nsibidi character doesn't exist");
    }
    return res.send(nsibidiCharacter.toJSON());
  } catch (err) {
    return next(err);
  }
};

/* Creates a new Nsibidi character */
export const postNsibidiCharacter = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { mongooseConnection, body } = req;
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);
    const nsibidiCharacter = new NsibidiCharacter(body);
    const savedNsibidiCharacter = await nsibidiCharacter.save();
    return res.send(savedNsibidiCharacter);
  } catch (err) {
    return next(err);
  }
};

/* Updates a single Nsibidi character */
export const putNsibidiCharacter = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const {
      mongooseConnection,
      params: { id },
      body,
    } = req;
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);
    const nsibidiCharacter = await NsibidiCharacter.findById(id);
    const updatedNsibidiCharacter = assign(nsibidiCharacter, body);
    Object.entries(body).forEach(([key, value]) => {
      updatedNsibidiCharacter[key] = value;
    });
    const savedNsibidiCharacter = await updatedNsibidiCharacter.save();
    return res.send(savedNsibidiCharacter);
  } catch (err) {
    return next(err);
  }
};

/**
 * Deletes NsibidiCharacters and any references to that character
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteNsibidiCharacter = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any> | void> => {
  try {
    const {
      params: { id },
      mongooseConnection,
    } = req;
    const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);
    const models = [
      mongooseConnection.model<Interfaces.Word>('Word', wordSchema),
      mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema),
      mongooseConnection.model<Interfaces.Example>('Example', exampleSchema),
      mongooseConnection.model<Interfaces.ExampleSuggestion>('ExampleSuggestion', exampleSuggestionSchema),
    ];

    await NsibidiCharacter.deleteOne({ _id: id });
    await Promise.all(
      models.map(async (Model) => {
        const docs = await Model.find({ nsibidiCharacters: { $in: [id] } });
        await Promise.all(
          docs.map(async (doc) => {
            doc.nsibidiCharacters = doc.nsibidiCharacters.filter(
              (nsibidiCharacter) => nsibidiCharacter.toString() !== id,
            );
            await doc.save();
          }),
        );
      }),
    );
    return res.send({ message: `Deleted Nsibidi character: ${id}` });
  } catch (err) {
    return next(err);
  }
};
