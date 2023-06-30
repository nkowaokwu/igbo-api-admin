const initializeAPI = {
  config: {
    update: jest.fn(() => ({})),
  },
  S3: jest.fn(() => ({
    upload: jest.fn((params) => ({
      promise: jest.fn(async () => ({ Location: `https://igbo-api-prod-local/${params.Key}` })),
    })),
    headObject: jest.fn(() => ({
      promise: jest.fn(async () => ({ ContentLength: 1024 })),
    })),
    deleteObject: jest.fn(() => ({
      promise: jest.fn(async () => ({})),
    })),
    copyObject: jest.fn(() => ({
      promise: jest.fn(async () => ({})),
    })),
  })),
};

export default initializeAPI;
