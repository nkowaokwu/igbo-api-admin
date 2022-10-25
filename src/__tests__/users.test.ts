import { getUsers } from './shared/commands';
import { AUTH_TOKEN } from './shared/constants';

describe('Users', () => {
  describe('/GET firebase users', () => {
    it('should get all users with admin auth', async () => {
      const res = await getUsers({ token: AUTH_TOKEN.ADMIN_AUTH_TOKEN });
      expect(res.status).toEqual(200);
      expect(res.body.error).toEqual(undefined);
    });

    it('should return an error because of invalid auth permissions of merger', async () => {
      const res = await getUsers({ token: AUTH_TOKEN.MERGER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return an error because of invalid auth permissions of editor', async () => {
      const res = await getUsers({ token: AUTH_TOKEN.EDITOR_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return an error because of invalid auth permissions of user', async () => {
      const res = await getUsers({ token: AUTH_TOKEN.USER_AUTH_TOKEN });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });

    it('should return an error with malformed auth token', async () => {
      const res = await getUsers({ token: 'invalid auth token' });
      expect(res.status).toEqual(403);
      expect(res.body.error).not.toEqual(undefined);
    });
  });
});
