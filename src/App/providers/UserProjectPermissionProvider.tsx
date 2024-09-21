import React, { useState, useEffect } from 'react';
import { ProjectContext } from 'src/App/contexts/ProjectContext';
import { UserProjectPermissionContext } from 'src/App/contexts/UserProjectPermissionContext';
import { UserProjectPermission } from 'src/backend/controllers/utils/interfaces';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { getUserProjectPermission } from 'src/shared/ProjectAPI';

export const UserProjectPermissionProvider = ({ children }: React.PropsWithChildren): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProjectPermission, setUserProjectPermission] = useState<UserProjectPermission | null>(null);
  const project = React.useContext(ProjectContext);

  // Waits for project to be fetched to avoid duplicating UserProjectPermission object for user
  const refetch = async () => {
    if (project) {
      const currentUserProjectPermission = await getUserProjectPermission();
      setUserProjectPermission(currentUserProjectPermission);
      localStorage.setItem(LocalStorageKeys.PERMISSIONS, currentUserProjectPermission.role);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        await refetch();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [project]);

  return (
    <UserProjectPermissionContext.Provider value={{ ...(userProjectPermission ?? {}), triggerRefetch: refetch }}>
      {!isLoading ? children : null}
    </UserProjectPermissionContext.Provider>
  );
};
