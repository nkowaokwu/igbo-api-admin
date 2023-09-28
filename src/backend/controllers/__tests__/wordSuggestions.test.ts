import { compact, times } from 'lodash';
import moment from 'moment';
import {
  bulkDeleteWordSuggestions,
  deleteAssociatedExampleSuggestions,
  deleteOldWordSuggestions,
  deleteWordSuggestionData,
  postRandomWordSuggestionsForIgboDefinitions,
} from 'src/backend/controllers/wordSuggestions';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import { exampleSuggestionSchema } from 'src/backend/models/ExampleSuggestion';
import Dialect from 'src/backend/shared/constants/Dialect';
import { bulkDeleteWordSuggestions as bulkDeleteWordSuggestionsCommand } from 'src/__tests__/shared/commands';
import * as AudioAPI from '../utils/MediaAPIs/AudioAPI';
import * as Interfaces from '../utils/interfaces';

describe('WordSuggestions', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
    jest.clearAllMocks();
  });

  describe('DELETE word suggestions', () => {
    it('deletes word suggestions', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const wordSuggestion = new WordSuggestion({
        word: 'testing',
        definitions: [],
        pronunciation: 'pronunciation',
        createdAt: moment().subtract(2, 'year'),
      });
      const savedWordSuggestion = await wordSuggestion.save();
      const mockReq = { mongooseConnection: connection };
      const mockRes = {
        send: jest.fn(),
      };
      const mockNext = jest.fn();
      await deleteOldWordSuggestions(mockReq, mockRes, mockNext);
      const nonExistentWordSuggestion = await WordSuggestion.findById(savedWordSuggestion.id);
      expect(nonExistentWordSuggestion).toBeNull();
      await disconnectDatabase();
    });

    it('does not delete word suggestions created by community users', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const communityWordSuggestion = new WordSuggestion({
        word: 'community',
        definitions: [],
        pronunciation: 'pronunciation',
        source: SuggestionSourceEnum.COMMUNITY,
        createdAt: moment().subtract(2, 'year'),
      });
      const wordSuggestion = new WordSuggestion({
        word: 'testing',
        definitions: [],
        pronunciation: 'pronunciation',
        createdAt: moment().subtract(2, 'year'),
      });
      const [savedCommunityWordSuggestion, savedWordSuggestion] = await Promise.all([
        communityWordSuggestion.save(),
        wordSuggestion.save(),
      ]);
      const mockReq = { mongooseConnection: connection };
      const mockRes = {
        send: jest.fn(),
      };
      const mockNext = jest.fn();
      await deleteOldWordSuggestions(mockReq, mockRes, mockNext);
      const nonExistentWordSuggestion = await WordSuggestion.findById(savedWordSuggestion.id);
      const existingCommunityWordSuggestion = await WordSuggestion.findById(savedCommunityWordSuggestion.id);
      expect(nonExistentWordSuggestion).toBeNull();
      expect(existingCommunityWordSuggestion.id).toEqual(savedCommunityWordSuggestion.id);
      await disconnectDatabase();
    });

    it('bulk deletes word suggestions', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const savedWordSuggestionIds = await Promise.all(
        times(100, async (index) => {
          const wordSuggestion = new WordSuggestion({
            word: `testing-${index}`,
            definitions: [],
            pronunciation: 'pronunciation',
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWordSuggestion = await wordSuggestion.save();
          return savedWordSuggestion.id.toString();
        }),
      );
      const mockReq = { mongooseConnection: connection, body: savedWordSuggestionIds };
      const mockRes = {
        send: jest.fn(),
      };
      const mockNext = jest.fn();
      await bulkDeleteWordSuggestions(mockReq, mockRes, mockNext);
      await Promise.all(
        savedWordSuggestionIds.map(async (wordSuggestion) => {
          const nonExistentWordSuggestion = await WordSuggestion.findById(wordSuggestion.id);
          expect(nonExistentWordSuggestion).toBeNull();
        }),
      );
      await disconnectDatabase();
    });

    it('bulk deletes word suggestions via request', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const savedWordSuggestionIds = await Promise.all(
        times(100, async (index) => {
          const wordSuggestion = new WordSuggestion({
            word: `testing-${index}`,
            definitions: [],
            pronunciation: 'pronunciation',
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWordSuggestion = await wordSuggestion.save();
          return savedWordSuggestion.id.toString();
        }),
      );
      const res = await bulkDeleteWordSuggestionsCommand({ data: savedWordSuggestionIds });
      expect(res.status).toEqual(200);
      await disconnectDatabase();
    });

    it('fails to bulk delete word suggestions because too many documents', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const savedWordSuggestionIds = await Promise.all(
        times(101, async (index) => {
          const wordSuggestion = new WordSuggestion({
            word: `testing-${index}`,
            definitions: [],
            pronunciation: 'pronunciation',
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWordSuggestion = await wordSuggestion.save();
          return savedWordSuggestion.id.toString();
        }),
      );
      const res = await bulkDeleteWordSuggestionsCommand({ data: savedWordSuggestionIds });
      expect(res.status).toEqual(400);
      await disconnectDatabase();
    });
  });

  describe('POST word suggestions', () => {
    it("creates new word suggestions from words that don't have Igbo definitions", async () => {
      const connection = await connectDatabase();
      const Word = connection.model<Interfaces.Word>('Word', wordSchema);
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const savedWordIds = await Promise.all(
        times(5, async (index) => {
          const word = new Word({
            word: `testing-${index}`,
            definitions: [],
            pronunciation: 'pronunciation',
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWord = await word.save();
          return savedWord.id.toString();
        }),
      );
      let savedWordSuggestionIds = [];
      const mockReq = { mongooseConnection: connection, data: { limit: 5 } };
      const mockSend = jest.fn(({ ids }) => {
        savedWordSuggestionIds = ids.map((id) => id.toString());
      });
      const mockRes = {
        status: () => ({
          send: mockSend,
        }),
        send: mockSend,
      };
      const mockNext = jest.fn();
      await postRandomWordSuggestionsForIgboDefinitions(mockReq, mockRes, mockNext);
      expect(mockSend).toHaveBeenCalledWith({
        message: 'Created up to 5 word suggestions',
        ids: savedWordSuggestionIds,
      });

      const wordSuggestions = await Promise.all(savedWordSuggestionIds.map(async (id) => WordSuggestion.findById(id)));
      wordSuggestions.forEach(({ originalWordId }) => expect(savedWordIds).toContain(originalWordId.toString()));
      await disconnectDatabase();
    });

    it('does not create new word suggestion from word with Igbo definition', async () => {
      const connection = await connectDatabase();
      const Word = connection.model<Interfaces.Word>('Word', wordSchema);
      await Promise.all(
        times(5, async (index) => {
          const word = new Word({
            word: `testing-${index}`,
            definitions: [{ igboDefinitions: { igbo: 'first igbo definition' } }],
            pronunciation: 'pronunciation',
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWord = await word.save();
          return savedWord.id.toString();
        }),
      );
      const mockReq = { mongooseConnection: connection, data: { limit: 5 } };
      const mockSend = jest.fn();
      const mockRes = {
        status: () => ({
          send: mockSend,
        }),
        send: mockSend,
      };
      const mockNext = jest.fn();
      await postRandomWordSuggestionsForIgboDefinitions(mockReq, mockRes, mockNext);
      expect(mockSend).toHaveBeenCalledWith({ message: 'No word suggestion created' });
      await disconnectDatabase();
    });

    it('create one new word suggestion from word without an Igbo definition', async () => {
      const connection = await connectDatabase();
      const Word = connection.model<Interfaces.Word>('Word', wordSchema);
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const savedWordIds = await Promise.all(
        times(5, async (index) => {
          const word = new Word({
            word: `testing-${index}`,
            definitions: compact([index === 0 ? null : { igboDefinitions: { igbo: 'first igbo definition' } }]),
            pronunciation: 'pronunciation',
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWord = await word.save();
          return savedWord.id.toString();
        }),
      );
      let savedWordSuggestionIds = [];
      const mockReq = { mongooseConnection: connection, data: { limit: 5 } };
      const mockSend = jest.fn(({ ids }) => {
        savedWordSuggestionIds = ids.map((id) => id.toString());
      });
      const mockRes = {
        status: () => ({
          send: mockSend,
        }),
        send: mockSend,
      };
      const mockNext = jest.fn();
      await postRandomWordSuggestionsForIgboDefinitions(mockReq, mockRes, mockNext);
      expect(mockSend).toHaveBeenCalledWith({
        message: 'Created up to 1 word suggestions',
        ids: savedWordSuggestionIds,
      });
      const wordSuggestions = await Promise.all(savedWordSuggestionIds.map(async (id) => WordSuggestion.findById(id)));
      wordSuggestions.forEach(({ originalWordId }) => expect(savedWordIds).toContain(originalWordId.toString()));
      await disconnectDatabase();
    });
  });

  describe('Helpers', () => {
    it('deletes a WordSuggestion with associated data', async () => {
      const deleteAudioPronunciationMock = jest.spyOn(AudioAPI, 'deleteAudioPronunciation').mockReturnValue();
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const ExampleSuggestion = connection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );
      const wordSuggestion = new WordSuggestion({
        word: 'testing-word',
        definitions: [],
        pronunciation: 'pronunciation',
        dialects: [
          {
            word: 'testing-word-dialect',
            dialects: [Dialect.ABI.value],
            pronunciation: 'pronunciation',
          },
          {
            word: 'second-testing-word-dialect',
            dialects: [Dialect.ABI.value],
            pronunciation: 'pronunciation',
          },
        ],
        createdAt: moment().subtract(2, 'year'),
      });
      const savedWordSuggestion = await wordSuggestion.save();
      await deleteWordSuggestionData({ ExampleSuggestion, wordSuggestion: savedWordSuggestion });
      expect(deleteAudioPronunciationMock).toBeCalledTimes(5);
      expect(deleteAudioPronunciationMock).toHaveBeenNthCalledWith(1, savedWordSuggestion.id, false);
      expect(deleteAudioPronunciationMock).toHaveBeenNthCalledWith(
        2,
        `${savedWordSuggestion.id}-${savedWordSuggestion.dialects[0].word}`,
        false,
      );
      expect(deleteAudioPronunciationMock).toHaveBeenNthCalledWith(
        3,
        `${savedWordSuggestion.id}-${savedWordSuggestion.dialects[0].id}`,
        false,
      );
      expect(deleteAudioPronunciationMock).toHaveBeenNthCalledWith(
        4,
        `${savedWordSuggestion.id}-${savedWordSuggestion.dialects[1].word}`,
        false,
      );
      expect(deleteAudioPronunciationMock).toHaveBeenNthCalledWith(
        5,
        `${savedWordSuggestion.id}-${savedWordSuggestion.dialects[1].id}`,
        false,
      );
    });

    it('deletes an ExampleSuggestion with a single associated WordSuggestion', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const ExampleSuggestion = connection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );
      const wordSuggestion = new WordSuggestion({
        word: 'testing-word',
        definitions: [],
        pronunciation: 'pronunciation',
        dialects: [
          {
            word: 'testing-word-dialect',
            dialects: [Dialect.ABI.value],
            pronunciation: 'pronunciation',
          },
          {
            word: 'second-testing-word-dialect',
            dialects: [Dialect.ABI.value],
            pronunciation: 'pronunciation',
          },
        ],
        createdAt: moment().subtract(2, 'year'),
      });
      const savedWordSuggestion = await wordSuggestion.save();
      const exampleSuggestion = new ExampleSuggestion({
        igbo: 'igbo',
        english: 'english',
        associatedWords: [savedWordSuggestion.id],
      });
      const savedExampleSuggestion = await exampleSuggestion.save();

      await deleteAssociatedExampleSuggestions({
        ExampleSuggestion,
        wordSuggestionId: savedWordSuggestion.id.toString(),
      });

      const deletedExampleSuggestion = await ExampleSuggestion.findById(savedExampleSuggestion.id);
      expect(deletedExampleSuggestion).toBeFalsy();
    });

    it('does not delete an ExampleSuggestion with more than one associated WordSuggestion', async () => {
      const connection = await connectDatabase();
      const WordSuggestion = connection.model<Interfaces.WordSuggestion>('WordSuggestion', wordSuggestionSchema);
      const ExampleSuggestion = connection.model<Interfaces.ExampleSuggestion>(
        'ExampleSuggestion',
        exampleSuggestionSchema,
      );
      const savedWordSuggestionIds = await Promise.all(
        times(2, async (index) => {
          const wordSuggestion = new WordSuggestion({
            word: `testing-word-${index}`,
            definitions: [],
            pronunciation: 'pronunciation',
            dialects: [
              {
                word: 'testing-word-dialect',
                dialects: [Dialect.ABI.value],
                pronunciation: 'pronunciation',
              },
              {
                word: 'second-testing-word-dialect',
                dialects: [Dialect.ABI.value],
                pronunciation: 'pronunciation',
              },
            ],
            createdAt: moment().subtract(2, 'year'),
          });
          const savedWordSuggestion = await wordSuggestion.save();
          return savedWordSuggestion.id.toString();
        }),
      );
      const exampleSuggestion = new ExampleSuggestion({
        igbo: 'igbo',
        english: 'english',
        associatedWords: savedWordSuggestionIds,
      });
      const savedExampleSuggestion = await exampleSuggestion.save();

      await deleteAssociatedExampleSuggestions({
        ExampleSuggestion,
        wordSuggestionId: savedWordSuggestionIds[0],
      });

      const existingExampleSuggestion = await ExampleSuggestion.findById(savedExampleSuggestion.id);
      expect(existingExampleSuggestion.associatedWords).toHaveLength(1);
      expect(existingExampleSuggestion.associatedWords[0].toString()).toEqual(savedWordSuggestionIds[1]);
    });
  });
});
