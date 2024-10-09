import { Response, NextFunction } from 'express';
import { Connection, Document, Types } from 'mongoose';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import { userProjectPermissionSchema } from 'src/backend/models/UserProjectPermissions';
import EntityStatus from 'src/backend/shared/constants/EntityStatus';
import UserRoles from 'src/backend/shared/constants/UserRoles';

/**
 *
 * @param param0
 * @returns Gets all UserProjectPermissions associated with specified user
 */
export const getUserProjectPermissionsHelper = async ({
  mongooseConnection,
  uid,
  status = EntityStatus.ACTIVE,
}: {
  mongooseConnection: Connection;
  uid: string;
  status?: EntityStatus.ACTIVE;
}): Promise<UserProjectPermission[]> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.find({ firebaseId: uid, ...(status === EntityStatus.UNSPECIFIED ? {} : { status }) });
};

/**
 *
 * @param param0
 * @returns Returns a UserProjectPermission associated with the specified user
 * with the MongoDB doc Id
 */
export const getUserProjectPermissionByDocIdHelper = async ({
  mongooseConnection,
  id,
  projectId,
  status = EntityStatus.ACTIVE,
}: {
  mongooseConnection: Connection;
  id: string;
  projectId: string;
  status?: EntityStatus;
}): Promise<Document<UserProjectPermission, any, UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.findOne({
    projectId,
    _id: id,
    ...(status === EntityStatus.UNSPECIFIED ? {} : { status }),
  });
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
  status = EntityStatus.ACTIVE,
}: {
  mongooseConnection: Connection;
  uid: string;
  projectId: string;
  status?: EntityStatus;
}): Promise<Document<UserProjectPermission, any, UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.findOne({
    projectId,
    firebaseId: uid,
    ...(status === EntityStatus.UNSPECIFIED ? {} : { status }),
  });
};

/**
 *
 * @param param0
 * @returns Gets all project by roles
 */
export const getUserProjectPermissionsByRoleHelper = async ({
  mongooseConnection,
  projectId,
  role,
  status = EntityStatus.ACTIVE,
}: {
  mongooseConnection: Connection;
  projectId: string;
  role: UserRoles;
  status?: EntityStatus;
}): Promise<Document<UserProjectPermission, any, UserProjectPermission>[]> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.find({
    projectId,
    role,
    ...(status === EntityStatus.UNSPECIFIED ? {} : { status }),
  });
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
  status = EntityStatus.ACTIVE,
}: {
  mongooseConnection: Connection;
  projectId: string;
  uids?: string[];
  skip: number;
  limit: number;
  status?: EntityStatus;
}): Promise<Document<unknown, any, Interfaces.UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );
  const userProjectPermission = await UserProjectPermission.find({
    projectId: { $eq: new Types.ObjectId(projectId) },
    firebaseId: uids?.length ? { $in: uids } : { $exists: true },
    ...(status === EntityStatus.UNSPECIFIED ? {} : { status }),
  })
    .skip(skip)
    .limit(limit);

  return userProjectPermission;
};

/**
 *
 * @param param0
 * @returns Returns a UserProjectPermission associated with the specified user using
 * their email
 */
export const getUserProjectPermissionByEmailHelper = ({
  mongooseConnection,
  projectId,
  email,
  status = EntityStatus.ACTIVE,
}: {
  mongooseConnection: Connection;
  projectId: string;
  email: string;
  status?: EntityStatus;
}): Promise<Document<UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.findOne({
    projectId,
    email,
    ...(status === EntityStatus.UNSPECIFIED ? {} : { status }),
  });
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
  body: Pick<UserProjectPermission, 'email' | 'role' | 'firebaseId' | 'grantingAdmin' | 'status'>;
}): Promise<Document<UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );
  const { email, role, firebaseId, grantingAdmin, status } = body;

  const userProjectPermission = new UserProjectPermission({
    status: status || EntityStatus.ACTIVE,
    firebaseId: firebaseId || '',
    projectId,
    email,
    role,
    grantingAdmin,
  });

  return userProjectPermission.save();
};

/**
 * The UserProjectPermission returned from this helper is NOT saved in the database
 * @param param0
 * @returns Helper function to create a new UserProjectPermission with Platform Admin role
 *
 */
export const postUserProjectPermissionPlatformAdminHelper = ({
  mongooseConnection,
  projectId,
  body,
}: {
  mongooseConnection: Connection;
  projectId: string;
  body: Pick<UserProjectPermission, 'email' | 'firebaseId'>;
}): Document<unknown, any, Interfaces.UserProjectPermission> &
  Interfaces.UserProjectPermission & { _id: Types.ObjectId } => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );
  const { email, firebaseId } = body;

  const userProjectPermission = new UserProjectPermission({
    status: EntityStatus.ACTIVE,
    firebaseId: firebaseId || '',
    projectId,
    email,
    role: UserRoles.PLATFORM_ADMIN,
    grantingAdmin: firebaseId || '',
  });

  return userProjectPermission;
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

export const putUserProjectPermissionAsAdmin = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ userProjectPermission: UserProjectPermission }> | void> => {
  try {
    const { mongooseConnection } = req;
    const { role } = req.body;
    const { uid } = req.params;
    const { projectId } = req.query;
    const userProjectPermission = await getUserProjectPermissionHelper({ mongooseConnection, projectId, uid });

    if (!userProjectPermission) {
      throw new Error('No user is associated with the project');
    }

    userProjectPermission.role = role;

    const savedUserProjectPermission = await userProjectPermission.save();

    return res.send({ userProjectPermission: savedUserProjectPermission });
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
export const putUserProjectPermission = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<Interfaces.UserProjectPermission> | void> => {
  try {
    const { mongooseConnection, body, user } = req;
    const { projectId } = req.query;

    const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
      'UserProjectPermission',
      userProjectPermissionSchema,
    );

    const userProjectPermission = await UserProjectPermission.findOne({ firebaseId: user.uid, projectId });

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
 * @param param0
 * @returns Deletes a UserProjectPermission with the user uid
 */
export const deleteUserProjectPermissionHelper = async ({
  mongooseConnection,
  projectId,
  uid,
}: {
  mongooseConnection: Connection;
  projectId: string;
  uid: string;
}): Promise<Document<UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission.t',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.findOneAndDelete({ projectId, firebaseId: uid });
};

/**
 *
 * @param param0
 * @returns Deletes a UserProjectPermission with the user email
 */
export const deleteUserProjectPermissionByEmailHelper = async ({
  mongooseConnection,
  projectId,
  email,
}: {
  mongooseConnection: Connection;
  projectId: string;
  email: string;
}): Promise<Document<UserProjectPermission>> => {
  const UserProjectPermission = mongooseConnection.model<Interfaces.UserProjectPermission>(
    'UserProjectPermission',
    userProjectPermissionSchema,
  );

  return UserProjectPermission.findOneAndDelete({ projectId, email });
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
