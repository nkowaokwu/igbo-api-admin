import { Connection, Types } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, compact } from 'lodash';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { exampleSchema } from 'src/backend/models/Example';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { staticNsibidiCharacters } from 'src/backend/shared/constants/NsibidiCharacters';
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
      .catch(() => {
        // console.log(err);
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
    const NsibidiCharacter = mongooseConnection.model<Interfaces.NsibidiCharacter>(
      'NsibidiCharacter',
      nsibidiCharacterSchema,
    );
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
    const NsibidiCharacter = mongooseConnection.model<Interfaces.NsibidiCharacter>(
      'NsibidiCharacter',
      nsibidiCharacterSchema,
    );
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

const deleteNsibidiCharactersHelper = async ({
  mongooseConnection,
  ids,
}: {
  mongooseConnection: Connection;
  ids: string[];
}) => {
  const NsibidiCharacter = mongooseConnection.model('NsibidiCharacter', nsibidiCharacterSchema);
  const nestedModels = [
    mongooseConnection.model<Interfaces.Word>('Word', wordSchema),
    mongooseConnection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema),
  ];
  const flatModels = [
    mongooseConnection.model<Interfaces.Example>('Example', exampleSchema),
    mongooseConnection.model<Interfaces.ExampleSuggestion>('ExampleSuggestion', exampleSuggestionSchema),
  ];

  await NsibidiCharacter.deleteMany({ _id: { $in: ids } });
  const objectIds = ids.map((id) => new Types.ObjectId(id));
  await Promise.all([
    ...nestedModels.map(async (Model) => {
      const docs = await Model.find({ 'definitions.nsibidiCharacters': { $in: objectIds } });
      await Promise.all(
        docs.map(async (doc) => {
          doc.definitions.forEach((_, index) => {
            doc.definitions[index].nsibidiCharacters = doc.definitions[index].nsibidiCharacters.filter(
              (nsibidiCharacter) => !ids.includes(nsibidiCharacter.toString()),
            );
          });
          await doc.save();
        }),
      );
    }),
    ...flatModels.map(async (Model) => {
      const docs = await Model.find({ nsibidiCharacters: { $in: objectIds } });
      await Promise.all(
        docs.map(async (doc) => {
          doc.nsibidiCharacters = doc.nsibidiCharacters.filter(
            (nsibidiCharacter) => !ids.includes(nsibidiCharacter.toString()),
          );
          await doc.save();
        }),
      );
    }),
  ]);
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

    await deleteNsibidiCharactersHelper({ mongooseConnection, ids: [id] });
    return res.send({ message: `Deleted Nsibidi character: ${id}` });
  } catch (err) {
    return next(err);
  }
};

/**
 * 🚨 Not to be called in production 🚨
 * Deletes all invalid NsibidiCharacters that include Latin characters or
 * have a length of 2 characters or longer
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteInvalidNsibidiCharacters = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<any> | void> => {
  const { mongooseConnection } = req;
  try {
    const NsibidiCharacter = mongooseConnection.model<Interfaces.NsibidiCharacter>(
      'NsibidiCharacter',
      nsibidiCharacterSchema,
    );
    const fetchedNsibidiCharacters = await NsibidiCharacter.find({ nsibidi: /.*/ });

    const cjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/;
    const notCjk = /[^\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/;

    const invalidNsibidiCharacterIds = fetchedNsibidiCharacters
      .filter(({ nsibidi }) => nsibidi.length !== 1 || nsibidi.match(notCjk))
      .map(({ id }: { id: string }) => id.toString());
    const validNsibidiCharacters = fetchedNsibidiCharacters.filter(
      ({ nsibidi }) => nsibidi.length === 1 && nsibidi.match(cjk),
    );
    // Deletes all the invalid Nsibidi Characters
    await deleteNsibidiCharactersHelper({ mongooseConnection, ids: invalidNsibidiCharacterIds });

    const newNsibidiCharacters = compact(
      staticNsibidiCharacters.map((nsibidi) => {
        if (!validNsibidiCharacters.find(({ nsibidi: validNsibidi }) => validNsibidi === nsibidi)) {
          return { nsibidi };
        }
        return null;
      }),
    );

    // Create new NsibidiCharacters
    await NsibidiCharacter.insertMany(newNsibidiCharacters);

    // const updatedNsibidiCharacters = await NsibidiCharacter.find({ nsibidi: /.*/ });
    // await connectNsibidiCharactersToDocuments({ mongooseConnection, nsibidiCharacters: updatedNsibidiCharacters });

    return res.send({ message: `Deleted ${invalidNsibidiCharacterIds.length} invalid Nsibidi characters` });
  } catch (err) {
    return next(err);
  }
};
