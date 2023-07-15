/* eslint-disable import/prefer-default-export */
import { getAuth } from 'firebase/auth';
import {
  hasTranscriberPermissions,
  hasAccessToPlatformPermissions,
  hasCrowdsourcerPermission,
} from 'src/shared/utils/permissions';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import authProvider from 'src/utils/authProvider';

const auth = getAuth();
export const handleUserResult = async ({
  toast,
  setErrorMessage,
  isNewUser = false,
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
  const userRole = (idTokenResult.claims.role as UserRoles) || UserRoles.CROWDSOURCER;
  const {
    token,
    claims: { user_id: userId },
  } = idTokenResult;

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

  if (isNewUser) {
    authProvider.logout();
    toast({
      title: 'Account created',
      description: 'Please refresh the page and log in to access the platform',
      status: 'success',
      duration: 90000,
      isClosable: true,
    });
  } else {
    const rawRedirectUrl = localStorage.getItem(LocalStorageKeys.REDIRECT_URL);
    const hash =
      hasTranscriberPermissions(permissions, '#/igboSoundbox') ||
      hasCrowdsourcerPermission(permissions, '#/') ||
      rawRedirectUrl ||
      '#/' ||
      '#/';
    window.location.href = `${window.location.origin}/${hash}`;
  }
};
