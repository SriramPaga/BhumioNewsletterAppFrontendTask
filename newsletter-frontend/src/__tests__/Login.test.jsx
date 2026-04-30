import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

// 1. Mock the external dependencies
jest.mock('../services/api.js');
jest.mock('../hooks/useAuth.jsx');

// Helper to wrap component in Router context
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Login Component', () => {
  const mockLoginAction = jest.fn();

  beforeEach(() => {
    // Setup useAuth mock
    useAuth.mockReturnValue({
      login: mockLoginAction,
    });

    // Mock successful API response shape
    api.login.mockResolvedValue({
      data: { token: 'fake-jwt-token', user: { email: 'test@example.com' } }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with branding and inputs', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText(/Newsletter Console/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('handles successful login flow', async () => {
    renderWithRouter(<Login />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    // Simulate user input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Simulate form submission
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Verify API was called with correct credentials
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      // Verify the auth hook's login function was called with response data
      expect(mockLoginAction).toHaveBeenCalledWith({
        token: 'fake-jwt-token',
        user: { email: 'test@example.com' }
      });
    });
  });

  test('displays error message when API call fails', async () => {
    // Mock a specific error message
    const errorMessage = 'Invalid email or password';
    api.login.mockRejectedValueOnce(new Error(errorMessage));

    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Ensure the error Alert is visible
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  test('button is disabled while loading', async () => {
    // Mock a delayed response to test loading state
    api.login.mockReturnValue(new Promise(() => {})); 

    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    // Verify button text changes and it becomes disabled
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Signing in…/i)).toBeInTheDocument();
  });
});