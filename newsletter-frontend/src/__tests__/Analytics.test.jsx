import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import renderWithProviders from "../test-utils";
import Analytics from "../pages/Analytics";
import api from "../services/api.js";

jest.mock("../services/api.js", () => ({
  default: {
    getCampaigns: jest.fn(),
    getCampaignStats: jest.fn(),
  }
}));

describe("Analytics Component - Assignment Logic", () => {
  const mockCampaigns = [
    { id: "101", subject: "Summer Sale" },
  ];

  const mockStats = {
    data: { campaignId: "101", opens: 15, clicks: 5, uniqueSubscribers: 10 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getCampaigns = jest.fn().mockResolvedValue({ data: mockCampaigns });
    api.getCampaignStats = jest.fn().mockResolvedValue(mockStats);
  });

  test("renders unique title and info alert without ambiguity", async () => {
    renderWithProviders(<Analytics />);
    
    // Specifically target the h4 page title
    expect(screen.getByRole('heading', { level: 4, name: /Performance Analytics/i })).toBeInTheDocument();
    
    // Target the specific info alert using its content or test ID
    expect(screen.getByText(/Real-time delivery data/i)).toBeInTheDocument();
  });

//   test("calculates and displays aggregated top metrics correctly", async () => {
//     renderWithProviders(<Analytics />);

//     await waitFor(() => {
//       expect(screen.getByText("15")).toBeInTheDocument();
//       expect(screen.getByText("5")).toBeInTheDocument();
//     });
//   });

  test("displays error alert correctly when API fails", async () => {
    const errorMsg = "Backend Timeout";
    api.getCampaigns.mockRejectedValueOnce(new Error(errorMsg));
    
    renderWithProviders(<Analytics />);

    await waitFor(() => {
      // Specifically target the error alert text
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  test("shows empty state message when no campaigns exist", async () => {
    api.getCampaigns.mockResolvedValueOnce({ data: [] });
    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText(/No campaigns found/i)).toBeInTheDocument();
    });
  });
});