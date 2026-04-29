import axios from 'axios';

// 👇 mock instance
const mockPost = jest.fn().mockResolvedValue({
  data: {
    accessToken: 'token',
    user: { email: 'test@example.com' },
  },
});

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: mockPost,
    get: jest.fn(),

    interceptors: {
      request: {
        use: jest.fn(), // ✅ required
      },
      response: {
        use: jest.fn(),
      },
    },

    defaults: {
      headers: { common: {} },
    },
  })),
}));

let api;

beforeAll(async () => {
  api = (await import('../../services/api.js')).default;
});

describe('api service', () => {
  it('should send login payload to auth endpoint', async () => {
    const payload = {
      email: 'test@example.com',
      password: 'secret',
    };

    const response = await api.login(payload);

    expect(axios.create).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith('/auth/login', payload);
    expect(response.data.accessToken).toBe('token');
  });

  it('should handle login failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(
      api.login({ email: 'wrong', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });
});