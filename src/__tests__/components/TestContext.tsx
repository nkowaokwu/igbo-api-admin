import React, { ReactElement } from 'react';
import { noop } from 'lodash';
import { TestContext as ReactAdminTestContext } from 'ra-test';
import { configure } from '@testing-library/react';
import { DataProviderContext } from 'react-admin';

configure({ testIdAttribute: 'data-test' });

const mockGetUserMedia = jest.fn(async () => (
  new Promise<void>((resolve) => resolve())
));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

window.scrollTo = noop;

jest.mock('firebase');
jest.mock('firebase/auth');
jest.mock('@chakra-ui/react');
jest.mock('react-admin');
jest.mock('src/shared/API');
jest.mock('src/shared/DataCollectionAPI');

const TestContext = ({
  children,
  dataProvider,
  isListView,
  ...rest
} : {
  children: any,
  dataProvider?: any,
  isListView?: boolean,
  initialState?: any,
  enableReducers?: boolean,
}): ReactElement => {
  const nativeDataProvider = () => Promise.resolve({
    data: {},
  });
  return (
    <ReactAdminTestContext {...rest}>
      <DataProviderContext.Provider value={dataProvider || nativeDataProvider}>
        {React.Children.map(children, (child) => (
          React.cloneElement(child)
        ))}
      </DataProviderContext.Provider>
    </ReactAdminTestContext>
  );
};

export default TestContext;
