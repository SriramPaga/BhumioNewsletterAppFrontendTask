import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

test('renders navigation items', () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
  expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Subscribers').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Campaigns').length).toBeGreaterThan(0);
});
