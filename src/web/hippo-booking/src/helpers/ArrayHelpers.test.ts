import { compareAlphabeticallyByPropertyWithNumbers } from "./ArrayHelpers";

type testObject = {
    id: number;
    name: string;
}

describe("compareAlphabeticalByPropertyWithNumbers", () => {
    it("should order array in correctly", () => {
        // Arrange
        const array : testObject[] = [
            {id: 1, name: "Desk 2"},
            {id: 2, name: "Desk 1"},
            {id: 3, name: "3"},
            {id: 4, name: "12 - Desk"},
            {id: 5, name: "Desk 11"},
            {id: 6, name: "Desk 7 - new"},
            {id: 7, name: "A30 - tiny printer"},
            {id: 8, name: "6 zebras"},
        ];
    
        // Act
        const orderedArray = array.sort((a, b) => compareAlphabeticallyByPropertyWithNumbers(a, b, "name"));

        // Assert
        const expectedArray : testObject[] = [
            {id: 2, name: "Desk 1"},
            {id: 1, name: "Desk 2"},
            {id: 3, name: "3"},
            {id: 8, name: "6 zebras"},
            {id: 6, name: "Desk 7 - new"},
            {id: 5, name: "Desk 11"},
            {id: 4, name: "12 - Desk"},
            {id: 7, name: "A30 - tiny printer"},
        ];

        expect(orderedArray).toStrictEqual(expectedArray);
    });
});