import React, { ReactElement } from 'react';
import { TestContext as ReactAdminTestContext } from 'ra-test';
import { configure } from '@testing-library/react';
import { DataProviderContext } from 'react-admin';

configure({ testIdAttribute: 'data-test' });

jest.mock('firebase');
jest.mock('@chakra-ui/react');
jest.mock('react-admin');
jest.mock('src/shared/API');
jest.mock('src/utils/getWord');

const TestContext = ({ children, dataProvider, ...rest } : any): ReactElement => {
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
