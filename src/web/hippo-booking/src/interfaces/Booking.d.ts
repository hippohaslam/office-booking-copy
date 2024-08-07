interface Booking {
    bookingId: number;
    date: Date;
    bookableObject: BookableObject;
    location: BookingLocation;
    area: Area;
}

interface BookedObject {
    id: number;
    name: string;
    description?: string;
    existingBooking?: {
        id: number;
        name: string;
    };
}

interface BookedObjects {
    bookableObjects: BookedObject[];
}