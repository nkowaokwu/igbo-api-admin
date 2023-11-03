import { Connection, Document, LeanDocument, Query } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, omit, map } from 'lodash';
import moment from 'moment';
import Joi from 'joi';
import SuggestionTypeEnum from 'src/backend/shared/constants/SuggestionTypeEnum';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { packageResponse, handleQueries, populateFirebaseUsers } from 'src/backend/controllers/utils';
import {
  searchExampleAudioPronunciationsReviewedByUser,
  searchExampleSuggestionsRegexQuery,
  searchForLastWeekQuery,
  searchPreExistingExampleSuggestionsRegexQuery,
  searchRandomExampleSuggestionsToRecordRegexQuery,
  searchRandomExampleSuggestionsToReviewRegexQuery,
} from 'src/backend/controllers/utils/queries';
import { searchRandomExampleSuggestionsToTranslateRegexQuery } from 'src/backend/controllers/utils/queries/queries';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { sendRejectedEmail } from 'src/backend/controllers/email';
import { findUser } from 'src/backend/controllers/users';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
// eslint-disable-next-line max-len
import handleExampleSuggestionAudioPronunciations from 'src/backend/controllers/utils/handleExampleSuggestionAudioPronunciations';
import findExampleSuggestions from 'src/backend/controllers/exampleSuggestions/helpers/findExampleSuggestions';
import automaticallyMergeExampleSuggestion from 'src/backend/controllers/utils/automaticallyMergeExampleSuggestion';
import { MINIMUM_APPROVALS, MINIMUM_DENIALS } from 'src/backend/shared/constants/Review';
import leanPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/leanPronunciation';

const NO_LIMIT = 20000;
/**
 * Creates and saves a new Example Suggestion in the database
 * @param data ExampleClientData
 * @param mongooseConnection Connection
 * @returns Newly created Example Suggestion document
 */
export const createExampleSuggestion = async (
  data: Interfaces.ExampleClientData,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  try {
    const query = searchPreExistingExampleSuggestionsRegexQuery(data);
    const identicalExampleSuggestions = await ExampleSuggestion.find(query);

    if (identicalExampleSuggestions.length) {
      const exampleSuggestionIds = map(identicalExampleSuggestions, (exampleSuggestion) => exampleSuggestion.id);
      console.log(`Existing ExampleSuggestion id(s): ${exampleSuggestionIds}`);
      throw new Error(
        'There is an existing Example Suggestion with the same Igbo text. Please edit the existing Example Suggestion',
      );
    }
  } catch (err) {
    console.log(err.message);
    throw err;
  }

  const newExampleSuggestion = new ExampleSuggestion(data) as Interfaces.ExampleSuggestion;
  return newExampleSuggestion.save().catch((err) => {
    console.log(err.message);
    throw new Error('An error has occurred while saving, double check your provided data');
  });
};

/**
 * Creates a new Example Suggestion document in the database
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Newly created EXample Suggestion document
 */
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

/**
 * Helper function that updates an Example Suggestion
 * @param param0
 * @returns Updated Example Suggestion
 */
export const updateExampleSuggestion = ({
  id,
  data: clientData,
  mongooseConnection,
}: {
  id: string;
  data: Partial<Interfaces.ExampleSuggestion>;
  mongooseConnection: Connection;
}): Promise<(Interfaces.ExampleSuggestion & Interfaces.ExampleClientData) | void> => {
  const data = assign(clientData) as Interfaces.ExampleClientData;
  delete data.authorId;
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  // @ts-expect-error
  return ExampleSuggestion.findById(id).then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
    if (!exampleSuggestion) {
      throw new Error("Example suggestion doesn't exist");
    }
    if (exampleSuggestion.merged) {
      throw new Error('Unable to edit a merged example suggestion');
    }

    await handleExampleSuggestionAudioPronunciations({ exampleSuggestion, data });

    // Properly handle merging
    Object.entries(data?.crowdsourcing || {}).forEach(([key, value]) => {
      exampleSuggestion.crowdsourcing[key] = value;
    });
    const updatedExampleSuggestion = assign(exampleSuggestion, omit(data, ['crowdsourcing']));

    // Updates the user interactions to include the current user
    const updatedUserInteractions = new Set(
      updatedExampleSuggestion.userInteractions.concat(data?.userInteractions || []),
    );
    updatedExampleSuggestion.userInteractions = Array.from(updatedUserInteractions);

    exampleSuggestion.markModified('crowdsourcing');
    return updatedExampleSuggestion.save();
  });
};

