
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {FloorplanEditor}  from '../../imports';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const assignableObjects: Array<BookableObject> = [
    { id: 1, name: "Desk 1", floorPlanObjectId: undefined },
    { id: 2, name: "Desk 2", floorPlanObjectId: undefined },
    { id: 3, name: "Desk 3", floorPlanObjectId: undefined },
  ];
 
// Provide the server-side API with the request handlers.
const server = setupServer(
  http.get(`${baseUrl}/office/1`, () => {
    return HttpResponse.json({
        name: "Office 1",
        description: 'This is office 1',
        bookableObjects: assignableObjects
     })
  })
)


 const queryClient = new QueryClient();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays the data on the screen', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/office/1']}>
        <Routes>
          <Route path="/office/:officeId" element={<FloorplanEditor />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  

  // find desks by input value
  // 
  const desk1 = await screen.findByTestId('edit-id-1');
  const desk2 = await screen.findByTestId('edit-id-2');
  const desk3 = await screen.findByTestId('edit-id-3');

  expect(desk1).toBeInTheDocument();
  expect(desk1).toHaveValue('Desk 1');

  expect(desk2).toBeInTheDocument();
  expect(desk2).toHaveValue('Desk 2');

  expect(desk3).toBeInTheDocument();
  expect(desk3).toHaveValue('Desk 3');
});