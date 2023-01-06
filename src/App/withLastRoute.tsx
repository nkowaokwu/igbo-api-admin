import React, { ReactElement, useEffect } from 'react';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';

const LOGIN_HASH = '#/login';
const withLastRoute = (Component: (value: any) => ReactElement) => (props: any): ReactElement => {
  useEffect(() => {
    if (window.location.hash !== LOGIN_HASH) {
      localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
    }
  }, [window.location.hash]);

  return <Component {...props} />;
};

export default withLastRoute;
