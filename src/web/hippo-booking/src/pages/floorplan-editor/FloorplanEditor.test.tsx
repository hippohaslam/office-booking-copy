
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {FloorplanEditor}  from '../../imports';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const assignableObjects: Array<BookableObject> = [
    { id: 1, name: "Desk 1", floorplanObjectId: undefined },
    { id: 2, name: "Desk 2", floorplanObjectId: undefined },
    { id: 3, name: "Desk 3", floorplanObjectId: undefined },
  ];
 
// Provide the server-side API with the request handlers.
const server = setupServer(
  http.get(`${baseUrl}/office/1`, () => {
    return HttpResponse.json({
        name: "Office 1",
        bookableObjects: assignableObjects
     })
  })
)


 

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays the data on the screen', async () => {
  render(
    <MemoryRouter initialEntries={['/office/1']}>
      <Routes>
        <Route path="/office/:officeId" element={<FloorplanEditor />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for the desks to be displayed
  const desk1 = await screen.findByText('Desk 1');
  const desk2 = await screen.findByText('Desk 2');
  const desk3 = await screen.findByText('Desk 3');

  // Check if the desks are in the document
  expect(desk1).toBeInTheDocument();
  expect(desk2).toBeInTheDocument();
  expect(desk3).toBeInTheDocument();
});