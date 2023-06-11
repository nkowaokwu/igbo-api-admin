import WordClass from 'src/backend/shared/constants/WordClass';
import { AUTH_TOKEN } from './shared/constants';
import { suggestNewNsibidiCharacter, updateNsibidiCharacter } from './shared/commands';
import { nsibidiCharacterData } from './__mocks__/documentData';

describe('MongoDB Nsịbịdị Characters', () => {
  describe('/POST mongodb nsibidiCharacters', () => {
    it('should save submitted word suggestion', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.nsibidi).toEqual('nsibidi');
      expect(res.body.pronunciation).toEqual('pronunciation');
      expect(res.body.wordClass).toEqual(WordClass.ADJ.nsibidiValue);
      expect(res.body.definitions[0].text).toEqual('first definition');
    });

    it('should save submitted word suggestion as merger', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.MERGER_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.nsibidi).toEqual('nsibidi');
      expect(res.body.pronunciation).toEqual('pronunciation');
      expect(res.body.wordClass).toEqual(WordClass.ADJ.nsibidiValue);
      expect(res.body.definitions[0].text).toEqual('first definition');
    });

    it('should fail to save submitted word suggestion as editor', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });

    it('should fail to save submitted word suggestion as crowdsourcer', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });

    it('should fail to save submitted word suggestion as transcriber', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.TRANSCRIBER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });
  });

  describe('/PUT mongodb nsibidiCharacters', () => {
    it('should update existing nsibidi character', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        ({
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
          pronunciation: 'updated pronunciation',
          wordClass: WordClass.DEM.nsibidiValue,
          definitions: [{ text: 'updated first definition' }],
        }),
      );
      expect(res.status).toEqual(200);
      expect(res.body.nsibidi).toEqual('updated nsibidi');
      expect(res.body.pronunciation).toEqual('updated pronunciation');
      expect(res.body.wordClass).toEqual(WordClass.DEM.nsibidiValue);
      expect(res.body.definitions[0].text).toEqual('updated first definition');
    });

    it('should update existing nsibidi character as merger', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        ({
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
          pronunciation: 'updated pronunciation',
          wordClass: WordClass.DEM.nsibidiValue,
          definitions: [{ text: 'updated first definition' }],
        }),
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(200);
      expect(res.body.nsibidi).toEqual('updated nsibidi');
      expect(res.body.pronunciation).toEqual('updated pronunciation');
      expect(res.body.wordClass).toEqual(WordClass.DEM.nsibidiValue);
      expect(res.body.definitions[0].text).toEqual('updated first definition');
    });

    it('should fail to update existing nsibidi character as editor', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        ({
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
          pronunciation: 'updated pronunciation',
          wordClass: WordClass.DEM.nsibidiValue,
          definitions: [{ text: 'updated first definition' }],
        }),
        { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN },
      );
      expect(res.status).toEqual(403);
    });

    it('should fail to update existing nsibidi character as crowdsourcer', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        ({
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
          pronunciation: 'updated pronunciation',
          wordClass: WordClass.DEM.nsibidiValue,
          definitions: [{ text: 'updated first definition' }],
        }),
        { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(403);
    });

    it('should fail to update existing nsibidi character as transcriber', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        ({
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
          pronunciation: 'updated pronunciation',
          wordClass: WordClass.DEM.nsibidiValue,
          definitions: [{ text: 'updated first definition' }],
        }),
        { token: AUTH_TOKEN.TRANSCRIBER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(403);
    });
  });
});
