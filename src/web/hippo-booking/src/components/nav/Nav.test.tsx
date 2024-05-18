import Nav from './Nav';
import {render, screen} from '@testing-library/react';

test('Navigation has links', async () => {
	render(<Nav />);

	// Check that "Parking" is a link
	const parkingLink = screen.getByRole('link', { name: /Parking/i });
	expect(parkingLink).toBeInTheDocument();
  
	// Check that "Desks" is a link
	const desksLink = screen.getByRole('link', { name: /Desks/i });
	expect(desksLink).toBeInTheDocument();
})

export default {}