import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Analytics from "../pages/Analytics.jsx";
import { ThemeProvider, createTheme } from "@mui/material";

// 🔥 mock API
jest.mock("../services/api", () => ({
  getCampaigns: jest.fn(() => Promise.resolve({ data: [] })),
  getCampaignStats: jest.fn(() =>
    Promise.resolve({ data: { opens: 0, clicks: 0 } }),
  ),
}));

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
};

describe("Analytics Page", () => {
  test("renders analytics header", async () => {
    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /analytics/i }),
      ).toBeInTheDocument();
    });
  });

  test("shows empty state when no data", async () => {
    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText(/no campaigns found/i)).toBeInTheDocument();
    });
  });
});
