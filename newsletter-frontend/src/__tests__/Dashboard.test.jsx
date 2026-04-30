import { screen, waitFor } from '@testing-library/react';
import renderWithProviders from '../test-utils';
import Dashboard from '../pages/Dashboard';
import * as api from '../services/api';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApi } from '../hooks/useApi';

// ✅ Mock API
jest.mock('../services/api');

// ✅ Mock hooks properly
jest.mock('../hooks/useAuth.jsx', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      organization: { id: 'org-1' },
      login: jest.fn(),
    });

    useApi.mockReturnValue({
      loading: false,
      callApi: async (fn) => fn(),
    });

    // ✅ Correct real APIs used in Dashboard
    api.getSubscribers = jest.fn().mockResolvedValue({ data: [] });
    api.getLists = jest.fn().mockResolvedValue({ data: [] });
    api.getCampaigns = jest.fn().mockResolvedValue({ data: [] });
    api.getAutomationHealth = jest.fn().mockResolvedValue({
      data: { automation: { count: 0 } },
    });
  });

it('renders without crashing', () => {
  renderWithProviders(<Dashboard />);

  // ✅ FIX: correct heading
  expect(screen.getByText(/overview/i)).toBeInTheDocument();
});

it('renders stats correctly', async () => {
  renderWithProviders(<Dashboard />);

  // ✅ FIX: use more precise query
  const subscriberLabels = await screen.findAllByText(/subscribers/i);

  expect(subscriberLabels.length).toBeGreaterThan(0);
});
});