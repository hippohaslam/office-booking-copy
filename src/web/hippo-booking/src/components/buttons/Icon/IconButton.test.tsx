import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import IconButton from "./IconButton";
import AddIcon from "../../../assets/add-icon.svg";

test("Icon button should show correctly", async () => {
    // Arrange
    render(
        <IconButton title="Add" ariaLabel="Add hippos" iconSrc={AddIcon} onClick={() => {}} color="navy" showBorder showText/>
    );
  
    // Assert
    const button = screen.queryByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Add hippos");
    expect(button?.querySelector("img")).toBeInTheDocument();
  });

test("Function is triggered when button is clicked", async () => {
    // Arrange
    const onClick = vi.fn();
    render(
        <IconButton title="Add" iconSrc={AddIcon} onClick={onClick} color="navy" showBorder={false} showText={true}/>
    );

    //Act
    const iconButton = screen.getByText("Add");
    await userEvent.click(iconButton);

    //Assert
    expect(onClick).toHaveBeenCalledOnce();
});

test("Text is not shown if argument set to false", async () => {
    // Arrange
    render(
        <IconButton title="Add" iconSrc={AddIcon} onClick={() => {}} color="navy" showBorder={false} showText={false}/>
    );

    //Assert
    const button = screen.queryByRole("button");
    expect(button).toHaveTextContent("");
    expect(button).toHaveAttribute("aria-label", "Add");
});

test("Border should be in classname if showBorder is set to true", async () => {
    // Arrange
    render(
        <IconButton title="Add" iconSrc={AddIcon} onClick={() => {}} color="navy" showBorder showText={false}/>
    );

    //Assert
    const button = screen.queryByRole("button");
    expect(button).toHaveClass("icon-button__border")
});

test("Border should not be in classname if showBorder is set to false", async () => {
    // Arrange
    render(
        <IconButton title="Add" iconSrc={AddIcon} onClick={() => {}} color="navy" showBorder={false} showText={false}/>
    );

    //Assert
    const button = screen.queryByRole("button");
    expect(button).not.toHaveClass("icon-button__border")
});