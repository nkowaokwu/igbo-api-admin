import { Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import { omit, map, merge, assign } from 'lodash';
import moment from 'moment';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { packageResponse, handleQueries, populateFirebaseUsers } from 'src/backend/controllers/utils';
import {
  searchExampleSuggestionsRegexQuery,
  searchRandomExampleSuggestionsToRecordRegexQuery,
  searchRandomExampleSuggestionsToReviewRegexQuery,
  searchTotalRecordedExampleSuggestionsForUser,
} from 'src/backend/controllers/utils/queries';
import {
  searchRandomExampleSuggestionsToReviewTranslationsRegexQuery,
  searchRandomExampleSuggestionsToTranslateRegexQuery,
  searchTotalTranslationsOnExampleSuggestionsForUser,
} from 'src/backend/controllers/utils/queries/queries';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import ReviewActions from 'src/backend/shared/constants/ReviewActions';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';
import findExampleSuggestions from 'src/backend/controllers/exampleSuggestions/helpers/findExampleSuggestions';
import automaticallyMergeExampleSuggestion from 'src/backend/controllers/utils/automaticallyMergeExampleSuggestion';
import createExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/createExampleSuggestion';
import updateExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/updateExampleSuggestion';
import removeExampleSuggestion from 'src/backend/controllers/exampleSuggestions/helpers/removeExampleSuggestion';
import findExampleSuggestionById from 'src/backend/controllers/exampleSuggestions/helpers/findExampleSuggestionById';
import { Translation } from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import isEligibleTranslation from 'src/backend/controllers/exampleSuggestions/helpers/validation/isEligibleTranslation';
import leanTranslation from 'src/backend/controllers/exampleSuggestions/helpers/leanTranslation';
import handleReviewingResources from 'src/backend/controllers/exampleSuggestions/helpers/handleReviewingResources';
import handleSentenceRecordingCount from 'src/backend/controllers/exampleSuggestions/helpers/handleSentenceRecordingCount';

const NO_LIMIT = 20000;
const TIMESTAMP_FORMAT = 'MMM, YYYY';

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
    const query = searchExampleSuggestionsRegexQuery(regexKeyword, projectId, filters);

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
    const { projectId, languages: rawLanguages = '' } = req.query;
    const languages = rawLanguages.split(',');
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    // First searches for ExampleSuggestions that should be returned
    const query = searchRandomExampleSuggestionsToRecordRegexQuery(user.uid, projectId, languages);

    const dbExampleSuggestions = await ExampleSuggestion.aggregate()
      .match(query)
      .addFields({ pronunciationsSize: { $size: '$source.pronunciations' } })
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
    const { body, mongooseConnection } = req;
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );
    const data: { source: { text: string; language: LanguageEnum } }[] = body;

    const rawClientSentences = data.map(({ source }) => source.text);
    const existingExampleSuggestions = await ExampleSuggestion.find({
      'source.text': { $in: rawClientSentences },
      projectId,
    });
    const rawExistingExampleSuggestions = existingExampleSuggestions.map(({ source }) => source.text);

    // Separate duplicated vs unique example sentences from UI
    const duplicatedExampleSuggestions = data.filter(({ source }) =>
      rawExistingExampleSuggestions.includes(source.text),
    );
    const uniqueExampleSuggestions = data.filter(({ source }) => !rawExistingExampleSuggestions.includes(source.text));

    const preparedExampleSuggestions = uniqueExampleSuggestions.map((sentenceData: Interfaces.ExampleClientData) => ({
      ...sentenceData,
      projectId,
      type: SentenceTypeEnum.DATA_COLLECTION,
    }));
    // Bulk inserts all the example sentences
    const bulkInsertedExampleSuggestions = await ExampleSuggestion.insertMany(preparedExampleSuggestions);

    // Creates the result object to show detailed status to UI about success/failure while
    // bulk uploading
    const result: BulkUploadResult = bulkInsertedExampleSuggestions.map(({ _id, source }) => ({
      success: true,
      message: 'Success',
      meta: { sentenceData: source.text, id: _id },
    }));

    duplicatedExampleSuggestions.forEach(({ source }) => {
      result.push({
        success: false,
        message: 'There is an example suggestion with identical Igbo text',
        meta: { sentenceData: { text: source.text } },
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
    const {
      userProjectPermission: { languages },
    } = req;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    const query = searchRandomExampleSuggestionsToReviewRegexQuery({
      uid: user.uid,
      projectId,
      languages,
    });

    try {
      const dbExampleSuggestions = await ExampleSuggestion.find(query).limit(limit);
      const exampleSuggestions = dbExampleSuggestions.map((dbExampleSuggestion) => dbExampleSuggestion.toJSON());

      return await packageResponse({
        res,
        docs: exampleSuggestions,
        model: ExampleSuggestion,
        query,
      });
    } catch (err) {
      throw new Error('An error has occurred while returning random example suggestions to review');
    }
  } catch (err) {
    return next(err);
  }
};

/**
 * ProjectType.TRANSLATE
 */

/**
 * Returns at least five random Example Suggestion that need to be translated into a user's
 * spoken languages
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
    const { userProjectPermission } = req;

    const query = searchRandomExampleSuggestionsToTranslateRegexQuery({
      uid: user.uid,
      projectId,
      languages: userProjectPermission.languages,
    });

    return await findExampleSuggestions({
      query,
      limit,
      mongooseConnection,
    })
      .then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
        const filteredExampleSuggestions = exampleSuggestions
          .map((exampleSuggestion) => {
            // Reduce translations to include translations that only the current user would understand
            exampleSuggestion.translations = exampleSuggestion.translations.filter(({ language }) =>
              userProjectPermission.languages.includes(language),
            );
            return exampleSuggestion;
          })
          .filter(
            // If all the translations for the ExampleSuggestion match all the languages for the current user
            // then don't return the ExampleSuggestion
            (exampleSuggestion) => exampleSuggestion.translations.length !== userProjectPermission.languages.length,
          )
          .map((exampleSuggestion) => exampleSuggestion.toJSON());

        return res.send({ exampleSuggestions: filteredExampleSuggestions });
      })
      .catch((err) => {
        console.log(err);
        throw new Error('An error has occurred while returning random example suggestions to translate:', err.message);
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * Fetches up to five random ExampleSuggestions that the current user
 * will review the translations for
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
export const getRandomExampleSuggestionForTranslationReview = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ exampleSuggestions: Interfaces.ExampleSuggestion[] }> | void> => {
  try {
    const {
      user: { uid },
      mongooseConnection,
    } = req;
    const { projectId } = req.query;
    const { userProjectPermission } = req;

    const query = searchRandomExampleSuggestionsToReviewTranslationsRegexQuery({
      uid,
      projectId,
      languages: userProjectPermission.languages,
    });

    return await findExampleSuggestions({
      query,
      limit: 5,
      mongooseConnection,
    }).then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
      const filteredExampleSuggestions = exampleSuggestions
        .map((exampleSuggestion) => {
          exampleSuggestion.translations = exampleSuggestion.translations.filter(({ language }) =>
            userProjectPermission.languages.includes(language),
          );
          return exampleSuggestion.toJSON();
        })
        .filter((exampleSuggestion) => exampleSuggestion.translations.length)
        .map((exampleSuggestion) => {
          // Only show translations the user has not reviewed
          exampleSuggestion.translations = exampleSuggestion.translations.filter(
            (translation) => !translation.approvals.includes(uid) && !translation.denials.includes(uid),
          );
          return exampleSuggestion;
        });
      return res.send({ exampleSuggestions: filteredExampleSuggestions });
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
    const { projectId } = req.query;
    const updatedExampleSuggestions = await Promise.all(
      data.map(async ({ id, translations }: { id: string; translations: Translation[] }) => {
        const exampleSuggestion = await findExampleSuggestionById({ id, projectId, mongooseConnection });
        const exampleSuggestionTranslations = assign(exampleSuggestion.translations);

        translations.forEach(({ text, language, pronunciations }) => {
          exampleSuggestionTranslations.push({
            text,
            language,
            pronunciations: pronunciations.map(({ audio }) => ({
              audio,
              speaker: user.uid,
              review: true,
              approvals: [],
              denials: [],
              archived: false,
            })),
            approvals: [],
            denials: [],
            authorId: user.uid,
          });
        });
        exampleSuggestion.translations = exampleSuggestionTranslations;
        exampleSuggestion.markModified('translations');
        return exampleSuggestion.save();
      }),
    );

    return res.send({ exampleSuggestions: updatedExampleSuggestions });
  } catch (err) {
    return next(err);
  }
};

/**
 * Updates all Example Suggestions with provided review for translations
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Updated Example Suggestions
 */
export const putRandomExampleSuggestionReviewsForTranslation = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ exampleSuggestions: Interfaces.ExampleSuggestion[] }> | void> => {
  try {
    const { mongooseConnection, user, body: data } = req;
    const { projectId } = req.query;

    const updatedExampleSuggestions = await Promise.all(
      data.map(async ({ id, translations }: { id: string; translations: { id: string; review: ReviewActions }[] }) => {
        const exampleSuggestion = await findExampleSuggestionById({ id, projectId, mongooseConnection });
        Object.values(translations).forEach(({ id: translationId, review }) => {
          const translation = exampleSuggestion.translations.find(
            (translation) => translation?._id?.toString() === translationId,
          );
          if (!translation) {
            throw new Error('Invalid translation Id has been used to find an existing translation Id on the sentence.');
          }

          handleReviewingResources({ uid: user.uid, resource: translation, review, documentId: id });
        });
        exampleSuggestion.markModified('translations');
        return exampleSuggestion.save();
      }),
    );
    return res.send({ exampleSuggestions: updatedExampleSuggestions });
  } catch (err) {
    return next(err);
  }
};

/**
 * Returns total number of Example Suggestions the user has recorded
 * per month
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Total number of recorded audio on Example Suggestions
 */
export const getUserExampleSuggestionRecordings = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const { projectId } = req.query;
  const uid = uidQuery || user.uid;
  const query = searchTotalRecordedExampleSuggestionsForUser({ uid, projectId });
  const timestampedExampleSuggestions = {
    [moment().startOf('month').format(TIMESTAMP_FORMAT)]: { count: 0, bytes: 0 },
  };

  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    })
      .then(async (exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
        await Promise.all(
          exampleSuggestions.map(async (exampleSuggestion) => {
            await Promise.all(
              exampleSuggestion.source.pronunciations.map(async (pronunciation) => {
                await handleSentenceRecordingCount({
                  pronunciation,
                  uid,
                  final: timestampedExampleSuggestions,
                  mongooseConnection,
                });
              }),
            );
            await Promise.all(
              exampleSuggestion.translations.map(async (translation) => {
                await Promise.all(
                  translation.pronunciations.map(async (pronunciation) => {
                    await handleSentenceRecordingCount({
                      pronunciation,
                      uid,
                      final: timestampedExampleSuggestions,
                      mongooseConnection,
                    });
                  }),
                );
              }),
            );
          }),
        );
        res.send({ timestampedExampleSuggestions });
      })
      .catch(() => {
        throw new Error('An error has occurred while returning all total recorded example suggestions');
      });
  } catch (err) {
    return next(err);
  }
};

