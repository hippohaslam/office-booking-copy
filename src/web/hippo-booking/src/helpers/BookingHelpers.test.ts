import { BookableObject } from "../interfaces/Desk";
import { getExistingBookingsFloorPlanIdAndBookedBy, getExistingBookingsFloorPlanIds, getNonBookableObjects, getNonExistingBookingsFloorPlanIds } from "./BookingHelpers";

describe("BookingHelpers", () => {

    describe("getExistingBookingsFloorPlanIds", () => {
        test("Should return an empty array of bookings if none found", () => {
            const bookings = getExistingBookingsFloorPlanIds([], []);
            expect(bookings).toEqual([]);
        });

        test("Should return an array of bookings if found", () => {
            const bookableObjects: BookableObject[] = [
                {
                    id: 1,
                    name: "Desk 1",
                    floorPlanObjectId: "1",
                    bookableObjectTypeId: 1,
                },
                {
                    id: 2,
                    name: "Desk 2",
                    floorPlanObjectId: "2",
                    bookableObjectTypeId: 1,
                },
            ];
            const bookedObjects: BookedObjects = {
                bookableObjects: [
                    {
                        id: 1,
                        name: "Desk 1",
                        description: "Desk 1 description",
                        existingBooking: {
                            id: 1,
                            name: "Desk 1",
                        },
                    },
                    {
                        id: 2,
                        name: "Desk 2",
                        description: "Desk 2 description",
                    },
                ],
            };
            const bookings = getExistingBookingsFloorPlanIds(bookableObjects, bookedObjects.bookableObjects);
            expect(bookings).toEqual(["1"]);
        });
    });

    describe("getNonExistingBookingsFloorPlanIds", () => {
        test("Should return an empty array of bookings if none found", () => {
            const bookings = getNonExistingBookingsFloorPlanIds([], []);
            expect(bookings).toEqual([]);
        });

        test("Should return an array of bookings if found", () => {
            const bookableObjects: BookableObject[] = [
                {
                    id: 1,
                    name: "Desk 1",
                    floorPlanObjectId: "1",
                    bookableObjectTypeId: 1,
                },
                {
                    id: 2,
                    name: "Desk 2",
                    floorPlanObjectId: "2",
                    bookableObjectTypeId: 1,
                },
            ];
            const bookedObjects: BookedObjects = {
                bookableObjects: [
                    {
                        id: 1,
                        name: "Desk 1",
                        description: "Desk 1 description",
                    },
                    {
                        id: 2,
                        name: "Desk 2",
                        description: "Desk 2 description",
                    },
                    {
                        id: 3,
                        name: "Desk 3",
                        description: "Desk 3 description",
                        existingBooking: {
                            id: 3,
                            name: "Desk 3",
                        },
                    },
                ],
            };
            const bookings = getNonExistingBookingsFloorPlanIds(bookableObjects, bookedObjects.bookableObjects);
            expect(bookings).toEqual(["1", "2"]);
        });
    });

    describe("getNonBookableObjects", () => {
        test("Should return an empty array of bookings if none found", () => {
            const bookings = getNonBookableObjects([]);
            expect(bookings).toEqual([]);
        });

        test("Should return an array of bookings if found", () => {
            const bookableObjects: BookableObject[] = [
                {
                    id: 1,
                    name: "Desk 1",
                    floorPlanObjectId: "1",
                    bookableObjectTypeId: 1,
                },
                {
                    id: 2,
                    name: "Desk 2",
                    bookableObjectTypeId: 1,
                },
                {
                    id: 3,
                    name: "Desk 3",
                    floorPlanObjectId: "3",
                    bookableObjectTypeId: 1,
                }
            ];
            const bookings = getNonBookableObjects(bookableObjects);
            expect(bookings).toEqual([bookableObjects[1]]);
        });
    });

    describe("getExistingBookingsFloorPlanIdAndBookedBy", () => {
        test("Should return an empty array of bookings if none found", () => {
            const bookings = getExistingBookingsFloorPlanIdAndBookedBy([], []);
            expect(bookings).toEqual([]);
        });

        test("Should the booking with a existing booking", () => {
            const bookableObjects: BookableObject[] = [
                {
                    id: 1,
                    name: "Desk 1",
                    floorPlanObjectId: "1",
                    bookableObjectTypeId: 1,
                },
                {
                    id: 2,
                    name: "Desk 2",
                    floorPlanObjectId: "2",
                    bookableObjectTypeId: 1,
                },
            ];
            const bookedObjects: BookedObjects = {
                bookableObjects: [
                    {
                        id: 1,
                        name: "Desk 1",
                        description: "Desk 1 description",
                        existingBooking: {
                            id: 1,
                            name: "Booked by Mr Test",
                        },
                    },
                    {
                        id: 2,
                        name: "Desk 2",
                        description: "Desk 2 description",
                    },
                ],
            };
            const bookings = getExistingBookingsFloorPlanIdAndBookedBy(bookableObjects, bookedObjects.bookableObjects);
            expect(bookings).toEqual([
                {
                    id: "1",
                    text: "Booked by Mr Test",
                },
            ]);
        });
    });
});