/**
 * Updates an existing Example Suggestion object
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Updated Example Suggestion document
 */
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
    } = await handleQueries(req);
    const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        if (!(await Word.findById(associatedWordId)) && !(await WordSuggestion.findById(associatedWordId))) {
          throw new Error('Example suggestion associated words can only contain Word ids');
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

/**
 * Finds a single Example Suggestion by its Id
 * @param id Id of the Example Suggestion
 * @param mongooseConnection Connection
 * @returns Single Example Suggestion
 */
export const findExampleSuggestionById = (
  id: string,
  mongooseConnection: Connection,
): Query<any, Document<Interfaces.ExampleSuggestion>> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );
  return ExampleSuggestion.findById(id);
};

/* Returns all existing ExampleSuggestion objects */
/**
 * Returns specified Example Suggestion objects from the database
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns All specified Example Suggestion objects from the database
 */
export const getExampleSuggestions = (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> | void => {
  try {
    const { regexKeyword, skip, limit, filters, user, mongooseConnection, ...rest } = handleQueries(req);
    const query = searchExampleSuggestionsRegexQuery(user.uid, regexKeyword, filters);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    return findExampleSuggestions({
      query,
      skip,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: [Interfaces.ExampleSuggestion]) =>
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query,
          ...rest,
        }),
      )
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning example suggestions, double check your provided data');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Returns at least five random Example Suggestions to have audio recorded
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns At least five random Example Suggestions to have audio recorded
 */
export const getRandomExampleSuggestionsToRecord = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { limit, user, mongooseConnection } = await handleQueries(req);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    let exampleSuggestions: Interfaces.ExampleSuggestion[] = [];

    // First searches for ExampleSuggestions that should be returned
    const query = searchRandomExampleSuggestionsToRecordRegexQuery(user.uid);
    exampleSuggestions = await findExampleSuggestions({
      query,
      limit,
      mongooseConnection,
    }).catch(() => {
      throw new Error('An error has occurred while returning random example suggestions to edit');
    });

    return await packageResponse({
      res,
      docs: exampleSuggestions,
      model: ExampleSuggestion,
      query,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Bulk uploads Example Suggestion for data dump
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Array of uploaded Example Suggestions from bulk uploading
 */
export const postBulkUploadExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { body: data, mongooseConnection } = req;

    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
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
          type: sentenceData?.type || SentenceTypeEnum.DATA_COLLECTION,
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

/**
 * Returns at least five random Example Suggestions that need to be reviewed
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns At least five random Example Suggestion that need to be reviewed by the current user
 */
export const getRandomExampleSuggestionsToReview = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { limit, user, mongooseConnection } = await handleQueries(req);

    const query = searchRandomExampleSuggestionsToReviewRegexQuery(user.uid);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    return await findExampleSuggestions({
      query,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) =>
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query,
        }),
      )
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning random example suggestions to review');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Updates at least five random Example Suggestions with English translations
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
export const putRandomExampleSuggestionsToTranslate = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { body: data, mongooseConnection, user } = await handleQueries(req);

    const response = await Promise.all(
      data.map(async ({ id, english }) => {
        const res = await updateExampleSuggestion({
          id,
          data: {
            english,
            userInteractions: [user.uid],
            crowdsourcing: { [CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]: true },
          },
          mongooseConnection,
        });
        console.log('how does this work?>>', res);
        return res;
      }),
    );
    req.response = response;
    return next();
  } catch (err) {
    return next(err);
  }
};
/**
 * Returns at least five random Example Suggestion that need to be translated into English
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns At least five random Example Suggestion that need to be reviewed by the current user
 */
