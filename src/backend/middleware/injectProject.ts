import { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { getProjectByIdHelper } from 'src/backend/controllers/projects';

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Injects the associated project. All requests must specify which project it's using
 */
const injectProject = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ error: string }> | void> => {
  const { mongooseConnection, query } = req;
  const { projectId, invitingProjectId } = query;

  const project = await getProjectByIdHelper({ mongooseConnection, projectId: projectId || invitingProjectId });

  if (!project) {
    return res.status(404).send({ error: 'Requested project not found' });
  }

  req.project = project.toJSON();

  return next();
};

export default injectProject;
