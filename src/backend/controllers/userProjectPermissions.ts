import { Response, NextFunction } from 'express';
import { Connection, Document } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import { userProjectPermissionSchema } from 'src/backend/models/UserProjectPermissions';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';

/**
 *
 * @param param0
 * @returns Gets all UserProjectPermissions associated with specified user
 */
export const getUserProjectPermissionsHelper = async ({
  mongooseConnection,
  uid,
}: {
  mongooseConnection: Connection;
  uid: string;
}): Promise<UserProjectPermission[]> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.find({ firebaseId: uid });
};

/**
 *
 * @param param0
 * @returns Gets a UserProjectPermission for specified user
 */
export const getUserProjectPermissionHelper = async ({
  mongooseConnection,
  uid,
  projectId,
}: {
  mongooseConnection: Connection;
  uid: string;
  projectId: string;
}): Promise<Document<UserProjectPermission, any, any>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.findOne({ projectId, firebaseId: uid });
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Gets a UserProjectPermission object for the requesting user
 */
export const getUserProjectPermission = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.UserProjectPermission> | void> => {
  try {
    const { mongooseConnection, query, user } = req;
    const { projectId } = query;

    const userProjectPermission = await getUserProjectPermissionHelper({
      mongooseConnection,
      uid: user.uid,
      projectId,
    });

    if (!userProjectPermission) {
      throw new Error('User project permission not found.');
    }

    return res.send({ userProjectPermission: await userProjectPermission.save() });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param param0
 * @returns Returns UserProjectPermissions associates with specified project
 * with pagination support
 */
export const getUserProjectPermissionsByProjectHelper = async ({
  mongooseConnection,
  projectId,
  uids = [],
  skip,
  limit,
}: {
  mongooseConnection: Connection;
  projectId: string;
  uids?: string[];
  skip: number;
  limit: number;
}): Promise<Document<UserProjectPermission, any, UserProjectPermission>[]> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );
  return UserProjectPermission.find({ projectId, firebaseId: uids?.length ? { $in: uids } : { $exists: true } })
    .skip(skip)
    .limit(limit);
};

/**
 *
 * @param param0
 * @returns Helper function to create a new UserProjectPermission object
 */
export const postUserProjectPermissionHelper = ({
  mongooseConnection,
  projectId,
  body,
}: {
  mongooseConnection: Connection;
  projectId: string;
  body: Pick<UserProjectPermission, 'email' | 'role' | 'firebaseId' | 'grantingAdmin'>;
}): Promise<Document<UserProjectPermission, any, any>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );
  const { email, role, firebaseId, grantingAdmin } = body;

  const userProjectPermission = new UserProjectPermission({
    status: EntityStatus.ACTIVE,
    firebaseId: firebaseId || '',
    projectId,
    email,
    role,
    grantingAdmin,
  });

  return userProjectPermission.save();
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Creates a new a UserProjectPermission for the specified user and project
 */
export const postUserProjectPermission = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.UserProjectPermission> | void> => {
  try {
    const { mongooseConnection, body, user } = req;
    const { projectId, uid, email, role } = body;

    const existingUserProjectPermission = await getUserProjectPermissionHelper({ mongooseConnection, uid, projectId });

    // If user already have a project permission for the project, throw an error
    if (existingUserProjectPermission) {
      throw new Error('User project permission already exists');
    }

    const userProjectPermission = await postUserProjectPermissionHelper({
      mongooseConnection,
      projectId,
      body: {
        firebaseId: '',
        email,
        role,
        grantingAdmin: user.uid,
      },
    });

    const savedUserProjectPermission = await userProjectPermission.save();

    return res.send({ userProjectPermission: savedUserProjectPermission.toJSON() });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Updates an existing UserProjectPermission object
 */
export const updateUserProjectPermission = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.UserProjectPermission> | void> => {
  try {
    const { mongooseConnection, body, params } = req;
    const { id } = params;
    const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
      'UserProjectPermission',
      userProjectPermissionSchema,
    );

    const userProjectPermission = await UserProjectPermission.findById(id);

    if (!userProjectPermission) {
      throw new Error('User project permission not found.');
    }

    Object.entries(body).forEach(([key, value]) => {
      userProjectPermission[key] = value;
    });

    const savedUserProjectPermission = await userProjectPermission.save();

    return res.send({ userProjectPermission: savedUserProjectPermission.toJSON() });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns Finds the UserProjectPermission and deletes it
 */
export const deleteUserProjectPermission = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<UserProjectPermission> | void> => {
  try {
    const { mongooseConnection, params } = req;
    const { id } = params;
    const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
      'UserProjectPermission.t',
      userProjectPermissionSchema,
    );

    const userProjectPermission = await UserProjectPermission.findById(id);

    if (!userProjectPermission) {
      throw new Error('User project permission not found.');
    }

    userProjectPermission.status = EntityStatus.DELETED;

    const savedUserProjectPermission = await userProjectPermission.save();

    return res.send({ userProjectPermission: savedUserProjectPermission.toJSON() });
  } catch (err) {
    return next(err);
  }
};
