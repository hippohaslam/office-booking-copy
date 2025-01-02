import { BookableObject } from "../interfaces/Desk";
import { isNullOrEmpty } from "./StringHelpers";

const filterWithFloorPlanObjectId = (bookableObjects: BookableObject[]): BookableObject[] => {
    return bookableObjects.filter((bookableObj) => !isNullOrEmpty(bookableObj.floorPlanObjectId));
};

const filterWithExistingBooking = (bookedObjects: BookedObject[]): BookedObject[] => {
    return bookedObjects.filter((bookedObj) => bookedObj.existingBooking);
};

export const getExistingBookingsFloorPlanIds = (bookableObjects: BookableObject[], bookedObjects: BookedObject[]): string[] => {
    const existingBookings = filterWithFloorPlanObjectId(bookableObjects).filter((obj) =>
        filterWithExistingBooking(bookedObjects).some((bookedObj) => bookedObj.id === obj.id),
    );
    return existingBookings.map((obj) => obj.floorPlanObjectId!);
};

export const getExistingBookingsFloorPlanIdAndBookedBy = (bookableObjects: BookableObject[], bookedObjects: BookedObject[]): { id: string, text: string }[] => {

    const existingBookings = filterWithFloorPlanObjectId(bookableObjects).filter((obj) =>
        filterWithExistingBooking(bookedObjects).some((bookedObj) => bookedObj.id === obj.id),
    );
    // the text should be the name of the person who booked the object, that would come from the BookedObject
    return existingBookings.map((obj) => ({ id: obj.floorPlanObjectId!, text: bookedObjects.find((bookedObj) => bookedObj.id === obj.id)?.existingBooking?.name! }));
}

export const getNonExistingBookingsFloorPlanIds = (bookableObjects: BookableObject[], bookedObjects: BookedObject[]): string[] => {
    const nonExistingBookings = filterWithFloorPlanObjectId(bookableObjects).filter(
        (obj) => !filterWithExistingBooking(bookedObjects).some((bookedObj) => bookedObj.id === obj.id),
    );
    return nonExistingBookings.map((obj) => obj.floorPlanObjectId!);
};

export const getNonBookableObjects = (bookableObjects: BookableObject[]): BookableObject[] => {
    return bookableObjects.filter((bookableObj) => isNullOrEmpty(bookableObj.floorPlanObjectId));
}