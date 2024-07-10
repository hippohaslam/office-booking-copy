interface Location {
    id: number;
    name: string;
    floorPlanJson: string;
    bookableObjects: Array<BookableObject>;
}