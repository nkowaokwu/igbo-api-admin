import { Response, NextFunction } from 'express';
import { omit, map, merge } from 'lodash';
import moment from 'moment';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { packageResponse, handleQueries, populateFirebaseUsers } from 'src/backend/controllers/utils';
import {
  searchExampleAudioPronunciationsReviewedByUser,
  searchExampleSuggestionsRegexQuery,
  searchRandomExampleSuggestionsToRecordRegexQuery,
  searchRandomExampleSuggestionsToReviewRegexQuery,
} from 'src/backend/controllers/utils/queries';
import { searchRandomExampleSuggestionsToTranslateRegexQuery } from 'src/backend/controllers/utils/queries/queries';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import findExampleSuggestions from 'src/backend/controllers/exampleSuggestions/helpers/findExampleSuggestions';
import automaticallyMergeExampleSuggestion from 'src/backend/controllers/utils/automaticallyMergeExampleSuggestion';
import leanPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/leanPronunciation';
import isMergeableAudioPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/validation/isMergeableAudioPronunciation';
import isEligibleAudioPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/validation/isEligibleAudioPronunciation';
import isUserReviewedAudioPronunciation from 'src/backend/controllers/exampleSuggestions/helpers/validation/IsUserReviewedAudioPronunciation';
import getExampleSuggestionUpdateAt from 'src/backend/controllers/exampleSuggestions/helpers/getExampleSuggestionUpdateAt';
import createExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/createExampleSuggestion';
import updateExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/updateExampleSuggestion';
import removeExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/removeExampleSuggestion';
import findExampleSuggestionById from 'src/backend/controllers/exampleSuggestions/helpers/findExampleSuggestionById';

const NO_LIMIT = 20000;