/**
 * returns total number of Example Suggestion translations the user has recorded
 * per month
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Total number of translations on an Example Suggestion
 */
export const getUserExampleSuggestionTranslations = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { user, mongooseConnection, uidQuery } = await handleQueries(req);
  const { projectId } = req.query;
  const uid = uidQuery || user.uid;
  const query = searchTotalTranslationsOnExampleSuggestionsForUser({ uid, projectId });

  const incrementCount = ({
    translation: dbTranslation,
    final,
  }: {
    translation: Document<Interfaces.Translation>;
    final: { [key: string]: number };
  }) => {
    const translationSuggestionMonth = moment(dbTranslation.updatedAt).startOf('month').format(TIMESTAMP_FORMAT);
    const translation = leanTranslation(dbTranslation.toJSON());
    const isEligible = isEligibleTranslation({ translation, uid });
    if (!final[translationSuggestionMonth]) {
      final[translationSuggestionMonth] = 0;
    }
    final[translationSuggestionMonth] += Number(isEligible);
  };
  try {
    return await findExampleSuggestions({
      query,
      limit: NO_LIMIT,
      mongooseConnection,
    }).then((exampleSuggestions: Interfaces.ExampleSuggestion[]) => {
      const timestampedExampleSuggestions = exampleSuggestions.reduce(
        (finalTimestampedExampleSuggestions, exampleSuggestion) => {
          exampleSuggestion.translations.forEach((translation: Document<Interfaces.Translation>) => {
            incrementCount({
              translation,
              final: finalTimestampedExampleSuggestions,
            });
          });
          return finalTimestampedExampleSuggestions;
        },
        { [moment().startOf('month').format(TIMESTAMP_FORMAT)]: 0 },
      );
      res.send({ timestampedExampleSuggestions });
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
): Promise<Response<{ ids: string[] }> | void> => {
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
          return null;
        }
        const userInteractions = new Set(exampleSuggestion.userInteractions || []);
        if (pronunciation) {
          // @ts-expect-error _id is missing
          exampleSuggestion.source.pronunciations.push({
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
    return res.send({ id: body.map(({ id }) => id) });
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
): Promise<Response<{ ids: string[] }> | void> => {
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
          const pronunciationIndex = exampleSuggestion.source.pronunciations.findIndex(
            (pronunciation) => pronunciation._id.toString() === pronunciationId,
          );
          if (pronunciationIndex === -1) {
            return null;
          }

          const audioPronunciation = exampleSuggestion.source.pronunciations[pronunciationIndex];

          handleReviewingResources({ uid: user.uid, resource: audioPronunciation, review, documentId: id });
          if (review === ReviewActions.APPROVE || review === ReviewActions.DENY) {
            exampleSuggestion.crowdsourcing[CrowdsourcingType.VERIFY_EXAMPLE_AUDIO] = true;
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
    return res.send({ ids: body.map(({ id }) => id) });
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

/**
 * Bulk deletes up to 100 Example Suggestions
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Success message
 */
export const bulkDeleteExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ success: boolean }> | void> => {
  try {
    const { mongooseConnection } = req;
    const { projectId } = req.query;
    const ids = req.body;
    const ExampleSuggestion = mongooseConnection.model<Interfaces.ExampleSuggestion>(
      'ExampleSuggestion',
      exampleSuggestionSchema,
    );

    const result = await ExampleSuggestion.deleteMany({ _id: { $in: ids }, projectId, merged: null });
    console.log('Deleted Example Suggestions: ', result);

    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};
