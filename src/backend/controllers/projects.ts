import { Response, NextFunction } from 'express';
import { Connection } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { getUserProjectPermissionsHelper } from 'src/backend/controllers/userProjectPermissions';
import { projectSchema } from 'src/backend/models/Project';
import UserRoles from 'src/backend/shared/constants/UserRoles';

/**
 *
 * @param param0
 * @returns Helper function that talks directly to MongoDB to fetch project by Id
 */
export const getProjectByIdHelper = async ({
  mongooseConnection,
  projectId,
}: {
  mongooseConnection: Connection;
  projectId: string;
}): Promise<Interfaces.Project | void> => {
  const Project = mongooseConnection.model<Interfaces.Project>('Project', projectSchema);

  return Project.findById(projectId);
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Fetches all projects that the requesting user has access to
 */
export const getProjects = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ projects: Interfaces.ProjectData & { role: UserRoles }[] }> | void> => {
  try {
    const { mongooseConnection, user } = req;
    const Project = mongooseConnection.model<Interfaces.ProjectData>('Project', projectSchema);
    const userProjectPermissions = await getUserProjectPermissionsHelper({ mongooseConnection, uid: user.uid });
    const projectIds = userProjectPermissions.map(({ projectId }) => projectId);
    const projects = await Project.find({ _id: { $in: projectIds } });

    return res.send({
      projects: projects.map((project) => ({
        ...project.toJSON(),
        role: userProjectPermissions.find(({ projectId }) => projectId.toString() === project.id.toString())?.role,
      })),
    });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Fetches a project by its project Id
 */
export const getProjectById = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ project: Interfaces.ProjectData }> | void> => {
  try {
    const { mongooseConnection, params } = req;
    const { id: projectId } = params;

    const project = await getProjectByIdHelper({ mongooseConnection, projectId });
    if (!project) {
      throw new Error('Project not found.');
    }

    return res.send({ project });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Updates the specified project
 */
export const putProject = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ project: Interfaces.ProjectData }> | void> => {
  try {
    const { mongooseConnection, body, params } = req;
    const { id } = params;
    const Project = mongooseConnection.model<Interfaces.Project>('Project', projectSchema);

    const project = await Project.findById(id);

    if (!project) {
      throw new Error('Project not found.');
    }

    Object.entries(body).forEach(([key, value]) => {
      project[key] = value;
    });

    const savedProject = await project.save();

    return res.send({ project: savedProject });
  } catch (err) {
    return next(err);
  }
};
