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
  searchRandomExampleSuggestionsRegexQuery,
  searchRandomExampleSuggestionsToReviewRegexQuery,
} from './utils/queries';
import * as Interfaces from './utils/interfaces';
import { sendRejectedEmail } from './email';
import { findUser } from './users';
import ReviewActions from '../shared/constants/ReviewActions';
import SentenceType from '../shared/constants/SentenceType';
import CrowdsourcingType from '../shared/constants/CrowdsourcingType';
import handleExampleSuggestionAudioPronunciations from './utils/handleExampleSuggestionAudioPronunciations';
import { wordSuggestionSchema } from '../models/WordSuggestion';

const NO_LIMIT = 20000;
export const createExampleSuggestion = async (
  data: Interfaces.ExampleClientData,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );
  try {
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        const query = searchPreExistingExampleSuggestionsRegexQuery({
          ...data,
          associatedWordId,
        });
        const identicalExampleSuggestions = await ExampleSuggestion.find(query);

        if (identicalExampleSuggestions.length) {
          const exampleSuggestionIds = map(
            identicalExampleSuggestions,
            (exampleSuggestion) => exampleSuggestion.id,
          );
          throw new Error(`There is already an existing example suggestion with the exact same information. 
          ExampleSuggestion id(s): ${exampleSuggestionIds}`);
        }
      }),
    );
  } catch (err) {
    console.log(err.message);
    throw err;
  }

  const newExampleSuggestion = new ExampleSuggestion(
    data,
  ) as Interfaces.ExampleSuggestion;
  return newExampleSuggestion.save().catch((err) => {
    console.log('what is the data', data, data.pronunciations);
    console.log(err.message);
    throw new Error(
      'An error has occurred while saving, double check your provided data',
    );
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
    const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);

    data.authorId = user.uid;
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        if (!(await Word.findById(associatedWordId))) {
          throw new Error(
            'Example suggestion associated words can only contain Word ids',
          );
        }
      }),
    );

    const createdExampleSuggestion = await createExampleSuggestion(
      data,
      mongooseConnection,
    );
    return res.send(createdExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const updateExampleSuggestion = ({
  id,
  data: clientData,
  mongooseConnection,
}: {
  id: string;
  data: Interfaces.ExampleSuggestion;
  mongooseConnection: Connection;
}): Promise<Interfaces.ExampleSuggestion | void> => {
  const data = assign(clientData) as Interfaces.ExampleClientData;
  delete data.authorId;
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );
  return ExampleSuggestion.findById(id).then(
    async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error("Example suggestion doesn't exist");
      }
      if (exampleSuggestion.merged) {
        throw new Error('Unable to edit a merged example suggestion');
      }

      handleExampleSuggestionAudioPronunciations({ exampleSuggestion, data });

      const updatedExampleSuggestion = assign(exampleSuggestion, data);
      return updatedExampleSuggestion.save();
    },
  );
};

/* Updates an existing ExampleSuggestion object */
export const putExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const {
      body: data,
      params: { id },
      mongooseConnection,
    } = req;
    const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        if (!(await Word.findById(associatedWordId)) && !(await WordSuggestion.findById(associatedWordId))) {
          throw new Error(
            'Example suggestion associated words can only contain Word ids',
          );
        }
      }),
    );

    const updatedExampleSuggestion = updateExampleSuggestion({
      id,
      data,
      mongooseConnection,
    });
    return res.send(await updatedExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};

export const findExampleSuggestionById = (
  id: string,
  mongooseConnection,
): Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );
  return ExampleSuggestion.findById(id);
};

/* Grabs ExampleSuggestions */
const findExampleSuggestions = ({
  query,
  skip = 0,
  limit = 10,
  mongooseConnection,
}: {
  query: any;
  skip?: number;
  limit?: number;
  mongooseConnection: Connection;
}): Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );

  return ExampleSuggestion.find(query)
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
    const query = searchExampleSuggestionsRegexQuery(
      user.uid,
      regexKeyword,
      filters,
    );
    const ExampleSuggestion = (
      mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      )
    );

    return findExampleSuggestions({
      query,
      skip,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: [Interfaces.ExampleSuggestion]) => (
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query,
          ...rest,
        })))
      .catch((err) => {
        console.log(err);
        throw new Error(
          'An error has occurred while returning example suggestions, double check your provided data',
        );
      });
  } catch (err) {
    return next(err);
  }
};