export const getRandomExampleSuggestionsToTranslate = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { limit, user, mongooseConnection } = await handleQueries(req);

    const query = searchRandomExampleSuggestionsToTranslateRegexQuery(user.uid);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    return await findExampleSuggestions({
      query,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) =>
        packageResponse({
          res,
          docs: exampleSuggestions,
          model: ExampleSuggestion,
          query,
        }),
      )
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning random example suggestions to translate');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Returns total number of Example Suggestions the user has approved or denied
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Total number of Example Suggestions the user has approved or denied
 */
export const getTotalReviewedExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const uid = uidQuery || user.uid;
  const query = searchExampleAudioPronunciationsReviewedByUser({ uid });

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => res.send({ count: exampleSuggestions.length }))
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning all total verified example suggestions');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Determines if the current audio pronunciation is mergeable (i.e. complete)
 * @param param0 pronunciation and uid
 * @returns Boolean if the audio pronunciation is mergeable
 */
export const isMergeableAudioPronunciation = ({
  pronunciation,
  uid,
}: {
  pronunciation: Interfaces.PronunciationData;
  uid: string;
}): boolean => {
  const pronunciationSchema = Joi.object().keys({
    approvals: Joi.array().min(MINIMUM_APPROVALS).items(Joi.string().allow('', null)),
    denials: Joi.array().max(MINIMUM_DENIALS).items(Joi.string().allow('', null)),
    audio: Joi.string().pattern(new RegExp('^http')).required(),
    speaker: Joi.string().valid(uid).required(),
    review: Joi.boolean().valid(true).required(),
    archived: Joi.boolean().valid(false).optional(),
  });

  const validation = pronunciationSchema.validate(pronunciation, { abortEarly: false });
  if (validation.error) {
    console.log(validation.error);
    return false;
  }
  return true;
};

/**
 * Determines if the current audio pronunciation is a valid recording, eligible to be merged
 * @param param0 pronunciation and uid
 * @returns Boolean if the audio pronunciation is a valid recording
 */
export const isEligibleAudioPronunciation = ({
  pronunciation,
  uid,
}: {
  pronunciation: Interfaces.PronunciationData;
  uid: string;
}): boolean => {
  const pronunciationSchema = Joi.object().keys({
    approvals: Joi.array().min(0).items(Joi.string().allow('', null)),
    denials: Joi.array().max(MINIMUM_DENIALS).items(Joi.string().allow('', null)),
    audio: Joi.string().pattern(new RegExp('^http')).required(),
    speaker: Joi.string().valid(uid).required(),
    review: Joi.boolean().valid(true).required(),
    archived: Joi.boolean().valid(false).optional(),
  });

  const validation = pronunciationSchema.validate(pronunciation, { abortEarly: false });
  if (validation.error) {
    console.log(validation.error);
    return false;
  }
  return true;
};

/**
 * Returns the Example Suggestion's date
 * @param exampleSuggestion Example Suggestion
 * @returns Date of Example Suggestion
 */
export const getExampleSuggestionUpdateAt = (exampleSuggestion: LeanDocument<Interfaces.ExampleSuggestion>): string =>
  exampleSuggestion.updatedAt.toISOString
    ? exampleSuggestion.updatedAt.toISOString()
    : exampleSuggestion.updatedAt.toString();

/**
 * Returns total number of Example Suggestions the user has recorded that have been merged
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Total number of merged Example Suggestion the user has recorded that have been merged
 */
export const getTotalMergedRecordedExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const uid = uidQuery || user.uid;
  const query = {
    'pronunciations.audio': { $regex: /^http/, $type: 'string' },
    'pronunciations.speaker': uid,
    'pronunciations.review': true,
    type: SentenceTypeEnum.DATA_COLLECTION,
    merged: { $ne: null },
  };

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
        const timestampedExampleSuggestions = exampleSuggestions.reduce(
          (finalTimestampedExampleSuggestions, exampleSuggestion) => {
            // Gets the date and month of Example Suggestion
            const exampleSuggestionDate = getExampleSuggestionUpdateAt(exampleSuggestion);
            const exampleSuggestionMonth = moment(exampleSuggestionDate).startOf('month').format('MMM, YYYY');

            exampleSuggestion.pronunciations.forEach((dbPronunciation: Interfaces.PronunciationSchema) => {
              // Checks if current Example Suggestion pronunciation is verified and adds to total count if it is
              const pronunciation = leanPronunciation(dbPronunciation);
              const isMergeable = isMergeableAudioPronunciation({ pronunciation, uid });
              if (!finalTimestampedExampleSuggestions[exampleSuggestionMonth]) {
                finalTimestampedExampleSuggestions[exampleSuggestionMonth] = 0;
              }
              finalTimestampedExampleSuggestions[exampleSuggestionMonth] += Number(isMergeable);
            });

            return finalTimestampedExampleSuggestions;
          },
          {},
        );
        return res.send({ timestampedExampleSuggestions });
      })
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning all total recorded example suggestions');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Returns total number of Example Suggestions the user has recorded
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Total number of merged Example Suggestion the user has recorded
 */
