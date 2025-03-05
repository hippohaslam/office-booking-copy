import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import IconLink from "./IconLink";
import AddIcon from "../../../assets/add-icon.svg";
import { BrowserRouter } from "react-router-dom";

test("Icon button should show correctly", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <IconLink label="Add" to="/" iconSrc={AddIcon} color="navy" showBorder showText title="Add test"/>
        </BrowserRouter>
    );
  
    // Assert
    const link = screen.queryByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("Add");
    expect(link?.querySelector("img")).toBeInTheDocument();
    expect(link).toHaveAttribute("title", "Add test");
  });

test("Text is not shown if argument set to false", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <IconLink label="Add" ariaLabel="testing" iconSrc={AddIcon}to="/" color="navy" showBorder={false} showText={false}/>
        </BrowserRouter>
    );

    //Assert
    const link = screen.queryByRole("link");
    expect(link).toHaveTextContent("");
    expect(link).toHaveAttribute("aria-label", "testing");
});

test("Border should be in classname if showBorder is set to true", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <IconLink label="Add" to="/" iconSrc={AddIcon} color="navy" showBorder showText={false}/>
        </BrowserRouter>
    );

    //Assert
    const link = screen.queryByRole("link");
    expect(link).toHaveClass("icon-link__border")
});

test("Border should not be in classname if showBorder is set to false", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <IconLink label="Add" to="/" iconSrc={AddIcon} color="navy" showBorder={false} showText={false}/>
        </BrowserRouter>
    );

    //Assert
    const link = screen.queryByRole("link");
    expect(link).not.toHaveClass("icon-link__border")
});