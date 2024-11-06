import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminBookings from "./AdminBookings";
import * as Apis from "../../../services/Apis";

// Mock the API functions
vi.mock("../../../services/Apis", () => ({
  getLocationsAsync: vi.fn(),
  getLocationAreasAsync: vi.fn(),
  getAllBookingWithinAsync: vi.fn(),
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin/bookings"]}>
        <Routes>
          <Route path='/admin/bookings' element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AdminBookings", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("initial fetch will show a list of locations in a select", async () => {
    (Apis.getLocationsAsync as Mock).mockImplementationOnce((_ = false) => {
      return async () => [
        { id: 1, name: "Location 1" },
        { id: 2, name: "Location 2" },
      ];
    });

    renderWithProviders(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByLabelText("Location:")).toBeInTheDocument();
    });

    const locationSelect = screen.getByLabelText("Location:");
    fireEvent.click(locationSelect);

    await waitFor(() => {
      expect(screen.getByText("Location 1")).toBeInTheDocument();
      expect(screen.getByText("Location 2")).toBeInTheDocument();
    });
  });

  it("Selecting a location will populate the area", async () => {
    (Apis.getLocationsAsync as Mock).mockImplementationOnce((_ = false) => {
      return async () => [
        { id: 1, name: "Location 1" },
        { id: 2, name: "Location 2" },
      ];
    });
    (Apis.getLocationAreasAsync as Mock).mockImplementationOnce((_ = false) => {
      return async (locationId: number) => [
        { id: 1, name: "Area 1", locationId },
        { id: 2, name: "Area 2", locationId },
      ];
    });

    renderWithProviders(<AdminBookings />);

    const locationSelect = await screen.findByLabelText("Location:");
    fireEvent.change(locationSelect, { target: { value: "1" } });

    await waitFor(() => {
      expect(screen.getByLabelText("Area:")).toBeInTheDocument();
    });

    const areaSelect = screen.getByLabelText("Area:");
    fireEvent.click(areaSelect);

    await waitFor(() => {
      expect(screen.getByText("Area 1")).toBeInTheDocument();
      expect(screen.getByText("Area 2")).toBeInTheDocument();
    });
  });

  it("Selecting an area and clicking submit will show a table", async () => {
    (Apis.getLocationsAsync as Mock).mockImplementationOnce((_ = false) => {
      return async () => [
        { id: 1, name: "Location 1" },
        { id: 2, name: "Location 2" },
      ];
    });
    (Apis.getLocationAreasAsync as Mock).mockImplementationOnce((_ = false) => {
      return async (locationId: number) => [
        { id: 1, name: "Area 1", locationId },
        { id: 2, name: "Area 2", locationId },
      ];
    });
    (Apis.getAllBookingWithinAsync as Mock).mockResolvedValueOnce([
      { id: 1, date: new Date(), bookedBy: "User 1", bookableObject: { name: "Object 1" } },
    ]);

    renderWithProviders(<AdminBookings />);

    const locationSelect = await screen.findByLabelText("Location:");
    fireEvent.change(locationSelect, { target: { value: "1" } });

    const areaSelect = await screen.findByLabelText("Area:");
    fireEvent.change(areaSelect, { target: { value: "1" } });

    const submitButton = screen.getByText("Get bookings");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Booking ID")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Booked by")).toBeInTheDocument();
      expect(screen.getByText("Booking name")).toBeInTheDocument();
    });
  });

  it("Selecting an area and clicking submit that has no results will show the no results message", async () => {
    (Apis.getLocationsAsync as Mock).mockImplementationOnce((_ = false) => {
      return async () => [{ id: 1, name: "Location 1" }];
    });
    (Apis.getLocationAreasAsync as Mock).mockImplementationOnce((_ = false) => {
      return async (locationId: number) => [{ id: 1, name: "Area 1", locationId }];
    });
    (Apis.getAllBookingWithinAsync as Mock).mockResolvedValueOnce([]);

    renderWithProviders(<AdminBookings />);

    const locationSelect = await screen.findByLabelText("Location:");
    fireEvent.change(locationSelect, { target: { value: "1" } });

    const areaSelect = await screen.findByLabelText("Area:");
    fireEvent.change(areaSelect, { target: { value: "1" } });

    const submitButton = screen.getByText("Get bookings");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("No bookings found.")).toBeInTheDocument();
    });
  });

  it("Error banner is shown if an error occurs on getting bookings", async () => {
    (Apis.getLocationsAsync as Mock).mockImplementationOnce((_ = false) => {
      return async () => [{ id: 1, name: "Location 1" }];
    });
    (Apis.getLocationAreasAsync as Mock).mockImplementationOnce((_ = false) => {
      return async (locationId: number) => [{ id: 1, name: "Area 1", locationId }];
    });
    (Apis.getAllBookingWithinAsync as Mock).mockRejectedValueOnce(new Error("Error fetching bookings"));

    renderWithProviders(<AdminBookings />);

    const locationSelect = await screen.findByLabelText("Location:");
    fireEvent.change(locationSelect, { target: { value: "1" } });

    const areaSelect = await screen.findByLabelText("Area:");
    fireEvent.change(areaSelect, { target: { value: "1" } });

    const submitButton = screen.getByText("Get bookings");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error fetching bookings")).toBeInTheDocument();
    });
  });
});
