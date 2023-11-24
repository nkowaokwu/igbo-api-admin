import { connectDatabase } from 'src/backend/utils/database';
import { AUTH_TOKEN } from 'src/__tests__/shared/constants';

const createRequestObject = async (
  { user = { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN }, body = {}, query = {} } = {
    user: { uid: AUTH_TOKEN.ADMIN_AUTH_TOKEN },
    body: {},
    query: {},
  },
): Promise<{
  reqMock: { [key: string]: any };
  resMock: { [key: string]: jest.Func };
  nextMock: jest.Func;
}> => {
  const mongooseConnection = await connectDatabase();
  const reqMock = {
    user,
    body,
    query,
    mongooseConnection,
  };
  const resMock = {
    send: jest.fn(),
    setHeader: jest.fn(),
  };
  const nextMock = jest.fn();
  return { reqMock, resMock, nextMock };
};

export default createRequestObject;
