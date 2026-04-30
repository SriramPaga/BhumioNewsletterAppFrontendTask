// import { screen, waitFor, fireEvent } from "@testing-library/react";
// import { renderWithProviders } from "../test-utils";
// import Lists from "../pages/Lists";
// import * as api from "../services/api";
// import { useAuth } from "../hooks/useAuth.jsx";
// import { useApi } from "../hooks/useApi";

// jest.mock("../services/api");

// jest.mock("../hooks/useAuth.jsx", () => ({
//   useAuth: jest.fn(),
// }));

// jest.mock("../hooks/useApi", () => ({
//   useApi: jest.fn(),
// }));

// describe("Lists Component", () => {
//   beforeEach(() => {
//     useAuth.mockReturnValue({
//       organization: { id: "org-1" },
//       login: jest.fn(),
//     });

//     useApi.mockReturnValue({
//       loading: false,
//       callApi: async (fn) => {
//         const res = await fn();
//         return res || { data: [] }; // 🔥 prevents undefined crash
//       },
//     });

//     api.getLists = jest.fn().mockResolvedValue({ data: [] });
//     api.getSubscribers = jest.fn().mockResolvedValue({ data: [] });
//     api.createList = jest.fn().mockResolvedValue({ data: {} });
//   });

//   it("renders without crashing", () => {
//     renderWithProviders(<Lists />);

//     expect(screen.getByText(/organize subscribers/i)).toBeInTheDocument();
//   });

//   it("renders empty state correctly", async () => {
//     renderWithProviders(<Lists />);

//     expect(await screen.findByText(/no lists yet/i)).toBeInTheDocument();
//   });

//   it("updates input field", () => {
//     renderWithProviders(<Lists />);

//     const input = screen.getByLabelText(/list name/i);

//     fireEvent.change(input, {
//       target: { value: "Test List" },
//     });

//     expect(input.value).toBe("Test List");
//   });

//   //   it("submits form and calls API", async () => {
//   //     renderWithProviders(<Lists />);

//   //     const input = screen.getByLabelText(/list name/i);

//   //     fireEvent.change(input, {
//   //       target: { value: "Test List" },
//   //     });

//   //     const button = screen.getByRole("button", { name: /create list/i });

//   //     // ✅ WAIT until enabled
//   //     await waitFor(() => {
//   //       expect(button).not.toBeDisabled();
//   //     });

//   //     fireEvent.submit(button.closest("form"));

//   //     // ✅ wait for create API
//   //     await waitFor(() => {
//   //       expect(api.createList).toHaveBeenCalledTimes(1);
//   //     });

//   //     // ✅ IMPORTANT: also ensure refresh call happens
//   //     await waitFor(() => {
//   //       expect(api.getLists).toHaveBeenCalledTimes(2);
//   //     });
//   //   });

//   it("submits form and calls API", async () => {
//     renderWithProviders(<Lists />);

//     const input = screen.getByLabelText(/list name/i);

//     fireEvent.change(input, {
//       target: { value: "Test List" },
//     });

//     const button = screen.getByRole("button", { name: /create list/i });

//     await waitFor(() => {
//       expect(button).not.toBeDisabled();
//     });

//     // ✅ FIX: get actual form element safely
//     const form = button.closest("form");
//     expect(form).toBeInTheDocument();
//     console.log("submitting form:", form);
//     fireEvent.submit(form);

//     await waitFor(() => {
//       expect(api.createList).toHaveBeenCalled();
//     });
//   });
// });

// import React from "react";
// import { render, screen, waitFor, fireEvent } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import Lists from "../pages/Lists"; // Adjust path accordingly
// import api from "../services/api.js";
// import { useAuth } from "../hooks/useAuth.jsx";
// import { useApi } from "../hooks/useApi.js";

// // 1. Mock the external dependencies
// jest.mock("../services/api.js");
// jest.mock("../hooks/useAuth.jsx");
// jest.mock("../hooks/useApi.js");

// describe("Lists Component", () => {
//   const mockLists = [
//     {
//       id: "1",
//       name: "Test Marketing List",
//       organization: { name: "Bhumio" },
//       createdAt: "2026-04-28T10:00:00Z",
//     },
//   ];

//   const mockSubscribers = [
//     {
//       id: "sub1",
//       email: "test@example.com",
//       customFields: { city: "Bengaluru" },
//     },
//   ];

//   beforeEach(() => {
//     // Setup useAuth mock
//     useAuth.mockReturnValue({
//       organization: { id: "org-123", name: "Bhumio" },
//     });

//     // Setup useApi mock
//     // We simulate the callApi wrapper which takes a function and returns the result
//     useApi.mockReturnValue({
//       loading: false,
//       callApi: jest.fn((apiFunc) => apiFunc()),
//     });

