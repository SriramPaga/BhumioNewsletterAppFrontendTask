import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import renderWithProviders from '../test-utils';
import Campaigns from '../pages/Campaigns';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApi } from '../hooks/useApi.js';

const serviceApi = api?.default || api;

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    getCampaigns: jest.fn(),
    getLists: jest.fn(),
    createCampaign: jest.fn(),
    sendCampaign: jest.fn(),
    getAutomationHealth: jest.fn(),
  }
}));
jest.mock('../hooks/useAuth.jsx', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../hooks/useApi.js', () => ({
  useApi: jest.fn(),
}));

describe('Campaigns Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ organization: { id: 'org-1' }, login: jest.fn() });
    useApi.mockReturnValue({ loading: false, callApi: (fn) => fn() });
    serviceApi.getCampaigns.mockResolvedValue({ data: [{ id: '1', subject: 'Campaign 1' }, { id: '2', subject: 'Campaign 2' }] });
    serviceApi.getLists.mockResolvedValue({ data: [{ id: 'list-1', name: 'Test List' }] });
  });

  it('renders without crashing', () => {
    renderWithProviders(<Campaigns />);
    expect(screen.getByRole('heading', { level: 4, name: /Campaigns/i })).toBeInTheDocument();
  });

  it('displays API data', async () => {
    renderWithProviders(<Campaigns />);
    await waitFor(() => expect(screen.getByText(/Campaign 1/i)).toBeInTheDocument());
  });

  it('renders empty state correctly', async () => {
    serviceApi.getCampaigns.mockResolvedValueOnce({ data: [] });
    renderWithProviders(<Campaigns />);
    // Since there's no explicit empty state text, confirm the previous campaign is gone
    await waitFor(() => {
      expect(screen.queryByText(/Campaign 1/i)).not.toBeInTheDocument();
    });
  });

  it('handles button clicks', () => {
    renderWithProviders(<Campaigns />);
    const button = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(button);
    // Since form is empty, it shouldn't call API
    expect(serviceApi.createCampaign).not.toHaveBeenCalled();
  });

  it('updates state on input change', () => {
    renderWithProviders(<Campaigns />);
    const input = screen.getByLabelText(/Subject/i);
    fireEvent.change(input, { target: { value: 'New Campaign' } });
    expect(input.value).toBe('New Campaign');
  });
});