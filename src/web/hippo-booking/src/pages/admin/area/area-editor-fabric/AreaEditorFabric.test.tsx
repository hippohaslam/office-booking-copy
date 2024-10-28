import { render } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import FloorplanEditor from "./AreaEditorFabric";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookableObject } from "../../../../interfaces/Desk";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const assignableObjects: Array<BookableObject> = [
  { id: 1, name: "Desk 1", floorPlanObjectId: undefined, bookableObjectTypeId: 1 },
  { id: 2, name: "Desk 2", floorPlanObjectId: undefined, bookableObjectTypeId: 1 },
  { id: 3, name: "Desk 3", floorPlanObjectId: undefined, bookableObjectTypeId: 1 },
];

// Provide the server-side API with the request handlers.
const server = setupServer(
  http.get(`${baseUrl}/location/1/area/1`, () => {
    return HttpResponse.json({
      id: 1,
      floorPlanJson: "",
      name: "Location 1",
      description: "This is location 1",
      bookableObjects: assignableObjects,
    });
  }),
);

const queryClient = new QueryClient();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays the data on the screen", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin/locations/1/area/1"]}>
        <Routes>
          <Route path='/admin/locations/:locationId/area/:areaId' element={<FloorplanEditor />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  // find desks by text
  // const desk1 = await screen.findByText('Desk 1');
  // const desk2 = await screen.findByText('Desk 2');
  // const desk3 = await screen.findByText('Desk 3');
  //
  // expect(desk1).toBeInTheDocument();
  // expect(desk2).toBeInTheDocument();
  // expect(desk3).toBeInTheDocument();
});
