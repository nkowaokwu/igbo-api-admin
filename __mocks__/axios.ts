const axios: any = jest.createMockFromModule('axios');
axios.get = jest.fn(async () => ({}));

export default axios;

