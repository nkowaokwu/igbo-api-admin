import { Response, NextFunction } from 'express';
import { assign } from 'lodash';
import { findAndUpdateWord } from './words';
import * as Interfaces from './utils/interfaces';
import WordSuggestion from '../models/WordSuggestion';
import {
  getExamplesFromClientData,
  updateNestedExampleSuggestions,
  placeExampleSuggestionsOnSuggestionDoc,
} from './utils/nestedExampleSuggestionUtils';
import { assignDefaultDialectValues, getWordSuggestions } from './wordSuggestions';

// Get only constructedTerms from the dictionary
export const getConstructedTerms = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    return await getWordSuggestions(req, res, next);
  } catch (err) {
    return next(err);
  }
};

export const postConstructedTerm = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data } = req;
    const { user } = req;
    if (data.id) {
      throw new Error('Cannot pass along an id for a new word suggestion');
    }
    if (!data.attributes.isConstructedTerm) {
      throw new Error('Word must be a constructed term');
    }
    data.authorId = user.uid;
    data.dialects = assignDefaultDialectValues(data);
    const clientExamples = getExamplesFromClientData(data);
    const newWordSuggestion = new WordSuggestion(data);
    const savedConstructedTerm: Document<Interfaces.WordSuggestion> = await newWordSuggestion.save()
      .then(async (wordSuggestion: Interfaces.WordSuggestion) => {
        await updateNestedExampleSuggestions({ suggestionDocId: wordSuggestion.id, clientExamples });
        return placeExampleSuggestionsOnSuggestionDoc(wordSuggestion);
      });
    return res.send(savedConstructedTerm);
  } catch (err) {
    return next(err);
  }
};

export const putConstructedTerm = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { body: data, params: { id } } = req;
    if (!data.word) {
      throw new Error('Required information is missing, double your provided data.');
    }
    if (!data.attributes.isConstructedTerm) {
      throw new Error('Word must be a constructed term');
    }
    const savedWord: Interfaces.Word = await findAndUpdateWord(id, (word) => {
      const updatedWord = assign(word, data);
      return updatedWord.save();
    });
    return res.send(savedWord);
  } catch (err) {
    return next(err);
  }
};
