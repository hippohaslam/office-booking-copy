import { render } from "@testing-library/react"
import { BrowserRouter } from 'react-router-dom'
import { screen } from "@testing-library/dom";
import Breadcrumbs from "./Breadcrumbs"

test("Correct breadcrumbs and links are shown", async () => {

    //Arrange
    const breadcrumbsItems = [
        { text: "Crumb 1", to: "/" },
        { text: "Crumb 2", to: "/test" },
        { text: "Crumb 3", to: "/test/test" },
        { text: "Crumb 4", to: "{}" }
    ];
    render(
        <BrowserRouter>
            <Breadcrumbs items={breadcrumbsItems} />,
        </BrowserRouter>
    );

    // Assert
    const breadcrumbs = screen.queryByRole("navigation");
    expect(breadcrumbs).toBeInTheDocument();

    const items = breadcrumbs?.querySelectorAll("li");
    expect(items).toHaveLength(4);

    if (items) {
        assertBreadCrumbLink(items[0].querySelector("a"), "false", "Crumb 1", "/");
        assertBreadCrumbLink(items[1].querySelector("a"), "false", "Crumb 2", "/test");
        assertBreadCrumbLink(items[2].querySelector("a"), "false", "Crumb 3", "/test/test");
        assertBreadCrumbLink(items[3].querySelector("a"), "page", "Crumb 4", "/");
    };
})

test("Correct single link is shown if items only contains 1", async () => {

    //Arrange
    const breadcrumbsItems = [
        { text: "Crumb 1", to: "{}" },
    ];
    render(
        <BrowserRouter>
            <Breadcrumbs items={breadcrumbsItems} />,
        </BrowserRouter>
    );

    // Assert
    const breadcrumbs = screen.queryByRole("navigation");
    expect(breadcrumbs).toBeInTheDocument();

    const items = breadcrumbs?.querySelectorAll("li");
    expect(items).toHaveLength(1);

    if (items) {
        assertBreadCrumbLink(items[0].querySelector("a"), "page", "Crumb 1", "/");
    };
})

function assertBreadCrumbLink(link: HTMLAnchorElement | null, ariaCurrent : string, text: string, href: string) {
    expect(link).toHaveAttribute("aria-current", ariaCurrent);
    expect(link).toHaveTextContent(text);
    expect(link).toHaveAttribute("href", href);
}