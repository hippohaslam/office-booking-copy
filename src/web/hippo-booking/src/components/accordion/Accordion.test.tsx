import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { AccordionGroup, AccordionItem } from "./Accordion";

test("Accordion items should show correctly when closed", () => {
    //Arrange
    render(
        <AccordionGroup>
            <AccordionItem name="Test 1">
                <p>Here is some information in the accordion</p>
            </AccordionItem>
            <AccordionItem name="Test 2">
                <p>Here is some other information in the accordion</p>
            </AccordionItem>
        </AccordionGroup>
    );

    //Assert
    const accordionItem1 = screen.getByText("Test 1");
    expect(accordionItem1).toBeInTheDocument();
    const accordionItem2 = screen.getByText("Test 2");
    expect(accordionItem2).toBeInTheDocument();

    expect(screen.queryByText("Here is some information in the accordion")).not.toBeInTheDocument();
    expect(screen.queryByText("Here is some other information in the accordion")).not.toBeInTheDocument();
});

test("Accordion should have correct content when opened", async () => {
    //Arrange
    render(
        <AccordionGroup>
            <AccordionItem name="Test 1">
                <p>Here is some information in the accordion</p>
            </AccordionItem>
        </AccordionGroup>
    );

    //Act
    const accordionItem = screen.getByText("Test 1");
    await userEvent.click(accordionItem);

    //Assert
    const accordionPanelContent = screen.getByText("Here is some information in the accordion");
    expect(accordionPanelContent).toBeInTheDocument();
});

test("Accordion can be closed once open", async () => {
    //Arrange
    render(
        <AccordionGroup>
            <AccordionItem name="Test 1">
                <p>Here is some information in the accordion</p>
            </AccordionItem>
        </AccordionGroup>
    );

    //Act
    const accordionItem = screen.getByText("Test 1");
    await userEvent.click(accordionItem);
    const accordionPanelContent = screen.getByText("Here is some information in the accordion");
    expect(accordionPanelContent).toBeInTheDocument();
    await userEvent.click(accordionItem);

    //Assert
    expect(screen.queryByText("Here is some information in the accordion")).not.toBeInTheDocument();
});