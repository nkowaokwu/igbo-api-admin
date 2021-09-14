import mongoose, { Document, Query } from 'mongoose';
import { Request, Response, NextFunction } from 'functions/node_modules/@types/express';
import {
  assign,
  some,
  map,
  trim,
  uniq,
} from 'lodash';
import Example from '../models/Example';
import Word from '../models/Word';
import SuggestionTypes from '../shared/constants/SuggestionTypes';
import { DICTIONARY_APP_URL } from '../config';
import { packageResponse, handleQueries, updateDocumentMerge } from './utils';
import { searchExamplesRegexQuery, searchForAssociatedSuggestions } from './utils/queries';
import { findExampleSuggestionById } from './exampleSuggestions';
import { sendMergedEmail } from './email';
import * as Interfaces from './utils/interfaces';
import ExampleSuggestion from '../models/ExampleSuggestion';

/* Create a new Example object in MongoDB */
export const createExample = (data: Interfaces.ExampleClientData): Promise<Document<any>> => {
  const example = new Example(data);
  return example.save();
};

/* Uses regex to search for examples with both Igbo and English */
const searchExamples = ({ query, skip, limit }: { query: RegExp | any, skip: number, limit: number }) => (
  Example
    .find(query)
    .skip(skip)
    .limit(limit)
);

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
      ...rest
    } = handleQueries(req);
    const regexMatch = searchExamplesRegexQuery(regexKeyword);
    const examples = await searchExamples({ query: regexMatch, skip, limit });

    return packageResponse({
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

export const findExampleById = (id: string)
: Query<Document<Interfaces.Example>, Document<Interfaces.Example>> => (
  Example.findById(id)
);

export const findExampleByAssociatedWordId = (id: string)
: Query<Document<Interfaces.Example>[], Document<Interfaces.Example>> => (
  Example.find({ associatedWords: { $in: [id] } })
);

/* Returns an example from MongoDB using an id */
export const getExample = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const foundExample = await findExampleById(id)
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
): Promise<Interfaces.Example> => (
  Example.findOneAndUpdate({ _id: exampleSuggestion.originalExampleId }, exampleSuggestion.toObject())
    .then(async (example: Interfaces.Example) => {
      if (!example) {
        throw new Error('Example doesn\'t exist');
      }
      await updateDocumentMerge(exampleSuggestion, example.id, mergedBy);
      return example;
    })
);

/* Creates a new Example document from an existing ExampleSuggestion document */
const createExampleFromSuggestion = (exampleSuggestion, mergedBy): Promise<Interfaces.Example> => (
  createExample(exampleSuggestion.toObject())
    .then(async (example: Interfaces.Example) => {
      await updateDocumentMerge(exampleSuggestion, example.id, mergedBy);
      return example;
    })
    .catch(() => {
      throw new Error('An error occurred while saving the new example.');
    })
);

/* Executes the logic describe the mergeExample function description */
export const executeMergeExample = async (
  exampleSuggestionId: string,
  mergedBy: string,
): Promise<Interfaces.Example> => {
  const exampleSuggestion: Interfaces.ExampleSuggestion = await findExampleSuggestionById(exampleSuggestionId);

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
    ? mergeIntoExample(exampleSuggestion, mergedBy)
    : createExampleFromSuggestion(exampleSuggestion, mergedBy);
};

/* Sends confirmation merged email to user if they provided an email */
const handleSendingMergedEmail = async (result): Promise<void> => {
  try {
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data } = req;
    const { user } = req;

    const exampleSuggestion = await findExampleSuggestionById(data.id);
    const result: Interfaces.Example = await executeMergeExample(exampleSuggestion.id, user.uid);
    await handleSendingMergedEmail({
      ...(result.toObject ? result.toObject() : result),
      authorEmail: exampleSuggestion.authorEmail,
      authorId: exampleSuggestion.authorId,
      editorsNotes: exampleSuggestion.editorsNotes,
    });
    return res.send(result);
  } catch (err) {
    return next(err);
  }
};

/* Updates an Example document in the database */
export const putExample = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data, params: { id } } = req;

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

    const savedExample = await findExampleById(id)
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const wordSuggestions = await ExampleSuggestion.find(searchForAssociatedSuggestions(id));
    return res.send(wordSuggestions);
  } catch (err) {
    return next(err);
  }
};
