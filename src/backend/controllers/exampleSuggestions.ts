import { Connection, Document, Query } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, map } from 'lodash';
import SuggestionTypes from '../shared/constants/SuggestionTypes';
import { wordSchema } from '../models/Word';
import { exampleSuggestionSchema } from '../models/ExampleSuggestion';
import { packageResponse, handleQueries, populateFirebaseUsers } from './utils';
import {
  searchExampleSuggestionsRegexQuery,
  searchForLastWeekQuery,
  searchPreExistingExampleSuggestionsRegexQuery,
} from './utils/queries';
import * as Interfaces from './utils/interfaces';
import { sendRejectedEmail } from './email';
import { findUser } from './users';

export const createExampleSuggestion = async (
  data: Interfaces.ExampleClientData,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  try {
    await Promise.all(map(data.associatedWords, async (associatedWordId) => {
      const query = searchPreExistingExampleSuggestionsRegexQuery({ ...data, associatedWordId });
      const identicalExampleSuggestions = await ExampleSuggestion.find(query);

      if (identicalExampleSuggestions.length) {
        const exampleSuggestionIds = map(identicalExampleSuggestions, (exampleSuggestion) => exampleSuggestion.id);
        throw new Error(`There is already an existing example suggestion with the exact same information. 
          ExampleSuggestion id(s): ${exampleSuggestionIds}`);
      }
    }));
  } catch (err) {
    console.log(err.message);
    throw err;
  }

  const newExampleSuggestion = new ExampleSuggestion(data) as Interfaces.ExampleSuggestion;
  return newExampleSuggestion.save()
    .catch(() => {
      throw new Error('An error has occurred while saving, double check your provided data');
    });
};

/* Creates a new ExampleSuggestion document in the database */
export const postExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { body: data, user, mongooseConnection } = req;
    const Word = mongooseConnection.model('Word', wordSchema);

    data.authorId = user.uid;
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        if (!(await Word.findById(associatedWordId))) {
          throw new Error('Example suggestion associated words can only contain Word ids');
        }
      }),
    );

    const createdExampleSuggestion = await createExampleSuggestion(data, mongooseConnection);
    return res.send(createdExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};

/* Finds and applies the first definition schema ids for the associated words to the Example Suggestion */
// const applyAssociatedDefinitionSchemas = (
//   async (exampleSuggestion: Interfaces.ExampleSuggestion): Promise<Interfaces.ExampleSuggestion> => {
//     const updatedExampleSuggestion = assign(exampleSuggestion);
//     const wordSuggestions: Interfaces.WordSuggestion[] = (
//       await WordSuggestion.find({ _id: exampleSuggestion.associatedWords })
//     );
//     if (!updatedExampleSuggestion.associatedDefinitionsSchemas) {
//       updatedExampleSuggestion.associatedDefinitionsSchemas = [];
//     }
//     const definitionSchemas = compact(wordSuggestions.map((wordSuggestion) => (
//       get(wordSuggestion, 'definitions[0]._id')
//     )));
//     updatedExampleSuggestion.associatedDefinitionsSchemas = definitionSchemas;
//     return updatedExampleSuggestion;
//   }
// );

export const updateExampleSuggestion = (
  { id, data: clientData, mongooseConnection }
  : { id: string, data: Interfaces.ExampleSuggestion, mongooseConnection: any },
): Promise<Interfaces.ExampleSuggestion | void> => {
  const data = assign(clientData);
  delete data.authorId;
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  return ExampleSuggestion.findById(id)
    .then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error('Example suggestion doesn\'t exist');
      }
      if (exampleSuggestion.merged) {
        throw new Error('Unable to edit a merged example suggestion');
      }
      const updatedExampleSuggestion = assign(exampleSuggestion, data);
      if (
        !updatedExampleSuggestion.associatedDefinitionsSchemas
        || !updatedExampleSuggestion.associatedDefinitionsSchemas.length
      ) {
        // updatedExampleSuggestion = await applyAssociatedDefinitionSchemas(updatedExampleSuggestion);
      }
      return updatedExampleSuggestion.save();
    })
    .catch((err) => {
      throw err;
    });
};

/* Updates an existing ExampleSuggestion object */
export const putExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
) : Promise<any> => {
  try {
    const { body: data, params: { id }, mongooseConnection } = req;
    const Word = mongooseConnection.model('Word', wordSchema);
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        if (!(await Word.findById(associatedWordId))) {
          throw new Error('Example suggestion associated words can only contain Word ids');
        }
      }),
    );

    const updatedExampleSuggestion = updateExampleSuggestion({ id, data, mongooseConnection });
    return res.send(await updatedExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const findExampleSuggestionById = (id: string, mongooseConnection)
: Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
  return (
    ExampleSuggestion.findById(id)
  );
};

