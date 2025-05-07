import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Mock, vi } from "vitest";
import WaitingListJoin from "./WaitingListJoin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Apis from "../../services/Apis";

// Mock the API calls
vi.mock("../../services/Apis", () => ({
  getLocationAsync: vi.fn(),
  addToWaitingListAsync: vi.fn(),
  getWaitingListAsync: vi.fn(),
}));

// Mock useNavigate globally
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      retry: false, // Disable retries for tests
    },
  },
});

const goodLocationData = {
  id: 1,
  name: "Test Location",
  areas: [{ id: "1", name: "Test Area" }],
};

const waitingListDataNoQueuePosition = {
  queueLength: 5,
  queuePosition: null,
};

const waitingListDataWithPosition = {
  queueLength: 5,
  queuePosition: 3,
};

const renderWaitingListJoin = (initialEntries = ["/locations/1/areas/1/waiting-list/join?date=2025-03-25"]) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path='/locations/:locationId/areas/:areaId/waiting-list/join' element={<WaitingListJoin />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("WaitingListJoin", () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // Clear mock calls before each test
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (Apis.getLocationAsync as Mock).mockResolvedValueOnce(goodLocationData);
    (Apis.getWaitingListAsync as Mock).mockResolvedValueOnce(waitingListDataNoQueuePosition);
    renderWaitingListJoin();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders the waiting list page with location and area details", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => waitingListDataNoQueuePosition);
    renderWaitingListJoin();

    await waitFor(() => {
      expect(screen.getAllByText(/Test Location/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Test Area/i).length).toBeGreaterThan(0);
    });
  });

  it("displays the correct number of people on the waiting list", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => waitingListDataNoQueuePosition);

    renderWaitingListJoin();

    await waitFor(() => {
      expect(screen.getByText(/There are currently 5 people on the waiting list/i)).toBeInTheDocument();
    });
  });

  it("shows appropriate message and only back button when user is already in queue", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => waitingListDataWithPosition);

    renderWaitingListJoin();

    await waitFor(() => {
      // Check for the message about being in the queue
      expect(screen.getByText(/You are already in position 3 of 5 in the queue/i)).toBeInTheDocument();
      
      // Verify only the back button is present
      expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
    });
  });

  it("handles confirm button click", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.addToWaitingListAsync as Mock).mockResolvedValueOnce({});
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => waitingListDataNoQueuePosition);

    renderWaitingListJoin();

    // Wait for the location data to load
    expect(await screen.findByText(/join waiting list for/i)).toBeInTheDocument();

    // Simulate confirm button click
    const confirmButton = await screen.findByRole("button", { name: /Confirm/i });
    confirmButton.click();

    // Assert that addToWaitingListAsync was called
    await waitFor(() => {
      expect(Apis.addToWaitingListAsync).toHaveBeenCalledOnce();
    });
  });

  it("shows error banner when adding to waiting list fails", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => waitingListDataNoQueuePosition);
    (Apis.addToWaitingListAsync as Mock).mockRejectedValueOnce(new Error("Failed to join waiting list"));

    renderWaitingListJoin();

    // Wait for the location data to load
    expect(await screen.findByText(/join waiting list for/i)).toBeInTheDocument();

    // Simulate confirm button click
    const confirmButton = await screen.findByRole("button", { name: /Confirm/i });
    confirmButton.click();

    // Assert that error banner is shown
    await waitFor(() => {
      expect(screen.getByText(/Failed to join waiting list/i)).toBeInTheDocument();
    });
  });

  it("redirects when date parameter is missing", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });

    renderWaitingListJoin(["/locations/1/areas/1/waiting-list/join"]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/locations/1/areas/1");
    });
  });

  it("redirects when area does not exist in location", async () => {
    const locationDataWithoutArea = {
      id: 1,
      name: "Test Location",
      areas: [{ id: "2", name: "Different Area" }], // Area with ID 1 doesn't exist
    };

    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return locationDataWithoutArea;
      };
    });

    renderWaitingListJoin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/not-found");
    });
  });

  it("shows correct message when queue is empty", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => ({
      queueLength: 0,
      queuePosition: null,
    }));

    renderWaitingListJoin();

    await waitFor(() => {
      expect(screen.getByText(/There are currently 0 people on the waiting list/i)).toBeInTheDocument();
    });
  });

  it("shows correct message when user is first in queue", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => ({
      queueLength: 3,
      queuePosition: 1,
    }));

    renderWaitingListJoin();

    await waitFor(() => {
      expect(screen.getByText(/You are already in position 1 of 3 in the queue/i)).toBeInTheDocument();
    });
  });

  it("shows correct message when user is last in queue", async () => {
    (Apis.getLocationAsync as Mock).mockImplementationOnce(() => {
      return async () => {
        return goodLocationData;
      };
    });
    (Apis.getWaitingListAsync as Mock).mockImplementationOnce(() => ({
      queueLength: 3,
      queuePosition: 3,
    }));

    renderWaitingListJoin();

    await waitFor(() => {
      expect(screen.getByText(/You are already in position 3 of 3 in the queue/i)).toBeInTheDocument();
    });
  });
});
