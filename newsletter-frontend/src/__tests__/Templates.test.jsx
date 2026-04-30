import { render, screen, fireEvent } from '@testing-library/react';
import renderWithProviders from '../test-utils';
import Templates from '../pages/Templates';

describe('Templates Component', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Templates />);
    expect(screen.getByRole('heading', { level: 4, name: /Templates/i })).toBeInTheDocument();
  });

  it('allows typing in title input', () => {
    renderWithProviders(<Templates />);
    const input = screen.getByLabelText(/Title/i);
    fireEvent.change(input, { target: { value: 'New Template' } });
    expect(input.value).toBe('New Template');
  });

  it('allows typing in content input', () => {
    renderWithProviders(<Templates />);
    const input = screen.getByLabelText(/Content/i);
    fireEvent.change(input, { target: { value: 'Template content' } });
    expect(input.value).toBe('Template content');
  });

  it('handles save button click', () => {
    renderWithProviders(<Templates />);
    const titleInput = screen.getByLabelText(/Title/i);
    const contentInput = screen.getByLabelText(/Content/i);
    const saveButton = screen.getByRole('button', { name: /Save/i });

    fireEvent.change(titleInput, { target: { value: 'Test Template' } });
    fireEvent.change(contentInput, { target: { value: 'Test content' } });
    fireEvent.click(saveButton);

    // Check if template is added to the list (assuming it renders the title)
    expect(screen.getByText('Test Template')).toBeInTheDocument();
  });

  it('loads templates from localStorage', () => {
    const storedTemplates = [{ id: '1', title: 'Stored Template', content: 'Stored content' }];
    localStorage.setItem('newsletter_templates', JSON.stringify(storedTemplates));

    renderWithProviders(<Templates />);

    expect(screen.getByText('Stored Template')).toBeInTheDocument();
  });
});