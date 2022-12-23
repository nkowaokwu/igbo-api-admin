import mongoose, { Document, Query } from 'mongoose';
import { Response, NextFunction } from 'express';
import {
  assign,
  some,
  map,
  trim,
  uniq,
} from 'lodash';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import { exampleSchema } from 'src/backend/models/Example';
import { wordSchema } from 'src/backend/models/Word';
import { deleteAudioPronunciation } from 'src/backend/controllers/utils/MediaAPIs/AudioAPI';
import SuggestionTypes from '../shared/constants/SuggestionTypes';
import { DICTIONARY_APP_URL } from '../config';
import { packageResponse, handleQueries, updateDocumentMerge } from './utils';
import { searchExamplesRegexQuery, searchForAssociatedSuggestions } from './utils/queries';
import { findExampleSuggestionById } from './exampleSuggestions';
import { sendMergedEmail } from './email';
import * as Interfaces from './utils/interfaces';

/* Create a new Example object in MongoDB */
export const createExample = (data: Interfaces.ExampleClientData, mongooseConnection): Promise<Document<any>> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  const example = new Example(data);
  return example.save();
};

/* Uses regex to search for examples with both Igbo and English */
const searchExamples = ({
  query,
  skip,
  limit,
  mongooseConnection,
}: {
  query: RegExp | any,
  skip: number,
  limit: number,
  mongooseConnection: any,
}) => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return (
    Example
      .find(query)
      .skip(skip)
      .limit(limit)
  );
};

/* Returns examples from MongoDB */
export const getExamples = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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
    const Example = mongooseConnection.model('Example', exampleSchema);
    const regexMatch = searchExamplesRegexQuery(user.uid, regexKeyword, filters);
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

export const findExampleById = (id: string, mongooseConnection)
: Query<Document<Interfaces.Example>, Document<Interfaces.Example>> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return (
    Example.findById(id)
  );
};

export const findExampleByAssociatedWordId = (id: string, mongooseConnection)
: Query<Document<Interfaces.Example>[], Document<Interfaces.Example>> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return (
    Example.find({ associatedWords: { $in: [id] } })
  );
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
    const foundExample = await findExampleById(id, mongooseConnection)
      .then((example) => {
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
  mongooseConnection: any,
): Promise<Interfaces.Example> => {
  const Example = mongooseConnection.model('Example', exampleSchema);
  return (
    Example.findOneAndUpdate({ _id: exampleSuggestion.originalExampleId }, exampleSuggestion.toObject())
      .then(async (example: Interfaces.Example) => {
        if (!example) {
          throw new Error('Example doesn\'t exist');
        }
        await updateDocumentMerge(exampleSuggestion, example.id, mergedBy);
        return example;
      })
  );
};

/* Creates a new Example document from an existing ExampleSuggestion document */
const createExampleFromSuggestion = (exampleSuggestion, mergedBy, mongooseConnection): Promise<Interfaces.Example> => (
  createExample(exampleSuggestion.toObject(), mongooseConnection)
    .then(async (example: Interfaces.Example) => {
      await updateDocumentMerge(exampleSuggestion, example.id, mergedBy);
      return example;
    })
    .catch((error) => {
      throw new Error(`An error occurred while saving the new example: ${error.message}`);
    })
);

/* Executes the logic describe the mergeExample function description */
export const executeMergeExample = async (
  exampleSuggestionId: string,
  mergedBy: string,
  mongooseConnection: any,
): Promise<Interfaces.Example> => {
  const exampleSuggestion: Interfaces.ExampleSuggestion = (
    await findExampleSuggestionById(exampleSuggestionId, mongooseConnection)
  );
  const Word = mongooseConnection.model('Word', wordSchema);

  if (!exampleSuggestion) {
    throw new Error('There is no associated example suggestion, double check your provided data');
  }

  if (!exampleSuggestion.igbo && !exampleSuggestion.english) {
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
const handleSendingMergedEmail = async (result, mongooseConnection): Promise<void> => {
  try {
    const Word = mongooseConnection.model('Word', wordSchema);
    if (result.authorEmail) {
      const word: Document<Interfaces.Word> | Record<string, unknown> = result.associatedWords[0]
        ? await Word.findById(result.associatedWords[0])
        : {};
      if (result.authorEmail) {
        sendMergedEmail({
          to: [result.authorEmail],
          suggestionType: SuggestionTypes.EXAMPLE,
          submissionLink: `${DICTIONARY_APP_URL}/word?word=${word.word}`,
          ...result,
        });
      }
    }
  } catch (err) {
    console.log(err.message);
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

    const exampleSuggestion = await findExampleSuggestionById(data.id, mongooseConnection);
    const result: Interfaces.Example = await executeMergeExample(exampleSuggestion.id, user.uid, mongooseConnection);
    await handleSendingMergedEmail({
      ...(result.toObject ? result.toObject() : result),
      authorEmail: exampleSuggestion.authorEmail,
      authorId: exampleSuggestion.authorId,
      editorsNotes: exampleSuggestion.editorsNotes,
    }, mongooseConnection);
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
    const { body: data, params: { id }, mongooseConnection } = req;

    if (!data.igbo && !data.english) {
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

    const savedExample = await findExampleById(id, mongooseConnection)
      .then(async (example: Interfaces.Example) => {
        if (!example) {
          throw new Error('Example doesn\'t exist');
        }
        const updatedExample = assign(example, data);
        return updatedExample.save();
      });
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
    const ExampleSuggestion = mongooseConnection.model('ExampleSuggestion', exampleSuggestionSchema);
    const wordSuggestions = await ExampleSuggestion.find(searchForAssociatedSuggestions(id));
    return res.send(wordSuggestions);
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
    const Example = mongooseConnection.model('Example', exampleSchema);
    const example = await Example.findById(exampleId) as Interfaces.Example;
    const isPronunciationMp3 = example.pronunciation && example.pronunciation.includes('.mp3');
    await deleteAudioPronunciation(exampleId, isPronunciationMp3);
    return res.send(true);
  } catch (err) {
    return next(err);
  }
};
