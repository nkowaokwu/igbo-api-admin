import mongoose, { Connection, Document } from 'mongoose';
import { Response, NextFunction } from 'express';
import { assign, some, map, trim, uniq } from 'lodash';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { exampleSchema } from 'src/backend/models/Example';
import { wordSchema } from 'src/backend/models/Word';
import { deleteAudioPronunciation } from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import { DICTIONARY_APP_URL } from 'src/backend/config';
import { isPronunciationMp3, getPronunciationId } from 'src/backend/shared/utils/splitAudioUrl';
import findExampleSuggestionById from 'src/backend/controllers/exampleSuggestions/helpers/findExampleSuggestionById';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import searchExamples from 'src/backend/controllers/examples/helpers/searchExamples';
import findExampleById from 'src/backend/controllers/examples/helpers/findExampleById';
import SuggestionTypeEnum from 'src/backend/shared/constants/SuggestionTypeEnum';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import { searchExamplesRegexQuery, searchForAssociatedExampleSuggestions } from 'src/backend/controllers/utils/queries';
import createExampleFromSuggestion from 'src/backend/controllers/examples/helpers/createExampleFromSuggestion';
import { packageResponse, handleQueries, updateDocumentMerge } from '../utils';
import { sendMergedEmail } from '../email';

/**
 *
 * @param param0
 * @returns Returns all Examples in a given project
 */
export const getExamplesHelper = ({
  mongooseConnection,
  projectId,
}: {
  mongooseConnection: Connection;
  projectId: string;
}): Promise<Interfaces.Example[]> => {
  const Example = mongooseConnection.model('Example', exampleSchema);

  return Example.find({ projectId });
};

/* Returns examples from MongoDB */
export const getExamples = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { regexKeyword, skip, limit, filters, user, mongooseConnection, ...rest } = handleQueries(req);
    const { query } = req;
    const { projectId } = query;
    const Example = mongooseConnection.model('Example', exampleSchema);
    const regexMatch = searchExamplesRegexQuery(regexKeyword, filters, projectId);
    const examples = await searchExamples({
      query: regexMatch,
      skip,
      limit,
      mongooseConnection,
    });

    return await packageResponse({
      res,
      docs: examples,
      model: Example,
      query: regexMatch,
      ...rest,
    });
  } catch (err) {
    return next(err);
  }
};

/* Returns an example from MongoDB using an id */
export const getExample = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const foundExample = await findExampleById({ id, projectId, mongooseConnection }).then((example) => {
      if (!example) {
        throw new Error('No example exists with the provided id.');
      }
      return example;
    });
    return res.send(foundExample);
  } catch (err) {
    return next(err);
  }
};

/* Merges new data into an existing Example document */
const mergeIntoExample = (
  exampleSuggestion: Interfaces.ExampleSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Interfaces.Example> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return Example.findOneAndUpdate({ _id: exampleSuggestion.originalExampleId }, exampleSuggestion.toObject()).then(
    async (example: Interfaces.Example) => {
      if (!example) {
        throw new Error("Example doesn't exist");
      }
      const updatedExample = updateDocumentMerge(exampleSuggestion, example.id.toString(), mergedBy);
      return updatedExample.save();
    },
  );
};

/* Executes the logic describe the mergeExample function description */
export const executeMergeExample = async (
  exampleSuggestion: Interfaces.ExampleSuggestion,
  mergedBy: string,
  mongooseConnection: Connection,
): Promise<Interfaces.Example> => {
  const Word = mongooseConnection.model('Word', wordSchema);

  if (!exampleSuggestion) {
    throw new Error('There is no associated example suggestion, double check your provided data');
  }

  if (!exampleSuggestion.source && !exampleSuggestion.translations) {
    throw new Error('Required information is missing, double check your provided data');
  }

  if (some(exampleSuggestion.associatedWords, (associatedWord) => !mongoose.Types.ObjectId.isValid(associatedWord))) {
    throw new Error('Invalid id found in associatedWords');
  }

  await Promise.all(
    map(exampleSuggestion.associatedWords, async (associatedWordId) => {
      if (!(await Word.findById(associatedWordId))) {
        throw new Error('Example suggestion associated words can only contain Word ids before merging');
      }
    }),
  );

  if (exampleSuggestion.associatedWords.length !== uniq(exampleSuggestion.associatedWords).length) {
    throw new Error('Duplicates are not allows in associated words');
  }

  return exampleSuggestion.originalExampleId
    ? mergeIntoExample(exampleSuggestion, mergedBy, mongooseConnection)
    : createExampleFromSuggestion(exampleSuggestion, mergedBy, mongooseConnection);
};