export const getTotalRecordedExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const uid = uidQuery || user.uid;
  const query = {
    'denials.1': { $exists: false },
    'pronunciations.audio': { $regex: /^http/, $type: 'string' },
    'pronunciations.speaker': uid,
    'pronunciations.review': true,
    type: SentenceTypeEnum.DATA_COLLECTION,
  };

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
        let audioPronunciationCount = 0;
        exampleSuggestions.forEach((exampleSuggestion) => {
          exampleSuggestion.pronunciations.forEach((dbPronunciation) => {
            const pronunciation = leanPronunciation(dbPronunciation);
            const isEligible = isEligibleAudioPronunciation({ pronunciation, uid });
            audioPronunciationCount += Number(isEligible);
          });
        });
        res.send({ count: audioPronunciationCount });
      })
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning all total recorded example suggestions');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Adds a new audio recording to the Example Suggestion
 * @param req Request
 * @param res Response
 * @param next Next
 * @returns An array of ids of Example Suggestions with newly recorded audio
 */
export const putAudioForRandomExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { user, body, mongooseConnection } = await handleQueries(req);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    await Promise.all(
      body.map(async ({ id, pronunciation }) => {
        const exampleSuggestion = await ExampleSuggestion.findById(id);
        if (!exampleSuggestion) {
          console.log(`No example suggestion with the id: ${id}`);
          return null;
        }
        const userInteractions = new Set(exampleSuggestion.userInteractions);
        if (pronunciation) {
          // @ts-expect-error _id is missing
          exampleSuggestion.pronunciations.push({
            audio: pronunciation,
            speaker: user.uid,
            review: true,
            approvals: [],
            denials: [],
          });
          console.log(`Pushed new pronunciation object to example suggestion ${id}`);

          // Only add uid to userInteractions for recording audio
          userInteractions.add(user.uid);
          exampleSuggestion.userInteractions = Array.from(userInteractions);
          exampleSuggestion.crowdsourcing[CrowdsourcingType.RECORD_EXAMPLE_AUDIO] = true;
        }
        return exampleSuggestion.save();
      }),
    );
    req.response = body.map(({ id }) => id);
    return next();
  } catch (err) {
    req.error = err;
    return next(err);
  }
};

/**
 * Applies a review for each Example Suggestion's audio pronunciation
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns A response with an array of ids of reviewed Example Suggestions
 */
