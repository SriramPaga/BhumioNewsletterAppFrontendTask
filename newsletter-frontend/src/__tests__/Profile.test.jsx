import { render, screen, waitFor } from "@testing-library/react";
import renderWithProviders from "../test-utils";
import Profile from "../pages/Profile";
import api from "../services/api";

// ✅ Mock API
jest.mock("../services/api", () => ({
  getUserProfile: jest.fn(),
}));

// ✅ Mock useAuth
jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      sub: "123", // matches your real structure
    },
  }),
}));

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading initially", () => {
    api.getUserProfile.mockResolvedValueOnce({ data: {} });

    renderWithProviders(<Profile />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders profile data from API", async () => {
    api.getUserProfile.mockResolvedValueOnce({
      data: {
        fullName: "John Doe",
        email: "john@example.com",
        role: "admin",
        organization: {
          id: "org1",
          name: "TestOrg",
        },
      },
    });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/testorg/i)).toBeInTheDocument();
  });

  it("handles missing organization name", async () => {
    api.getUserProfile.mockResolvedValueOnce({
      data: {
        fullName: "Jane Doe",
        email: "jane@example.com",
        role: "user",
        organization: {
          id: "org123",
        },
      },
    });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/org #org123/i)).toBeInTheDocument();
  });

  it("shows fallback when no data", async () => {
    api.getUserProfile.mockResolvedValueOnce({ data: null });

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(
        screen.getByText(/no user data available/i),
      ).toBeInTheDocument();
    });
  });
});