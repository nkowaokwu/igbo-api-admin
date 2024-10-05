import validateProjectBody from 'src/backend/middleware/validateProjectBody';
import { projectFixture } from 'src/__tests__/shared/fixtures/projectFixtures';
import { nextFixture, requestFixture, responseFixture } from 'src/__tests__/shared/fixtures/requestFixtures';

describe('validateProjectBody', () => {
  it('validates the incoming project body', async () => {
    const project = projectFixture();
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    await validateProjectBody(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('fails validation for malformed project body - title', async () => {
    const project = projectFixture();
    delete project.title;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - description', async () => {
    const project = projectFixture();
    delete project.description;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - status', async () => {
    const project = projectFixture();
    delete project.status;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - visibility', async () => {
    const project = projectFixture();
    delete project.visibility;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - license', async () => {
    const project = projectFixture();
    delete project.license;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - languages', async () => {
    const project = projectFixture();
    delete project.languages;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - languages wrong value', async () => {
    // @ts-expect-error wrong value
    const project = projectFixture({ languages: ['test'] });
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - types', async () => {
    const project = projectFixture();
    delete project.types;
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('fails validation for malformed project body - types wrong value', async () => {
    // @ts-expect-error wrong value
    const project = projectFixture({ types: ['test'] });
    const req = requestFixture({ data: project });
    const res = responseFixture();
    const next = nextFixture();

    try {
      await validateProjectBody(req, res, next);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
