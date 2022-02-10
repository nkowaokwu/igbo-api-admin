export default {
  getList: jest.fn(() => Promise),
  getOne: jest.fn(() => Promise.resolve({ id: '123' })),
  getMany: jest.fn(() => Promise),
  getManyReference: jest.fn(() => Promise),
  create: jest.fn(() => Promise),
  update: jest.fn(() => Promise),
  updateMany: jest.fn(() => Promise),
  delete: jest.fn(() => Promise),
  deleteMany: jest.fn(() => Promise),
};
