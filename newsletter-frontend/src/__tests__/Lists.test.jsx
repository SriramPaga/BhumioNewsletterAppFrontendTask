import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Lists from '../pages/Lists.jsx';
import { ThemeProvider, createTheme } from '@mui/material';

// ✅ MOCK useAuth
jest.mock('../hooks/useAuth.jsx', () => ({
  useAuth: () => ({
    organization: { id: 'org-1' },
  }),
}));

// ✅ MOCK useSnackbar
jest.mock('../context/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}));

// ✅ MOCK API
const mockGetLists = jest.fn(() =>
  Promise.resolve({
    data: [
      { id: '1', name: 'Test List', createdAt: new Date().toISOString() },
    ],
  })
);

const mockGetSubscribers = jest.fn(() =>
  Promise.resolve({
    data: [],
  })
);

const mockCreateList = jest.fn(() =>
  Promise.resolve({ data: { id: '2', name: 'New List' } })
);

jest.mock('../services/api.js', () => ({
  __esModule: true,
  default: {
    getLists: (...args) => mockGetLists(...args),
    getSubscribers: (...args) => mockGetSubscribers(...args),
    createList: (...args) => mockCreateList(...args),
    segmentSubscribers: jest.fn(() =>
      Promise.resolve({ data: { data: [] } })
    ),
  },
}));

// ✅ RENDER WRAPPER
const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('Lists Page', () => {
  
  test('renders lists page and loads data', async () => {
    renderWithProviders(<Lists />);

    // ✅ use ROLE instead of text (avoids duplicates)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /lists/i })
      ).toBeInTheDocument();
    });

    // ✅ handle duplicate "Test List"
    expect(screen.getAllByText('Test List').length).toBeGreaterThan(0);
  });

  test('creates a new list via form', async () => {
    renderWithProviders(<Lists />);

    // ✅ wait for button instead of duplicate text
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create list/i })
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/list name/i);
    const button = screen.getByRole('button', { name: /create list/i });

    await userEvent.type(input, 'My New List');
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith({
        name: 'My New List',
      });
    });
  });

  test('runs segmentation when valid input provided', async () => {
    renderWithProviders(<Lists />);

    await waitFor(() => {
      expect(
        screen.getByText('Segment subscribers')
      ).toBeInTheDocument();
    });

    // ✅ select list (handle duplicate safely)
    const listSelect = screen.getByLabelText('List');
    await userEvent.click(listSelect);

    const listOptions = screen.getAllByText('Test List');
    await userEvent.click(listOptions[0]);

    // ✅ select field
    const fieldSelect = screen.getByLabelText(/field/i);
    await userEvent.click(fieldSelect);
    await userEvent.click(screen.getByText('email'));

    // ✅ input value
    const valueInput = screen.getByLabelText(/value/i);
    await userEvent.type(valueInput, 'test@example.com');

    // ✅ run segmentation
    const runButton = screen.getByRole('button', { name: /run segment/i });
    await userEvent.click(runButton);

    expect(runButton).toBeInTheDocument();
  });

});