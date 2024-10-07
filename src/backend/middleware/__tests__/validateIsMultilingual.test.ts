import validateProjectBody from 'src/backend/middleware/validateProjectBody';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import { nextFixture, requestFixture, responseFixture } from 'src/__tests__/shared/fixtures/requestFixtures';
import { userProjectPermissionFixture } from 'src/__tests__/shared/fixtures/userProjectPermissionFixtures';

describe('validateIsMultilingual', () => {
  it('validates the incoming user project permission', async () => {
    const userProjectPermission = userProjectPermissionFixture({
      languages: [LanguageEnum.IGBO, LanguageEnum.ENGLISH],
    });
    const req = requestFixture({ userProjectPermission });
    const res = responseFixture();
    const next = nextFixture();

    await validateProjectBody(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('validates the incoming user project permission as admin', async () => {
    const userProjectPermission = userProjectPermissionFixture({
      languages: [LanguageEnum.IGBO],
      role: UserRoles.ADMIN,
    });
    const req = requestFixture({ userProjectPermission });
    const res = responseFixture();
    const next = nextFixture();

    await validateProjectBody(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('fails validation for malformed user project permission body - single language', async () => {
    const userProjectPermission = userProjectPermissionFixture({
      languages: [LanguageEnum.IGBO],
    });
    const req = requestFixture({ userProjectPermission });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
