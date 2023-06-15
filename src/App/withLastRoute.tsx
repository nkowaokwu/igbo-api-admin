import React, { ReactElement, useEffect } from 'react';
import { usePermissions } from 'react-admin';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';
import { hasTranscriberPermissions } from 'src/shared/utils/permissions';

const LOGIN_HASH = '#/login';
const withLastRoute =
  (Component: (value: any) => ReactElement) =>
  (props: any): ReactElement => {
    const permissions = usePermissions();
    /* Skips saving the last route if the user is a transcriber */
    /* This helps prevents transcribers getting stuck on unauthed routes */
    const skipSavingLastRoute = hasTranscriberPermissions(permissions, true) || false;
    useEffect(() => {
      if (window.location.hash !== LOGIN_HASH && !skipSavingLastRoute) {
        localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
      }
    }, [window.location.hash]);

    return (
      <React.Suspense fallback={() => <p>Loading...</p>} {...props}>
        <Component {...props} />
      </React.Suspense>
    );
  };

export default withLastRoute;
