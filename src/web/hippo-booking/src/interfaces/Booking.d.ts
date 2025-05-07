interface Booking {
  id: number;
  date: Date;
  bookableObject: BookableObject;
  location: BookingLocation;
  area: Area;
}

interface AdminBooking extends Booking {
  bookedBy: string;
}

interface NewBooking {
  date: string;
  bookableObjectId: number;
  areaId: number;
}

interface BookedObject {
  id: number;
  name: string;
  description?: string;
  existingBooking?: IdName;
}

interface BookedObjects {
  bookableObjects: BookedObject[];
}
