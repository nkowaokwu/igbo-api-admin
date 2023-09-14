import { compact, times } from 'lodash';
import moment from 'moment';
import {
  deleteOldWordSuggestions,
  postRandomWordSuggestionsForIgboDefinitions,
} from 'src/backend/controllers/wordSuggestions';
import { wordSchema } from 'src/backend/models/Word';
import { wordSuggestionSchema } from 'src/backend/models/WordSuggestion';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { connectDatabase, disconnectDatabase } from 'src/backend/utils/database';
import { dropMongoDBCollections } from 'src/__tests__/shared';
import * as Interfaces from '../utils/interfaces';

describe('WordSuggestions', () => {
  beforeEach(async () => {
    // Clear out database to start with a clean slate
    await dropMongoDBCollections();
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
});
