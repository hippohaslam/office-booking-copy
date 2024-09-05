import { render } from "@testing-library/react"
import { screen } from "@testing-library/dom";
import { useState } from "react";
import TabList from "./TabList"
import TabItem from "./TabItem";
import userEvent from "@testing-library/user-event";

describe("Tabs", () => {
    const TestWrapper = ({initialActiveTabIndex} : {initialActiveTabIndex : number;}) => {
        const [activeTab, setActiveTab] = useState(initialActiveTabIndex);
        const onChange = (newTab : number) => {
            setActiveTab(newTab);
        }
        return (
            <TabList activeTabIndex={activeTab} onChange={onChange}>
                <TabItem label='Tab 1'>
                    <span>This is content for tab 1</span>
                </TabItem>
                <TabItem label='Tab 2'>
                    <span>This is content for tab 2</span>
                </TabItem>
            </TabList>
        );
    };

    it("Should display correct tabs", async () => {
        // Arrange
        render(<TestWrapper initialActiveTabIndex={0}/>);

        // Assert
        var tabNav = screen.queryByRole("tablist");
        expect(tabNav).toBeInTheDocument();

        var tabs = screen.queryAllByRole("tab");
        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[0]).toHaveTextContent("Tab 1");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveTextContent("Tab 2");

        var tabPanels = screen.queryAllByRole("tabpanel");
        expect(tabPanels).toHaveLength(1);
        expect(tabPanels[0]).toHaveTextContent("This is content for tab 1")
    });

    it("Should focus on the correct tab when tabbed onto tablist", async () => {
        // Arrange
        render(<TestWrapper initialActiveTabIndex={1}/>);

        // Act
        await userEvent.tab();

        //Assert
        var tabs = screen.queryAllByRole("tab");
        expect(tabs[1]).toHaveFocus();
    });

    it("Should focus on the correct tabpanel when tabbed onto tablist and tab", async () => {
        // Arrange
        render(<TestWrapper initialActiveTabIndex={1}/>);

        // Act
        await userEvent.tab();
        await userEvent.tab();

        //Assert
        var tabPanel = screen.queryByRole("tabpanel");
        expect(tabPanel).toHaveFocus();
    });

    const keyTabCombos = [
        { key: "ArrowRight", initialIndex: 0, expectedIndex: 1, expectedContent: "This is content for tab 2" },
        { key: "ArrowRight", initialIndex: 1, expectedIndex: 0, expectedContent: "This is content for tab 1" },
        { key: "ArrowLeft", initialIndex: 1, expectedIndex: 0, expectedContent: "This is content for tab 1" },
        { key: "ArrowLeft", initialIndex: 0, expectedIndex: 1, expectedContent: "This is content for tab 2" },
        { key: "Home", initialIndex: 1, expectedIndex: 0, expectedContent: "This is content for tab 1" },
        { key: "End", initialIndex: 0, expectedIndex: 1, expectedContent: "This is content for tab 2" }
    ];

    it.each(keyTabCombos)("Should navigate to correct tab when $key key is pressed with initial tab index $initialIndex", 
        async ({key, initialIndex, expectedIndex, expectedContent}) => {
        // Arrange
        render(<TestWrapper initialActiveTabIndex={initialIndex} />);

        // Act
        await userEvent.tab();
        await userEvent.keyboard(`{${key}}`);

        // Assert
        const tabs = screen.queryAllByRole("tab");
        expect(tabs[expectedIndex]).toHaveAttribute("aria-selected", "true");
        expect(tabs[expectedIndex]).toHaveFocus();
        expect(tabs[1 - expectedIndex]).toHaveAttribute("aria-selected", "false");

        const tabPanel = screen.queryByRole("tabpanel");
        expect(tabPanel).toHaveTextContent(expectedContent);
    });
});