export const putReviewForRandomExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { user, body, mongooseConnection } = await handleQueries(req);
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    await Promise.all(
      body.map(async ({ id, reviews }) => {
        const exampleSuggestion = await ExampleSuggestion.findById(id);
        if (!exampleSuggestion) {
          console.log(`No example suggestion with the id: ${id}`);
          return null;
        }

        Object.entries(reviews).forEach(([pronunciationId, review]) => {
          const pronunciationIndex = exampleSuggestion.pronunciations.findIndex(
            (pronunciation) => pronunciation._id.toString() === pronunciationId,
          );
          if (pronunciationIndex === -1) {
            return null;
          }

          const audioPronunciation = exampleSuggestion.pronunciations[pronunciationIndex];

          // Handle approving the Example Suggestion audio pronunciations
          if (review === ReviewActions.APPROVE) {
            const approvals = new Set(audioPronunciation.approvals);
            approvals.add(user.uid);
            exampleSuggestion.pronunciations[pronunciationIndex].approvals = Array.from(approvals);
            exampleSuggestion.pronunciations[pronunciationIndex].denials = audioPronunciation.denials.filter(
              (denial) => denial !== user.uid,
            );
            exampleSuggestion.crowdsourcing[CrowdsourcingType.VERIFY_EXAMPLE_AUDIO] = true;
          }
          // Handle denying the Example Suggestion audio pronunciations
          if (review === ReviewActions.DENY) {
            const denials = new Set(audioPronunciation.denials);
            denials.add(user.uid);
            exampleSuggestion.pronunciations[pronunciationIndex].denials = Array.from(denials);
            exampleSuggestion.pronunciations[pronunciationIndex].approvals = audioPronunciation.approvals.filter(
              (approval) => approval !== user.uid,
            );
            exampleSuggestion.crowdsourcing[CrowdsourcingType.VERIFY_EXAMPLE_AUDIO] = true;
          }
          if (review === ReviewActions.SKIP) {
            console.log(`The user ${user.uid} skipped reviewing the word suggestion ${id}`);
          }
          return null;
        });
        const savedExampleSuggestion = await exampleSuggestion.save();

        // Automatically merge ExampleSuggestion
        await automaticallyMergeExampleSuggestion({
          exampleSuggestion: savedExampleSuggestion,
          mongooseConnection,
        }).catch((err) => {
          console.log(`Unable to automatically merge the Example Suggestion ${exampleSuggestion.id}:`, err.message);
        });
        return null;
      }),
    );
    req.response = body.map(({ id }) => id);
    return next();
  } catch (err) {
    req.error = err;
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
    const populatedUser = await findExampleSuggestionById(id, mongooseConnection).then(
      async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
        if (!exampleSuggestion) {
          throw new Error('No example suggestion exists with the provided id.');
        }
        const populatedUserExampleSuggestion = await populateFirebaseUsers(exampleSuggestion.toObject(), [
          'approvals',
          'denials',
        ]);
        return populatedUserExampleSuggestion;
      },
    );
    return res.send(populatedUser);
  } catch (err) {
    return next(err);
  }
};

export const removeExampleSuggestion = (
  id: string,
  mongooseConnection: Connection,
): Promise<Interfaces.ExampleSuggestion> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.findByIdAndDelete(id)
    .then(async (exampleSuggestion: Interfaces.ExampleSuggestion) => {
      if (!exampleSuggestion) {
        throw new Error('No example suggestion exists with the provided id.');
      }
      const { email: userEmail } = ((await findUser(exampleSuggestion.authorId).catch((err) => {
        console.log('Error with finding user while deleting example sentence', err);
        return { email: '' };
      })) as Interfaces.FormattedUser) || { email: '' };
      /* Sends rejection email to user if they provided an email and the exampleSuggestion isn't merged */
      if (userEmail && !exampleSuggestion.merged) {
        sendRejectedEmail({
          to: [userEmail],
          suggestionType: SuggestionTypeEnum.WORD,
          ...exampleSuggestion.toObject(),
        });
      }
      return exampleSuggestion;
    })
    .catch((err) => {
      console.log('Unable to delete example suggestion', err);
      throw new Error('An error has occurred while deleting and return a single example suggestion');
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
export const getExampleSuggestionsFromLastWeek = (mongooseConnection: Connection): Promise<any> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.find(searchForLastWeekQuery()).lean().exec();
};

export const getNonMergedExampleSuggestions = (mongooseConnection: Connection): Promise<any> => {
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  return ExampleSuggestion.find({ merged: null, exampleForSuggestion: false }).lean().exec();
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
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  try {
    const exampleSuggestion = await ExampleSuggestion.findById(id);
    if (!exampleSuggestion) {
      throw new Error("Example suggestion doesn't exist");
    }
    const updatedApprovals = new Set(exampleSuggestion.approvals);
    const updatedDenials = exampleSuggestion.denials.filter((uid) => uid !== user.uid);
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
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  try {
    const exampleSuggestion = await ExampleSuggestion.findById(id);
    if (!exampleSuggestion) {
      throw new Error("Example suggestion doesn't exist");
    }
    const updatedDenials = new Set(exampleSuggestion.denials);
    const updatedApprovals = exampleSuggestion.approvals.filter((uid) => uid !== user.uid);
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