//     // Setup API mocks
//     api.getLists.mockResolvedValue({ data: mockLists });
//     api.getSubscribers.mockResolvedValue({ data: mockSubscribers });
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test("renders the Lists header and fetches lists on mount", async () => {
//     render(<Lists />);
//     const pageHeader = screen.getByRole("heading", {
//       level: 4,
//       name: /^Lists$/i,
//     });
//     const tableHeader = screen.getByRole("heading", {
//       level: 6,
//       name: /^Lists$/i,
//     });

//     expect(pageHeader).toBeInTheDocument();
//     expect(tableHeader).toBeInTheDocument();
//     // Check if header exists
//     expect(screen.getByText("Lists")).toBeInTheDocument();
//     expect(
//       screen.getByText("Organize subscribers and define segmentation rules"),
//     ).toBeInTheDocument();

//     // Wait for the API data to render in the table
//     await waitFor(() => {
//       expect(screen.getByText("Test Marketing List")).toBeInTheDocument();
//       expect(screen.getByText("Bhumio")).toBeInTheDocument();
//     });
//   });

//   test('shows "No lists yet" message when the list is empty', async () => {
//     api.getLists.mockResolvedValue({ data: [] });

//     render(<Lists />);

//     await waitFor(() => {
//       expect(screen.getByText(/No lists yet/i)).toBeInTheDocument();
//     });
//   });

//   test('updates the "List name" input value on change', () => {
//     render(<Lists />);

//     const input = screen.getByLabelText(/List name/i);
//     fireEvent.change(input, { target: { value: "New Beta List" } });

//     expect(input.value).toBe("New Beta List");
//   });

//   test('calls createList API when "Create list" is clicked', async () => {
//     api.createList.mockResolvedValue({ success: true });

//     render(<Lists />);

//     const input = screen.getByLabelText(/List name/i);
//     const submitButton = screen.getByRole("button", { name: /Create list/i });

//     fireEvent.change(input, { target: { value: "Awesome Campaign List" } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(api.createList).toHaveBeenCalledWith(
//         expect.objectContaining({
//           name: "Awesome Campaign List",
//         }),
//       );
//     });
//   });
// });

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Lists from "../pages/Lists";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useApi } from "../hooks/useApi.js";

// Mocking dependencies
jest.mock("../services/api.js");
jest.mock("../hooks/useAuth.jsx");
jest.mock("../hooks/useApi.js");

describe("Lists Component - Assignment Logic", () => {
  const mockLists = [
    {
      id: "1",
      name: "Beta Testers",
      organization: { name: "Bhumio" },
      createdAt: "2026-04-28T10:00:00Z",
    },
  ];

  const mockSubscribers = [
    { id: "sub1", email: "user@bhumio.com", customFields: { role: "admin" } },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue({ organization: { id: "org_1", name: "Bhumio" } });

    useApi.mockReturnValue({
      loading: false,
      callApi: jest.fn((apiFunc) => apiFunc()),
    });

    api.getLists.mockResolvedValue({ data: mockLists });
    api.getSubscribers.mockResolvedValue({ data: mockSubscribers });
  });

  test("should render unique headings and load data correctly", async () => {
    render(<Lists />);

    // Unique heading checks
    expect(screen.getByText("Subscriber List")).toBeInTheDocument(); // h4
    expect(screen.getByText("Available Lists")).toBeInTheDocument(); // if you changed h6 to this

    await waitFor(() => {
      const tableCell = screen.getByRole("cell", { name: /Beta Testers/i });
      expect(tableCell).toBeInTheDocument();

      // Check for the organization name in the table
      expect(screen.getByText("Bhumio")).toBeInTheDocument();
    });
  });

  test("should handle list creation flow", async () => {
    api.createList.mockResolvedValue({ success: true });
    render(<Lists />);

    const input = screen.getByLabelText(/List name/i);
    const button = screen.getByRole("button", { name: /Create list/i });

    fireEvent.change(input, { target: { value: "Marketing 2026" } });
    fireEvent.click(button);

    await waitFor(() => {
      // Verifies the specific payload structure you logged in console.log
      expect(api.createList).toHaveBeenCalledWith({ name: "Marketing 2026" });
    });
  });

  test("should populate available segment fields from subscribers", async () => {
    render(<Lists />);

    // Clicking the Field select to see options
    const selectLabel = screen.getByLabelText(/Field \(eg: email\)/i);
    fireEvent.mouseDown(selectLabel);

    await waitFor(() => {
      // Should show base fields and custom fields found in mockSubscribers
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("role")).toBeInTheDocument();
    });
  });
});
