import React, { ReactElement, useEffect } from 'react';
import { ResourceProps, Resource as AdminResource } from 'react-admin';
import LocalStorageKeys from 'src/shared/constants/LocalStorageKeys';

const LOGIN_HASH = '#/login';
const withLastRoute = (Component) => (props: any) => {
  useEffect(() => {
    if (window.location.hash !== LOGIN_HASH) {
      localStorage.setItem(LocalStorageKeys.REDIRECT_URL, window.location.hash);
    }
  }, []);

  return <Component {...props} />;
};
const Resource = (props: ResourceProps): ReactElement => {
  const {
    list,
    edit,
    create,
    show,
    ...rest
  } = props;

  return (
    <AdminResource
      list={list ? withLastRoute(list) : list}
      edit={edit ? withLastRoute(edit) : edit}
      create={create ? withLastRoute(create) : create}
      show={show ? withLastRoute(show) : show}
      {...rest}
    />
  );
};

export default Resource;
