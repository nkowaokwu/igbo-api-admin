import NsibidiCharacterAttributeEnum from 'src/backend/shared/constants/NsibidiCharacterAttributeEnum';
import { nsibidiCharacterFixture } from 'src/__tests__/shared/fixtures';
import { AUTH_TOKEN } from './shared/constants';
import { suggestNewNsibidiCharacter, updateNsibidiCharacter } from './shared/commands';

const nsibidiCharacterData = nsibidiCharacterFixture({ nsibidi: 'nsibidi ' });

describe('MongoDB Nsịbịdị Characters', () => {
  describe('/POST mongodb nsibidiCharacters', () => {
    it('should save submitted nsibidi character', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.nsibidi).toEqual('nsibidi');
      expect(res.body.attributes[NsibidiCharacterAttributeEnum.HAS_LEGACY_CHARACTERS]).toEqual(false);
    });

    it('should save submitted nsibidi character as merger', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.MERGER_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.id).not.toEqual(undefined);
      expect(res.body.nsibidi).toEqual('nsibidi');
    });

    it('should fail to save submitted nsibidi character as editor', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });

    it('should fail to save submitted nsibidi character as crowdsourcer', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });

    it('should fail to save submitted nsibidi character as transcriber', async () => {
      const res = await suggestNewNsibidiCharacter(nsibidiCharacterData, { token: AUTH_TOKEN.TRANSCRIBER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
    });
  });

  describe('/PUT mongodb nsibidiCharacters', () => {
    it('should update existing nsibidi character', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter({
        id: nsibidiCharacterRes.body.id,
        ...nsibidiCharacterData,
        nsibidi: 'updated nsibidi',
      });
      expect(res.status).toEqual(200);
      expect(res.body.nsibidi).toEqual('updated nsibidi');
    });

    it('should update existing nsibidi character as merger', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        {
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
        },
        { token: AUTH_TOKEN.MERGER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(200);
      expect(res.body.nsibidi).toEqual('updated nsibidi');
    });

    it('should fail to update existing nsibidi character as editor', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        {
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
        },
        { token: AUTH_TOKEN.EDITOR_AUTH_TOKEN },
      );
      expect(res.status).toEqual(403);
    });

    it('should fail to update existing nsibidi character as crowdsourcer', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        {
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
        },
        { token: AUTH_TOKEN.CROWDSOURCER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(403);
    });

    it('should fail to update existing nsibidi character as transcriber', async () => {
      const nsibidiCharacterRes = await suggestNewNsibidiCharacter(nsibidiCharacterData);
      expect(nsibidiCharacterRes.status).toEqual(200);
      const res = await updateNsibidiCharacter(
        {
          id: nsibidiCharacterRes.body.id,
          ...nsibidiCharacterData,
          nsibidi: 'updated nsibidi',
        },
        { token: AUTH_TOKEN.TRANSCRIBER_AUTH_TOKEN },
      );
      expect(res.status).toEqual(403);
    });
  });
});
