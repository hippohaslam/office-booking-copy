interface BookingLocation {
    id: number;
    name: string;
    floorPlanJson: string;
    bookableObjects: Array<BookableObject>;
}

interface NewLocation {
    name: string;
    description: string;
}