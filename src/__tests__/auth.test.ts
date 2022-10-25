import {
  createExample,
  createWord,
  createCorpus,
  getExampleSuggestions,
  getCorpusSuggestions,
  getPolls,
  createPoll,
  getUsers,
  getWordSuggestions,
} from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';

describe('Auth', () => {
  describe('Authorization', () => {
    it('should allow an admin to see word suggestions', async () => {
      const res = await getWordSuggestions({}, { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.error).toEqual(undefined);
    });

    it('should allow an admin to see example suggestions', async () => {
      const res = await getExampleSuggestions({}, { token: AUTH_TOKEN.ADMIN_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.error).toEqual(undefined);
    });

    it('should allow an editor to see word suggestions', async () => {
      const res = await getWordSuggestions({}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.error).toEqual(undefined);
    });

    it('should allow an editor to see example suggestions', async () => {
      const res = await getExampleSuggestions({}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.error).toEqual(undefined);
    });

    it('should forbid a regular user from seeing word suggestions', async () => {
      const res = await getWordSuggestions({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid a regular user from seeing example suggestions', async () => {
      const res = await getExampleSuggestions({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid a regular user from seeing corpus suggestions', async () => {
      const res = await getCorpusSuggestions({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid a regular user from seeing polls', async () => {
      const res = await getPolls({}, { token: AUTH_TOKEN.USER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid an editor from creating a word', async () => {
      const res = await createWord('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid an editor from creating an example', async () => {
      const res = await createExample('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid an editor from creating a corpus', async () => {
      const res = await createCorpus('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid an editor from creating a corpus', async () => {
      const res = await createCorpus('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should forbid an editor from creating a corpus', async () => {
      const res = await createPoll('', {}, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should allow an admin to get all users', async () => {
      const res = await getUsers();
      expect(res.status).toEqual(200);
    });

    it('should forbid a non-admin from getting users', async () => {
      const res = await getUsers({ token: AUTH_TOKEN.MERGER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });
  });
});
