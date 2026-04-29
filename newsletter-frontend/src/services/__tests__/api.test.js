import axios from 'axios';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn().mockResolvedValue({ data: { accessToken: 'token', user: { email: 'test@example.com' } } }),
    get: jest.fn(),
    interceptors: { response: { use: jest.fn() } },
    defaults: { headers: { common: {} } },
  })),
}));

let api;

beforeAll(async () => {
  api = (await import('../../services/api.js')).default;
});

describe('api service', () => {
  it('should send login payload to auth endpoint', async () => {
    const response = await api.login({ email: 'test@example.com', password: 'secret' });
    expect(axios.create).toHaveBeenCalled();
    expect(response.data.accessToken).toBe('token');
  });
});
