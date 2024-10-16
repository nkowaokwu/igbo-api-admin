/* eslint-disable import/prefer-default-export */
import queryString from 'query-string';
import { getAuth } from 'firebase/auth';
import { hasAccessToPlatformPermissions } from 'src/shared/utils/permissions';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import authProvider from 'src/utils/authProvider';
import { IGBO_API_PROJECT_ID } from 'src/Core/constants';
import { acceptIgboAPIRequest } from 'src/shared/InviteAPI';
import PlatformAdminUids from 'src/backend/shared/constants/PlatformAdminUids';

const auth = getAuth();
export const handleUserResult = async ({
  toast,
  setErrorMessage,
}: {
  toast: any;
  setErrorMessage: (err: string) => void;
  isNewUser?: boolean;
}): Promise<any> => {
  const { currentUser } = auth;
  if (!currentUser) {
    return;
  }
  const idTokenResult = await currentUser.getIdTokenResult(true);
  const {
    token,
    claims: { user_id: userId },
  } = idTokenResult;
  const userRole = PlatformAdminUids.includes(userId as string)
    ? UserRoles.PLATFORM_ADMIN
    : (idTokenResult.claims.role as UserRoles) || UserRoles.CROWDSOURCER;

  const permissions = { role: userRole };
  const hasPermission = hasAccessToPlatformPermissions(permissions, true);
  if (!hasPermission) {
    authProvider.logout();
    const errorMessage = "You're account doesn't have the necessary permissions to access the platform.";
    setErrorMessage(errorMessage);
    // eslint-disable-next-line
    toast({
      title: 'Insufficient permissions',
      description: errorMessage,
      status: 'warning',
      duration: 4000,
      isClosable: true,
    });
    throw new Error(errorMessage);
  }

  localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, token);
  localStorage.setItem(LocalStorageKeys.UID, userId as string);
  localStorage.setItem(LocalStorageKeys.PERMISSIONS, userRole);

  setErrorMessage('');

  const { invitingProjectId } = queryString.parse(window.location.search) || {};
  if (invitingProjectId === IGBO_API_PROJECT_ID) {
    await acceptIgboAPIRequest();
  }

  const hash = '#/';
  window.location.href = `${window.location.origin}/${hash}`;
};
