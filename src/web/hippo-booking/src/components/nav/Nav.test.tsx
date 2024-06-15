import { BrowserRouter } from 'react-router-dom';
import Nav from './Nav';
import {render, screen} from '@testing-library/react';

test('Navigation has links', async () => {
	render(<BrowserRouter><Nav /></BrowserRouter>);
  
	// Check that "Desks" is a link
	const link = screen.getByRole('link', { name: /Booking/i });
	expect(link).toBeInTheDocument();
})

export default {}