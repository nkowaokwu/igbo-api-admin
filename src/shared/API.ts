import { Record } from 'react-admin';
import {
  Corpus,
  Example,
  ExampleSuggestionData,
  NsibidiCharacter,
  Word,
  WordSuggestion,
} from 'src/backend/controllers/utils/interfaces';
import { ExampleTranscriptionFeedbackData } from 'src/backend/controllers/utils/interfaces/exampleTranscriptionFeedbackInterfaces';
import network from '../Core/Dashboard/network';
import type { Poll } from '../backend/shared/types/Poll';
import Collection from './constants/Collection';
import { request } from './utils/request';

const handleSubmitConstructedTermPoll = (poll: Poll) =>
  request({
    method: 'POST',
    url: 'twitter_poll',
    data: poll,
  });

export const getWord = async (id: string, { dialects } = { dialects: true }): Promise<Word> => {
  const { data: result } = await request({
    method: 'GET',
    url: `${Collection.WORDS}/${id}?dialects=${dialects}`,
  });
  return result;
};

export const getWords = async (word: string): Promise<Word[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.WORDS}?keyword=${word}`,
    })
  ).data;

export const getWordSuggestions = async (word: string): Promise<any> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.WORD_SUGGESTIONS}?keyword=${word}`,
    })
  ).data;

export const getExample = async (id: string): Promise<Example[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.EXAMPLES}/${id}`,
    })
  ).data;

export const getExamples = async (word: string): Promise<Example[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.EXAMPLES}?keyword=${word}`,
    })
  ).data;

export const getExampleSuggestions = async (word: string): Promise<ExampleSuggestionData[]> =>
  (
    await request<ExampleSuggestionData[]>({
      method: 'GET',
      url: `${Collection.EXAMPLE_SUGGESTIONS}?keyword=${word}`,
    })
  ).data;

export const getExampleTranscriptionFeedback = async (
  exampleSuggestionId: string,
): Promise<ExampleTranscriptionFeedbackData> =>
  (
    await request<ExampleTranscriptionFeedbackData>({
      method: 'GET',
      url: `${Collection.EXAMPLE_TRANSCRIPTION_FEEDBACK}/${exampleSuggestionId}`,
    })
  ).data;

export const getNsibidiCharacter = async (id: string): Promise<NsibidiCharacter> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.NSIBIDI_CHARACTERS}/${id}`,
    })
  ).data;

export const getNsibidiCharacters = async (nsibidi: string): Promise<NsibidiCharacter[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.NSIBIDI_CHARACTERS}?keyword=${nsibidi}`,
    })
  ).data;

export const getCorpus = async (id: string): Promise<Corpus> => {
  const { data: result } = await request({
    method: 'GET',
    url: `${Collection.CORPORA}/${id}`,
  });
  return result;
};

export const resolveWord = async (wordId: string): Promise<Word> => {
  const wordRes = await getWord(wordId, { dialects: true }).catch(async () => {
    /**
     * If there is a regular word string (not a MongoDB Id) then the platform
     * will search the Igbo API and find the matching word and insert
     * that word's id
     */

    const { json: wordsResults } = await network(`/words?keyword=${wordId}`);
    const fallbackWord = wordsResults.find(({ word }) => word.normalize('NFD') === wordId.normalize('NFD'));
    return fallbackWord;
  });
  return wordRes;
};

export const resolveNsibidiCharacter = async (nsibidiCharacterId: string): Promise<NsibidiCharacter> => {
  const nsibidiCharacterRes = await getNsibidiCharacter(nsibidiCharacterId).catch(async () => {
    /**
     * If there is a regular Nsibidi character string (not a MongoDB Id) then the platform
     * will search the Igbo API and find the matching Nsibidi character and insert
     * that Nsibidi character's id
     */

    const { json: nsibidiCharactersResults } = await network(
      `/${Collection.NSIBIDI_CHARACTERS}?keyword=${nsibidiCharacterId}`,
    );
    const fallbackWord = nsibidiCharactersResults.find(({ nsibidi }) => nsibidi === nsibidiCharacterId);
    return fallbackWord;
  });
  return nsibidiCharacterRes;
};

export const getAssociatedExampleSuggestions = async (id: string): Promise<Example[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.EXAMPLES}/${id}/exampleSuggestions`,
    })
  ).data;

export const getAssociatedWordSuggestions = async (id: string): Promise<WordSuggestion[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.WORDS}/${id}/wordSuggestions`,
    })
  ).data;

export const getAssociatedWordSuggestionByTwitterId = async (id: string): Promise<WordSuggestion[]> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.WORDS}/${id}/twitterPolls`,
    })
  ).data;

export const approveDocument = ({ resource, record }: { resource: Collection; record: Record }): Promise<any> =>
  request({
    method: 'PUT',
    url: `${resource}/${record.id}/approve`,
  });

export const denyDocument = ({ resource, record }: { resource: Collection; record: Record }): Promise<any> =>
  request({
    method: 'PUT',
    url: `${resource}/${record.id}/deny`,
  });

export const mergeDocument = ({ resource, record }: { resource: Collection; record: Record }): Promise<any> =>
  request({
    method: 'POST',
    url: `${resource}`,
    data: { id: record.id },
  });

export const deleteDocument = async ({ resource, record }: { resource: Collection; record: Record }): Promise<any> =>
  request({
    method: 'DELETE',
    url: `${resource}/${record.id}`,
  });

export const bulkDeleteDocuments = async ({ resource, ids }: { resource: Collection; ids: string[] }): Promise<any> =>
  request({
    method: 'DELETE',
    url: `${resource}`,
    data: ids,
  });

export const combineDocument = ({
  primaryWordId,
  resource,
  record,
}: {
  primaryWordId: string;
  resource: Collection;
  record: Record;
}): Promise<any> =>
  request({
    method: 'DELETE',
    url: `${resource}/${record.id}`,
    data: { primaryWordId },
  });

export const submitConstructedTermPoll = (poll: Poll): Promise<any> => handleSubmitConstructedTermPoll(poll);

export const getWordSuggestionsWithoutIgboDefinitions = async (): Promise<any> =>
  (
    await request({
      method: 'GET',
      url: `${Collection.WORD_SUGGESTIONS}/random`,
    })
  ).data;

export const putWordSuggestionsWithoutIgboDefinitions = async (
  igboDefinitions: { id: string; igboDefinition: string }[],
): Promise<any> =>
  (
    await request({
      method: 'PUT',
      url: `${Collection.WORD_SUGGESTIONS}/random`,
      data: igboDefinitions,
    })
  ).data;

export const deleteOldWordSuggestions = async (): Promise<any> =>
  request({
    method: 'DELETE',
    url: `${Collection.WORD_SUGGESTIONS}/old`,
  });
