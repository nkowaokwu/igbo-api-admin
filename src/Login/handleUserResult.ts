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
} : {
  toast: any,
  setErrorMessage: (err: string) => void,
}): Promise<any> => {
  const { currentUser } = auth;
  if (!currentUser) {
    return;
  }
  const idTokenResult = await currentUser.getIdTokenResult(true);
  const userRole = idTokenResult.claims.role as UserRoles || UserRoles.CROWDSOURCER;
  const { token, claims: { user_id: userId } } = idTokenResult;

  const permissions = { role: userRole };
  const hasPermission = hasAccessToPlatformPermissions(permissions, true);
  if (!hasPermission) {
    authProvider.logout();
    setErrorMessage('You do not have permission to access the platform');
    // eslint-disable-next-line
    return toast({
      title: 'Insufficient permissions',
      description: 'You\'re account doesn\'t have the necessary permissions to access the platform.',
      status: 'warning',
      duration: 4000,
      isClosable: true,
    });
  }

  localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, token);
  localStorage.setItem(LocalStorageKeys.UID, userId as string);
  localStorage.setItem(LocalStorageKeys.PERMISSIONS, userRole);

  setErrorMessage('');

  const rawRedirectUrl = localStorage.getItem(LocalStorageKeys.REDIRECT_URL);
  const hash = (
    hasTranscriberPermissions(permissions, '#/igboSoundbox')
    || hasCrowdsourcerPermission(permissions, '#/')
    || (rawRedirectUrl || '#/') || '#/'
  );
  window.location.href = `${window.location.origin}/${hash}`;
};
