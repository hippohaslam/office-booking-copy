import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, Mock } from "vitest";
import * as Apis from "../../../services/Apis";
import EditBooking from "./DeleteBooking";

// Mock the API functions
vi.mock("../../../services/Apis", () => ({
  deleteBookingByAdminAsync: vi.fn(),
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement, initialEntries: Array<any>) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path='/admin/bookings/:id' element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("Delete booking", () => {
  it("should show booking details on first render", async () => {
    const booking = {
      id: 1,
      date: new Date(),
      bookedBy: "User 1",
      bookableObject: { name: "Object 1" },
    };
    renderWithProviders(<EditBooking />, [{ pathname: "/admin/bookings/1", state: { booking } }]);
    expect(screen.getByText(`Booking ID: ${1}`)).toBeInTheDocument();
    expect(screen.getByText(`Date: ${new Date(booking.date).toString()}`)).toBeInTheDocument();
    expect(screen.getByText(`Booked by: ${booking.bookedBy}`)).toBeInTheDocument();
    expect(screen.getByText(`Booking name: ${booking.bookableObject.name}`)).toBeInTheDocument();
  });

  it("should call delete booking if delete button is clicked", async () => {
    (Apis.deleteBookingByAdminAsync as Mock).mockResolvedValueOnce({});
    const booking = {
      id: 1,
      date: new Date(),
      bookedBy: "User 1",
      bookableObject: { name: "Object 1" },
    };
    renderWithProviders(<EditBooking />, [{ pathname: "/admin/bookings/1", state: { booking } }]);
    fireEvent.click(screen.getByText("Yes. Cancel it"));
    await waitFor(() => {
      expect(Apis.deleteBookingByAdminAsync).toHaveBeenCalledWith(1);
    });
  });
  it.todo("should show error message if delete booking fails", async () => {});
});
