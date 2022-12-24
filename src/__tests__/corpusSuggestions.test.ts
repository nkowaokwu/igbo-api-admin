import { forIn, isEqual } from 'lodash';
import {
  suggestNewCorpus,
  updateCorpusSuggestion,
  getCorpusSuggestion,
  getCorpusSuggestions,
  deleteCorpusSuggestion,
} from './shared/commands';
import {
  corpusSuggestionId,
  corpusSuggestionData,
  malformedCorpusSuggestionData,
  updatedCorpusSuggestionData,
} from './__mocks__/documentData';
import { INVALID_ID } from './shared/constants';

describe('MongoDB Corpus Suggestions', () => {
  describe('/POST mongodb corpusSuggestion', () => {
    it('should save submitted corpus suggestion', async () => {
      const res = await suggestNewCorpus(corpusSuggestionData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
    });

    it('should return a corpus error because of malformed data', async () => {
      const res = await suggestNewCorpus(malformedCorpusSuggestionData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return a corpus error because of empty title', async () => {
      const res = await suggestNewCorpus({ title: '', body: 'corpus body' });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return a corpus error because of empty body', async () => {
      const res = await suggestNewCorpus({ title: 'corpus title', body: '' });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return a corpus error because of invalid media field', async () => {
      const res = await suggestNewCorpus({ ...corpusSuggestionData, media: 'media' }, { cleanData: false });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return a word error because invalid id', async () => {
      const malformedData = { ...corpusSuggestionData, originalWordId: 'ok123' };
      const res = await suggestNewCorpus(malformedData);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });
  });

  describe('/PUT mongodb corpusSuggestions', () => {
    it('should update specific corpusSuggestion with provided data', async () => {
      const res = await suggestNewCorpus(corpusSuggestionData);
      expect(res.status).toEqual(200);
      const result = await updateCorpusSuggestion({ id: res.body.id, ...updatedCorpusSuggestionData });
      expect(result.status).toEqual(200);
      forIn(updatedCorpusSuggestionData, (value, key) => {
        expect(isEqual(result.body[key], value)).toEqual(true);
      });
      expect(result.body.authorId).toEqual(res.body.authorId);
    });

    it('should return an error because document doesn\'t exist', async () => {
      const res = await getCorpusSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await getCorpusSuggestion({ id: INVALID_ID });
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should update the updatedAt field', async () => {
      const corpusSuggestionsRes = await getCorpusSuggestions();
      expect(corpusSuggestionsRes.status).toEqual(200);
      const corpusSuggestion = corpusSuggestionsRes.body[0];
      const res = await updateCorpusSuggestion({ ...corpusSuggestion, title: 'updated' });
      expect(res.status).toEqual(200);
      expect(Date.parse(corpusSuggestion.updatedAt)).toBeLessThan(Date.parse(res.body.updatedAt));
    });
  });

  describe('/DELETE mongodb wordSuggestions', () => {
    it('should delete a single corpus suggestion', async () => {
      const res = await suggestNewCorpus(corpusSuggestionData);
      expect(res.status).toEqual(200);
      const result = await deleteCorpusSuggestion(res.body.id);
      expect(result.status).toEqual(200);
      expect(result.body.id).not.toEqual(undefined);
      const resError = await getCorpusSuggestion(result.body.id);
      expect(resError.status).toEqual(404);
      expect(resError.body.error).not.toEqual(undefined);
    });

    it('should return an error for attempting to deleting a non-existing corpus suggestion', async () => {
      const deleteRes = await deleteCorpusSuggestion(INVALID_ID);
      expect(deleteRes.status).toEqual(400);
    });

    it('should return error for non existent corpus suggestion', async () => {
      const res = await getCorpusSuggestion(corpusSuggestionId.toString());
      expect(res.status).toEqual(404);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should throw an error for providing an invalid id', async () => {
      const res = await deleteCorpusSuggestion(INVALID_ID);
      expect(res.status).toEqual(400);
      expect(res.body.error).not.toEqual(undefined);
    });
  });
});
