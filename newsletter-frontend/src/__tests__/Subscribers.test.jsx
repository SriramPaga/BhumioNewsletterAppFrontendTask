import { screen, waitFor, fireEvent } from '@testing-library/react';
import renderWithProviders from '../test-utils';
import Subscribers from '../pages/Subscribers';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApi } from '../hooks/useApi.js';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getSubscribers: jest.fn(),
    getLists: jest.fn(),
    createSubscriber: jest.fn(),
  },
}));
jest.mock('../hooks/useAuth.jsx');
jest.mock('../hooks/useApi.js');

describe('Subscribers Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      organization: { id: 'org-1' },
      login: jest.fn(),
    });

    useApi.mockReturnValue({
      loading: false,
      callApi: async (fn) => fn(),
    });

    // ✅ FIX: correct API shape
    api.getSubscribers = jest.fn().mockResolvedValue({ data: [] });
    api.getLists = jest.fn().mockResolvedValue({
      data: [{ id: 'list-1', name: 'Test List' }],
    });

    api.createSubscriber = jest.fn().mockResolvedValue({});
  });

  it('renders without crashing', () => {
    renderWithProviders(<Subscribers />);
    expect(screen.getByRole('heading', { level: 4, name: /Subscribers/i })).toBeInTheDocument();
  });

  it('renders empty state correctly', async () => {
    renderWithProviders(<Subscribers />);

    await waitFor(() => {
      expect(screen.getByText(/no subscribers found/i)).toBeInTheDocument();
    });
  });

  it('allows typing in email input', () => {
    renderWithProviders(<Subscribers />);

    // ✅ FIX: use label instead of placeholder
    const input = screen.getByLabelText(/email/i);

    fireEvent.change(input, {
      target: { value: 'test@example.com' },
    });

    expect(input.value).toBe('test@example.com');
  });

  it('submits form and calls API', async () => {
    renderWithProviders(<Subscribers />);

    await waitFor(() => {
      expect(api.getLists).toHaveBeenCalled();
    });

    const input = screen.getByLabelText(/email/i);
    const button = screen.getByRole('button', { name: /add subscriber/i });

    fireEvent.change(input, {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(api.createSubscriber).toHaveBeenCalled();
    });
  });
});