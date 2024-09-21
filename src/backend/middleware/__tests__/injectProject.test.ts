import injectProject from 'src/backend/middleware/injectProject';
import { nextFixture, requestFixture, responseFixture } from 'src/__tests__/shared/fixtures/requestFixtures';
import * as Project from 'src/backend/controllers/projects';
import { projectFixture } from 'src/__tests__/shared/fixtures/projectFixtures';

jest.mock('../../controllers/projects');

describe('injectProject', () => {
  it('injects the project object on req', async () => {
    const req = requestFixture({ query: { projectId: 'project-id' } });
    const res = responseFixture();
    const next = nextFixture();

    jest
      .spyOn(Project, 'getProjectByIdHelper')
      // @ts-expect-error
      .mockResolvedValue({ ...projectFixture(), toJSON: () => projectFixture() });

    await injectProject(req, res, next);

    expect(req.project).toEqual(projectFixture());
    expect(next).toHaveBeenCalled();
  });

  it('throws an error by not finding a project', async () => {
    const req = requestFixture({ query: { projectId: 'project-id' } });
    const res = responseFixture();
    const next = nextFixture();

    jest.spyOn(Project, 'getProjectByIdHelper').mockResolvedValue(null);

    await injectProject(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