/* Sends confirmation merged email to user if they provided an email */
const handleSendingMergedEmail = async (
  result: Interfaces.ExampleSuggestionData & {
    authorEmail: string;
    word: Interfaces.WordData;
    associatedWords: string[];
  },
  mongooseConnection,
): Promise<void> => {
  try {
    const Word = mongooseConnection.model('Word', wordSchema);
    if (result.authorEmail) {
      const word: Document<Interfaces.Word> | Record<string, unknown> = result.associatedWords[0]
        ? await Word.findById(result.associatedWords[0])
        : {};
      if (result.authorEmail) {
        sendMergedEmail({
          to: [result.authorEmail],
          suggestionType: SuggestionTypeEnum.EXAMPLE,
          submissionLink: `${DICTIONARY_APP_URL}/word?word=${word.word}`,
          ...result,
        });
      }
    }
  } catch (err) {
    // console.log(err.message);
  }
};

/* Merges the existing ExampleSuggestion into either a brand
 * new Example document or merges into an existing Example document */
export const mergeExample = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data, user, mongooseConnection } = req;
    const { projectId } = req.query;

    const exampleSuggestion = await findExampleSuggestionById({ id: data.id, projectId, mongooseConnection });
    const result: Interfaces.Example = await executeMergeExample(exampleSuggestion, user.uid, mongooseConnection);
    await handleSendingMergedEmail(
      {
        ...(result.toObject ? result.toObject() : result),
        authorEmail: exampleSuggestion.authorEmail,
        authorId: exampleSuggestion.authorId,
        editorsNotes: exampleSuggestion.editorsNotes,
      },
      mongooseConnection,
    );
    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

/* Updates an Example document in the database */
export const putExample = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      body: data,
      params: { id },
      query: { projectId },
      mongooseConnection,
    } = req;

    if (!data.source?.text && !data.translations?.[0]?.text) {
      return next(new Error('Required information is missing, double check your provided data'));
    }

    if (!Array.isArray(data.associatedWords)) {
      data.associatedWords = map(data.associatedWords.split(','), (associatedWord) => trim(associatedWord));
    }

    if (some(data.associatedWords, (associatedWord) => !mongoose.Types.ObjectId.isValid(associatedWord))) {
      return next(new Error('Invalid id found in associatedWords'));
    }

    if (data.associatedWords && data.associatedWords.length !== uniq(data.associatedWords).length) {
      return next(new Error('Duplicates are not allows in associated words'));
    }

    const savedExample = await findExampleById({ id, projectId, mongooseConnection }).then(
      async (example: Interfaces.Example) => {
        if (!example) {
          throw new Error("Example doesn't exist");
        }
        const updatedExample = assign(example, data);
        return updatedExample.save();
      },
    );
    return res.send(savedExample);
  } catch (err) {
    return next(err);
  }
};

/* Grabs all Example Suggestions that are associated with a Example document */
export const getAssociatedExampleSuggestions = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id } = req.params;
    const { projectId } = req.query;
    const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
    const exampleSuggestions = await ExampleSuggestion.find(searchForAssociatedExampleSuggestions(id, projectId));
    return res.send(exampleSuggestions);
  } catch (err) {
    return next(err);
  }
};

/* Deletes the specified Example document */
export const deleteExample = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { mongooseConnection } = req;
    const { id: exampleId } = req.params;
    const { projectId } = req.query;
    const Example = mongooseConnection.model('Example', exampleSchema);
    const example = (await Example.findOne({ _id: exampleId, projectId })) as Interfaces.Example;
    await Promise.all(
      example.pronunciations.map(async (pronunciation) => {
        const isAudioMp3 = isPronunciationMp3(pronunciation.audio);
        const pronunciationId = getPronunciationId(pronunciation.audio);
        await deleteAudioPronunciation(pronunciationId, isAudioMp3);
      }),
    );
    return res.send(true);
  } catch (err) {
    return next(err);
  }
};

/* Bulk uploads examples for data dump */
export const postBulkUploadExamples = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<any | void> => {
  try {
    const { body: data, mongooseConnection } = req;
    const { projectId } = req.query;

    const Example = mongooseConnection.model('Example', exampleSchema);

    const result = await Promise.all(
      data.map(async (sentenceData: Interfaces.ExampleClientData) => {
        const existingExample = await Example.findOne({ igbo: sentenceData.igbo, projectId });
        if (existingExample) {
          return {
            success: false,
            message: 'There is an pre-existing, identical Igbo sentence in this project',
            meta: { sentenceData },
          };
        }
        const example = new Example({
          ...sentenceData,
          type: sentenceData?.type || SentenceTypeEnum.DATA_COLLECTION,
          projectId,
        });
        const savedExample = await example.save();
        return {
          success: true,
          message: 'Success',
          meta: { sentenceData, id: savedExample._id },
        };
      }),
    );

    return res.send(result);
  } catch (err) {
    return next(err);
  }
};