/* Grabs ExampleSuggestions */
const findExampleSuggestions = (
  {
    regexMatch,
    skip,
    limit,
    mongooseConnection,
  }:
  { regexMatch: RegExp, skip: number, limit: number, mongooseConnection: any },
): Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

  return ExampleSuggestion
    .find(regexMatch)
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });
};

/* Returns all existing ExampleSuggestion objects */
export const getExampleSuggestions = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> | void => {
  try {
    const {
      regexKeyword,
      skip,
      limit,
      filters,
      user,
      mongooseConnection,
      ...rest
    } = handleQueries(req);
    const regexMatch = searchExampleSuggestionsRegexQuery(user.uid, regexKeyword, filters);
    const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

    return findExampleSuggestions({
      regexMatch,
      skip,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: [Interfaces.ExampleSuggestion]) => (
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query: regexMatch,
          ...rest,
        })
      ))
      .catch(() => {
        throw new Error('An error has occurred while return example suggestions, double check your provided data');
      });
  } catch (err) {
    return next(err);
  }
};

/* Returns a single ExampleSuggestion by using an id */
export const getExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
) : Promise<any> | void => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const populatedUser = await findExampleSuggestionById(id, mongooseConnection)
      .then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
        if (!exampleSuggestion) {
          throw new Error('No example suggestion exists with the provided id.');
        }
        const populatedUserExampleSuggestion = await populateFirebaseUsers(
          exampleSuggestion.toObject(),
          ['approvals', 'denials'],
        );
        return populatedUserExampleSuggestion;
      });
    return res.send(populatedUser);
  } catch (err) {
    return next(err);
  }
};

export const removeExampleSuggestion = (id: string, mongooseConnection): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

  return (
    ExampleSuggestion.findByIdAndDelete(id)
      .then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
        if (!exampleSuggestion) {
          throw new Error('No example suggestion exists with the provided id.');
        }
        const { email: userEmail } = (
          (await findUser(exampleSuggestion.authorId) as Interfaces.FormattedUser)
          || { email: '' }
        );
        /* Sends rejection email to user if they provided an email and the exampleSuggestion isn't merged */
        if (userEmail && !exampleSuggestion.merged) {
          sendRejectedEmail({
            to: [userEmail],
            suggestionType: SuggestionTypes.WORD,
            ...(exampleSuggestion.toObject()),
          });
        }
        return exampleSuggestion;
      })
      .catch(() => {
        throw new Error('An error has occurred while deleting and return a single example suggestion');
      })
  );
};

/* Deletes a single ExampleSuggestion by using an id */
export const deleteExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
) : Promise<any> | void => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    return res.send(await removeExampleSuggestion(id, mongooseConnection));
  } catch (err) {
    return next(err);
  }
};

/* Returns all the ExampleSuggestions from last week */
export const getExampleSuggestionsFromLastWeek = (mongooseConnection): Promise<any> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

  return ExampleSuggestion
    .find(searchForLastWeekQuery())
    .lean()
    .exec();
};

export const getNonMergedExampleSuggestions = (mongooseConnection): Promise<any> => {
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

  return ExampleSuggestion
    .find({ merged: null, exampleForSuggestion: false })
    .lean()
    .exec();
};

export const approveExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.ExampleSuggestion> | void> => {
  const { params: { id }, user, mongooseConnection } = req;
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

  try {
    const exampleSuggestion = await ExampleSuggestion.findById(id);
    if (!exampleSuggestion) {
      throw new Error('Example suggestion doesn\'t exist');
    }
    const updatedApprovals = new Set(exampleSuggestion.approvals);
    const updatedDenials = exampleSuggestion.denials.filter((uid) => uid !== user.uid);
    updatedApprovals.add(user.uid);
    exampleSuggestion.approvals = Array.from(updatedApprovals);
    exampleSuggestion.denials = updatedDenials;
    const savedExampleSuggestion = await exampleSuggestion.save();
    return res.send(savedExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const denyExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.ExampleSuggestion> | void> => {
  const { params: { id }, user, mongooseConnection } = req;
  const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);

  try {
    const exampleSuggestion = await ExampleSuggestion.findById(id);
    if (!exampleSuggestion) {
      throw new Error('Example suggestion doesn\'t exist');
    }
    const updatedDenials = new Set(exampleSuggestion.denials);
    const updatedApprovals = exampleSuggestion.approvals.filter((uid) => uid !== user.uid);
    updatedDenials.add(user.uid);
    exampleSuggestion.denials = Array.from(updatedDenials);
    exampleSuggestion.approvals = updatedApprovals;
    const savedExampleSuggestion = await exampleSuggestion.save();
    return res.send(savedExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};
