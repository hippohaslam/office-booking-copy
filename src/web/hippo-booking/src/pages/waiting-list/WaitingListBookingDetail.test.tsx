import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Mock, vi } from "vitest";
import WaitingListBookingDetail from "./WaitingListBookingDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Apis from "../../services/Apis";

vi.mock("../../services/Apis", () => ({
  getWaitingListBookingAsync: vi.fn(),
  getWaitingListAsync: vi.fn(),
  deleteWaitingListBookingAsync: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const getFutureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const goodBookingData = {
  id: 1,
  dateToBook: getFutureDate(7),
  area: {
    id: 1,
    name: "Test Area",
  },
  location: {
    id: 1,
    name: "Test Location",
  },
};

const waitingListData = {
  queueLength: 5,
  queuePosition: 3,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const renderWaitingListBookingDetail = (waitingListId = "1") => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/waiting-list/${waitingListId}`]}>
          <Routes>
            <Route path='/waiting-list/:waitingListId' element={<WaitingListBookingDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

describe("WaitingListBookingDetail", () => {

  beforeEach(() => {
    queryClient.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });


  it("renders loading state initially", () => {
    (Apis.getWaitingListBookingAsync as Mock).mockResolvedValueOnce(goodBookingData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListData);
    renderWaitingListBookingDetail();
    expect(screen.getByText(/Fetching booking/i)).toBeInTheDocument();
  });

  it("displays booking details when data is loaded", async () => {
    (Apis.getWaitingListBookingAsync as Mock).mockResolvedValueOnce(goodBookingData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListData);

    renderWaitingListBookingDetail();

    await waitFor(() => {
      expect(screen.getByText(/Waiting list booking details/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Area/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Test Location/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/3 of 5/i)).toBeInTheDocument();
    });
  });

  it("shows error banner when booking data fails to load", async () => {
    (Apis.getWaitingListBookingAsync as Mock).mockImplementationOnce(() => {
      return Promise.reject(new Error("Failed to load booking"));
    });

    renderWaitingListBookingDetail();

    // First wait for loading to appear
    await waitFor(() => {
      expect(screen.getByText(/Fetching booking/i)).toBeInTheDocument();
    });

    // Then wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load booking/i)).toBeInTheDocument();
    });
  });

  it("handles cancel button click and shows confirmation modal", async () => {
    (Apis.getWaitingListBookingAsync as Mock).mockResolvedValueOnce(goodBookingData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListData);

    renderWaitingListBookingDetail();

    await waitFor(() => {
      expect(screen.getByText(/Waiting list booking details/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to be removed from the waiting list\?/i)).toBeInTheDocument();
      expect(screen.getByRole('alertdialog')).toHaveTextContent(/Test Area/i);
      expect(screen.getByRole('alertdialog')).toHaveTextContent(/Test Location/i);
    });
  });

  it("handles successful cancellation", async () => {
    (Apis.getWaitingListBookingAsync as Mock).mockResolvedValueOnce(goodBookingData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListData);
    (Apis.deleteWaitingListBookingAsync as Mock).mockResolvedValueOnce({});

    renderWaitingListBookingDetail();

    await waitFor(() => {
      expect(screen.getByText(/Waiting list booking details/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to be removed from the waiting list\?/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Yes. Cancel it/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/bookings", {
        state: { cancelledWaitListBooking: goodBookingData },
      });
    });
  });

  it("handles cancellation error", async () => {
    (Apis.getWaitingListBookingAsync as Mock).mockResolvedValueOnce(goodBookingData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListData);
    (Apis.deleteWaitingListBookingAsync as Mock).mockRejectedValueOnce(new Error("Failed to cancel booking"));

    renderWaitingListBookingDetail();

    await waitFor(() => {
      expect(screen.getByText(/Waiting list booking details/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to be removed from the waiting list\?/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Yes. Cancel it/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error deleting this booking/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to cancel booking/i)).toBeInTheDocument();
    });
  });

  it("shows correct message for past bookings", async () => {
    const pastBookingData = {
      ...goodBookingData,
      dateToBook: getFutureDate(-1), // Yesterday's date
    };

    (Apis.getWaitingListBookingAsync as Mock).mockResolvedValueOnce(pastBookingData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListData);

    renderWaitingListBookingDetail();

    await waitFor(() => {
      expect(screen.getByText(/You cannot cancel this booking as it is in the past/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Cancel/i })).not.toBeInTheDocument();
    });
  });
}); 