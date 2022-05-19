import { TestContext as ReactAdminTestContext } from 'ra-test';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-test' });

jest.mock('firebase');
jest.mock('react-admin');
jest.mock('src/shared/API');
jest.mock('src/utils/getWord');

const TestContext = ReactAdminTestContext;

export default TestContext;