/* Returns at least five random example suggestions */
export const getRandomExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { limit, user, mongooseConnection } = await handleQueries(req);

    const query = searchRandomExampleSuggestionsRegexQuery(user.uid);
    const ExampleSuggestion = (
      mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      )
    );

    return await findExampleSuggestions({
      query,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => (
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query,
        })))
      .catch(() => {
        throw new Error(
          'An error has occurred while returning random example suggestions to edit',
        );
      });
  } catch (err) {
    return next(err);
  }
};

/* Bulk uploads examples suggestions for data dump */
export const postBulkUploadExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { body: data, mongooseConnection } = req;

    const ExampleSuggestion = (
      mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      )
    );

    const result = await Promise.all(
      data.map(async (sentenceData: Interfaces.ExampleClientData) => {
        const existingExampleSuggestion = await ExampleSuggestion.findOne({
          igbo: sentenceData.igbo,
        });
        if (existingExampleSuggestion) {
          return {
            success: false,
            message: 'There is an example suggestion with identical Igbo text',
            meta: { sentenceData },
          };
        }
        const exampleSuggestion = new ExampleSuggestion({
          ...sentenceData,
          type: sentenceData?.type || SentenceType.DATA_COLLECTION,
        });
        const savedExampleSuggestion = await exampleSuggestion.save();
        return {
          success: true,
          message: 'Success',
          meta: { sentenceData, id: savedExampleSuggestion._id },
        };
      }),
    );

    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

/* Returns at least five random example suggestions that need to be reviewed */
export const getRandomExampleSuggestionsToReview = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { limit, mongooseConnection } = await handleQueries(req);

    const query = searchRandomExampleSuggestionsToReviewRegexQuery();
    const ExampleSuggestion = (
      mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      )
    );

    return await findExampleSuggestions({
      query,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => (
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query,
        })))
      .catch((err) => {
        console.log(err);
        throw new Error(
          'An error has occurred while returning random example suggestions to review',
        );
      });
  } catch (err) {
    return next(err);
  }
};

/* Returns total number of example suggestions the user has approved or denied */
export const getTotalVerifiedExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const uid = uidQuery || user.uid;
  const query = {
    $or: [{ approvals: { $in: [uid] } }, { denials: { $in: [uid] } }],
  };

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => (
        res.send({ count: exampleSuggestions.length })
      ))
      .catch((err) => {
        console.log(err);
        throw new Error(
          'An error has occurred while returning all total verified example suggestions',
        );
      });
  } catch (err) {
    return next(err);
  }
};

/* Returns total number of example suggestions the user has recorded */
export const getTotalRecordedExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const uid = uidQuery || user.uid;
  const query = {
    userInteractions: { $in: [uid] },
    'denials.1': { $exists: false },
    pronunciation: { $regex: /^http/, $type: 'string' },
  };

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => (
        res.send({ count: exampleSuggestions.length })
      ))
      .catch((err) => {
        console.log(err);
        throw new Error(
          'An error has occurred while returning all total recorded example suggestions',
        );
      });
  } catch (err) {
    return next(err);
  }
};

/* Updates all listed example suggestions with audio pronunciations */
export const putRandomExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { user, body, mongooseConnection } = await handleQueries(req);
    const ExampleSuggestion = (
      mongooseConnection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      )
    );

    await Promise.all(
      body.map(async ({ id, pronunciation, review }) => {
        const exampleSuggestion = await ExampleSuggestion.findById(id);
        if (!exampleSuggestion) {
          console.log(`No example suggestion with the id: ${id}`);
          return null;
        }
        const userInteractions = new Set(exampleSuggestion.userInteractions);
        if (pronunciation) {
          exampleSuggestion.pronunciations.push({ audio: pronunciation, speaker: user.uid });
          console.log(`Pushed new pronunciation object to example suggestion ${id}`);

          // Only add uid to userInteractions for recording audio
          userInteractions.add(user.uid);
          exampleSuggestion.userInteractions = Array.from(userInteractions);
          exampleSuggestion.crowdsourcing[CrowdsourcingType.RECORD_EXAMPLE_AUDIO] = true;
        }
        if (review === ReviewActions.APPROVE) {
          const approvals = new Set(exampleSuggestion.approvals);
          approvals.add(user.uid);
          exampleSuggestion.approvals = Array.from(approvals);
          exampleSuggestion.denials = exampleSuggestion.denials.filter(
            (denial) => denial !== user.uid,
          );
          exampleSuggestion.crowdsourcing[CrowdsourcingType.VERIFY_EXAMPLE_AUDIO] = true;
        }
        if (review === ReviewActions.DENY) {
          const denials = new Set(exampleSuggestion.denials);
          denials.add(user.uid);
          exampleSuggestion.denials = Array.from(denials);
          exampleSuggestion.approvals = exampleSuggestion.approvals.filter(
            (approval) => approval !== user.uid,
          );
          exampleSuggestion.crowdsourcing[CrowdsourcingType.VERIFY_EXAMPLE_AUDIO] = true;
        }
        if (review === ReviewActions.SKIP) {
          console.log(
            `The user ${user.uid} skipped reviewing the word suggestion ${id}`,
          );
        }
        return exampleSuggestion.save();
      }),
    );
    return res.send(body.map(({ id }) => id));
  } catch (err) {
    return next(err);
  }
};