type BulkUploadResult = {
  success: boolean;
  message: string;
  meta: { sentenceData: string; id?: string };
}[];

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
    const { body, user, mongooseConnection } = req;
    const { projectId } = req.query;
    const data = { ...body, projectId };
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
      body,
      params: { id },
      mongooseConnection,
    } = await handleQueries(req);
    const { projectId } = req.query;
    const data = { ...body, projectId };
    const Word = mongooseConnection.model<Interfaces.Word>('Word', wordSchema);
    const WordSuggestion = mongooseConnection.model('WordSuggestion', wordSuggestionSchema);
    await Promise.all(
      map(data.associatedWords, async (associatedWordId) => {
        if (
          !(await Word.findOne({ _id: associatedWordId, projectId })) &&
          !(await WordSuggestion.findOne({ _id: associatedWordId, projectId }))
        ) {
          throw new Error('Example suggestion associated words can only contain Word ids');
        }
      }),
    );

    const updatedExampleSuggestion = updateExampleSuggestion({
      id,
      projectId,
      data,
      mongooseConnection,
    });
    return res.send(await updatedExampleSuggestion);
  } catch (err) {
    return next(err);
  }
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
    const { projectId } = req.query;
    const query = searchExampleSuggestionsRegexQuery(user.uid, regexKeyword, projectId, filters);

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
      .catch(() => {
        // console.log(err);
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
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    // First searches for ExampleSuggestions that should be returned
    const query = searchRandomExampleSuggestionsToRecordRegexQuery(user.uid, projectId);
    const dbExampleSuggestions = await ExampleSuggestion.aggregate()
      .match(query)
      .addFields({ pronunciationsSize: { $size: '$pronunciations' } })
      .sample(limit);

    const exampleSuggestions = dbExampleSuggestions.map((exampleSuggestion) =>
      omit(merge(exampleSuggestion, { id: exampleSuggestion._id }), ['pronunciationsSize', '_id']),
    );

    return await packageResponse({
      res,
      docs: exampleSuggestions,
      model: ExampleSuggestion,
      query,
    });
  } catch (err) {
    // console.log(err);
    // console.error('An error has occurred while returning random example suggestions to edit');
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
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    const rawClientIgboSentences = data.map(({ igbo }) => igbo);
    const existingExampleSuggestions = await ExampleSuggestion.find({
      igbo: { $in: rawClientIgboSentences },
      projectId,
    });
    const rawExistingExampleSuggestions = existingExampleSuggestions.map(({ igbo }) => igbo);

    // Separate duplicated vs unique example sentences from UI
    const duplicatedExampleSuggestions = data.filter(({ igbo }) => rawExistingExampleSuggestions.includes(igbo));
    const uniqueExampleSuggestions = data.filter(({ igbo }) => !rawExistingExampleSuggestions.includes(igbo));

    const preparedExampleSuggestions = uniqueExampleSuggestions.map((sentenceData: Interfaces.ExampleClientData) => ({
      ...sentenceData,
      projectId,
      type: sentenceData?.type || SentenceTypeEnum.DATA_COLLECTION,
    }));
    // Bulk inserts all the example sentences
    const bulkInsertedExampleSuggestions = await ExampleSuggestion.insertMany(preparedExampleSuggestions);

    // Creates the result object to show detailed status to UI about success/failure while
    // bulk uploading
    const result: BulkUploadResult = bulkInsertedExampleSuggestions.map(({ _id, igbo }) => ({
      success: true,
      message: 'Success',
      meta: { sentenceData: igbo, id: _id },
    }));

    duplicatedExampleSuggestions.forEach(({ igbo }) => {
      result.push({
        success: false,
        message: 'There is an example suggestion with identical Igbo text',
        meta: { sentenceData: igbo },
      });
    });

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
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    const query = searchRandomExampleSuggestionsToReviewRegexQuery({
      uid: user.uid,
      projectId,
    });

    try {
      const dbExampleSuggestions = await ExampleSuggestion.aggregate()
        .match(query)
        .unwind('$pronunciations')
        .group({
          _id: '$_id',
          id: { $first: '$_id' },
          originalExampleId: { $first: '$originalExampleId' },
          source: { $first: '$source' },
          translations: { $first: '$translations' },
          meaning: { $first: '$meaning' },
          nsibidi: { $first: '$nsibidi' },
          nsibidiCharacters: { $first: '$nsibidiCharacters' },
          associatedWords: { $first: '$associatedWords' },
          associatedDefinitionsSchemas: { $first: '$associatedDefinitionsSchemas' },
          type: { $first: '$type' },
          style: { $first: '$style' },
          pronunciations: { $push: '$pronunciations' },
          editorsNotes: { $first: '$editorsNotes' },
          userComments: { $first: '$userComments' },
          authorEmail: { $first: '$authorEmail' },
          authorId: { $first: '$authorId' },
          approvals: { $first: '$approvals' },
          denials: { $first: '$denials' },
          origin: { $first: '$origin' },
          merged: { $first: '$merged' },
          mergedBy: { $first: '$mergedBy' },
          userInteractions: { $first: '$userInteractions' },
          crowdsourcing: { $first: '$crowdsourcing' },
          updatedAt: { $first: '$updatedAt' },
          createdAt: { $first: '$createdAt' },
          missingPronunciationApprovals: {
            $sum: {
              $cond: {
                if: { $lt: [{ $size: '$pronunciations.approvals' }, 2] },
                then: { $subtract: [2, { $size: '$pronunciations.approvals' }] },
                else: 0,
              },
            },
          },
          pronunciationApprovals: { $sum: { $size: '$pronunciations.approvals' } },
          pronunciationDenials: { $sum: { $size: '$pronunciations.denials' } },
        })
        .sort({ missingPronunciationApprovals: 1, updatedAt: 1 })
        .limit(limit);

      // console.log(dbExampleSuggestions[0]);
      // removes the field that don't live on the Example Suggestion model
      const exampleSuggestions = dbExampleSuggestions.map((exampleSuggestion) =>
        omit(exampleSuggestion, [
          'missingPronunciationApprovals',
          'pronunciationApprovals',
          'pronunciationsDenials',
          '_id',
        ]),
      );
      return await packageResponse({
        res,
        docs: exampleSuggestions,
        model: ExampleSuggestion,
        query,
      });
    } catch (err) {
      // console.log(err);
      throw new Error('An error has occurred while returning random example suggestions to review');
    }
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
    const { projectId } = req.query;
    const response = await Promise.all(
      data.map(async ({ id, english }) => {
        const res = await updateExampleSuggestion({
          id,
          projectId,
          data: {
            english,
            userInteractions: [user.uid],
            crowdsourcing: { [CrowdsourcingType.TRANSLATE_IGBO_SENTENCE]: true },
          },
          mongooseConnection,
        });
        // console.log('how does this work?>>', res);
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
    const { projectId } = req.query;

    const query = searchRandomExampleSuggestionsToTranslateRegexQuery(user.uid, projectId);
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
      .catch(() => {
        // console.log(err);
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
  const { projectId } = req.query;
  const uid = uidQuery || user.uid;
  const query = searchExampleAudioPronunciationsReviewedByUser({ uid, projectId });

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
        const timestampedReviewedExampleSuggestions = exampleSuggestions.reduce(
          (finalTimestampedExampleSuggestions, exampleSuggestion) => {
            // Gets the date and month of Example Suggestion
            const exampleSuggestionDate = getExampleSuggestionUpdateAt(exampleSuggestion);
            const exampleSuggestionMonth = moment(exampleSuggestionDate).startOf('month').format('MMM, YYYY');

            if (!finalTimestampedExampleSuggestions[exampleSuggestionMonth]) {
              finalTimestampedExampleSuggestions[exampleSuggestionMonth] = 0;
            }

            exampleSuggestion.pronunciations.forEach((dbPronunciation: Interfaces.PronunciationSchema) => {
              // Checks if current Example Suggestion pronunciation is verified and adds to total count if it is
              const pronunciation = leanPronunciation(dbPronunciation);
              const isUserReviewed = isUserReviewedAudioPronunciation({ pronunciation, uid });
              if (!finalTimestampedExampleSuggestions[exampleSuggestionMonth]) {
                finalTimestampedExampleSuggestions[exampleSuggestionMonth] = 0;
              }
              finalTimestampedExampleSuggestions[exampleSuggestionMonth] += Number(isUserReviewed);
            });
            return finalTimestampedExampleSuggestions;
          },
          {},
        );
        return res.send({ timestampedReviewedExampleSuggestions });
      })
      .catch(() => {
        // console.log(err);
        throw new Error('An error has occurred while returning all total verified example suggestions');
      });
  } catch (err) {
    return next(err);
  }
};

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
  const { projectId } = req.query;
  const uid = uidQuery || user.uid;
  const query = {
    'pronunciations.audio': { $regex: /^http/, $type: 'string' },
    'pronunciations.speaker': uid,
    'pronunciations.review': true,
    type: SentenceTypeEnum.DATA_COLLECTION,
    merged: { $ne: null },
    projectId: { $eq: projectId },
    // TODO: Remove updatedAt after fixing bug
    updatedAt: { $gte: moment('2024-01-01') },
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
      .catch(() => {
        // console.log(err);
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
  const { projectId } = req.query;
  const uid = uidQuery || user.uid;
  const query = {
    'denials.1': { $exists: false },
    'pronunciations.audio': { $regex: /^http/, $type: 'string' },
    'pronunciations.speaker': uid,
    'pronunciations.review': true,
    type: SentenceTypeEnum.DATA_COLLECTION,
    projectId: { $eq: projectId },
    // TODO: Remove updatedAt after fixing bug
    updatedAt: { $gte: moment('2024-01-01') },
  };

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
        const timestampedRecordedExampleSuggestions = exampleSuggestions.reduce(
          (finalTimestampedExampleSuggestions, exampleSuggestion) => {
            // Gets the date and month of Example Suggestion
            const exampleSuggestionDate = getExampleSuggestionUpdateAt(exampleSuggestion);
            const exampleSuggestionMonth = moment(exampleSuggestionDate).startOf('month').format('MMM, YYYY');

            exampleSuggestion.pronunciations.forEach((dbPronunciation) => {
              const pronunciation = leanPronunciation(dbPronunciation);
              const isEligible = isEligibleAudioPronunciation({ pronunciation, uid });
              if (!finalTimestampedExampleSuggestions[exampleSuggestionMonth]) {
                finalTimestampedExampleSuggestions[exampleSuggestionMonth] = 0;
              }
              finalTimestampedExampleSuggestions[exampleSuggestionMonth] += Number(isEligible);
            });
            return finalTimestampedExampleSuggestions;
          },
          {},
        );
        res.send({ timestampedRecordedExampleSuggestions });
      })
      .catch(() => {
        // console.log(err);
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
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    await Promise.all(
      body.map(async ({ id, pronunciation }) => {
        const exampleSuggestion = await ExampleSuggestion.findOne({ _id: id, projectId });
        if (!exampleSuggestion) {
          // console.log(`No example suggestion with the id: ${id}`);
          return null;
        }
        const userInteractions = new Set(exampleSuggestion.userInteractions || []);
        if (pronunciation) {
          // @ts-expect-error _id is missing
          exampleSuggestion.pronunciations.push({
            audio: pronunciation,
            speaker: user.uid,
            review: true,
            approvals: [],
            denials: [],
          });
          // console.log(`Pushed new pronunciation object to example suggestion ${id}`);

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
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    await Promise.all(
      body.map(async ({ id, reviews }) => {
        const exampleSuggestion = await ExampleSuggestion.findOne({ _id: id, projectId });
        if (!exampleSuggestion) {
          // console.log(`No example suggestion with the id: ${id}`);
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
            // console.log(`The user ${user.uid} skipped reviewing the word suggestion ${id}`);
          }
          return null;
        });
        const savedExampleSuggestion = await exampleSuggestion.save();

        // Automatically merge ExampleSuggestion
        await automaticallyMergeExampleSuggestion({
          exampleSuggestion: savedExampleSuggestion,
          mongooseConnection,
        }).catch(() => {
          // console.log(`Unable to automatically merge the Example Suggestion ${exampleSuggestion.id}:`, err.message);
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
    const { projectId } = req.query;
    const exampleSuggestion = await findExampleSuggestionById({ id, projectId, mongooseConnection }).then(
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
    return res.send(exampleSuggestion);
  } catch (err) {
    return next(err);
  }
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
    const { projectId } = req.query;
    return res.send(await removeExampleSuggestion({ id, projectId, mongooseConnection }));
  } catch (err) {
    return next(err);
  }
};

export const approveExampleSuggestion = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.ExampleSuggestion> | void> => {
  const {
    params: { id },
    query: { projectId },
    user,
    mongooseConnection,
  } = req;
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  try {
    const exampleSuggestion = await ExampleSuggestion.findOne({ _id: id, projectId });
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
    query: { projectId },
    user,
    mongooseConnection,
  } = req;
  const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
    'ExampleSuggestion',
    exampleSuggestionSchema,
  );

  try {
    const exampleSuggestion = await ExampleSuggestion.findOne({ _id: id, projectId });
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