/* Returns a single ExampleSuggestion by using an id */
export const getExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const populatedUser = await findExampleSuggestionById(
      id,
      mongooseConnection,
    ).then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
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

export const removeExampleSuggestion = (
  id: string,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );

  return ExampleSuggestion.findByIdAndDelete(id)
    .then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error('No example suggestion exists with the provided id.');
      }
      const { email: userEmail } = ((await findUser(
        exampleSuggestion.authorId,
      ).catch((err) => {
        console.log(
          'Error with finding user while deleting example sentence',
          err,
        );
        return { email: '' };
      })) as Interfaces.FormattedUser) || { email: '' };
      /* Sends rejection email to user if they provided an email and the exampleSuggestion isn't merged */
      if (userEmail && !exampleSuggestion.merged) {
        sendRejectedEmail({
          to: [userEmail],
          suggestionType: SuggestionTypes.WORD,
          ...exampleSuggestion.toObject(),
        });
      }
      return exampleSuggestion;
    })
    .catch((err) => {
      console.log('Unable to delete example suggestion', err);
      throw new Error(
        'An error has occurred while deleting and return a single example suggestion',
      );
    });
};

/* Deletes a single ExampleSuggestion by using an id */
export const deleteExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    return res.send(await removeExampleSuggestion(id, mongooseConnection));
  } catch (err) {
    return next(err);
  }
};

/* Returns all the ExampleSuggestions from last week */
export const getExampleSuggestionsFromLastWeek = (
  mongooseConnection,
): Promise<any> => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );

  return ExampleSuggestion.find(searchForLastWeekQuery()).lean().exec();
};

export const getNonMergedExampleSuggestions = (
  mongooseConnection: Connection,
): Promise<any> => {
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );

  return ExampleSuggestion.find({ merged: null, exampleForSuggestion: false })
    .lean()
    .exec();
};

export const approveExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.ExampleSuggestion> | void> => {
  const {
    params: { id },
    user,
    mongooseConnection,
  } = req;
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );

  try {
    const exampleSuggestion = await ExampleSuggestion.findById(id);
    if (!exampleSuggestion) {
      throw new Error("Example suggestion doesn't exist");
    }
    const updatedApprovals = new Set(exampleSuggestion.approvals);
    const updatedDenials = exampleSuggestion.denials.filter(
      (uid) => uid !== user.uid,
    );
    updatedApprovals.add(user.uid);
    exampleSuggestion.approvals = Array.from(updatedApprovals);
    exampleSuggestion.denials = updatedDenials;
    const savedExampleSuggestion = await exampleSuggestion.save();
    // userInteractions doesn't get updated on approvals to currently track data collection
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
  const {
    params: { id },
    user,
    mongooseConnection,
  } = req;
  const ExampleSuggestion = (
    mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    )
  );

  try {
    const exampleSuggestion = await ExampleSuggestion.findById(id);
    if (!exampleSuggestion) {
      throw new Error("Example suggestion doesn't exist");
    }
    const updatedDenials = new Set(exampleSuggestion.denials);
    const updatedApprovals = exampleSuggestion.approvals.filter(
      (uid) => uid !== user.uid,
    );
    updatedDenials.add(user.uid);
    exampleSuggestion.denials = Array.from(updatedDenials);
    exampleSuggestion.approvals = updatedApprovals;
    const savedExampleSuggestion = await exampleSuggestion.save();
    // userInteractions doesn't get updated on denials to currently track data collection
    return res.send(savedExampleSuggestion);
  } catch (err) {
    return next(err);
  }
};
