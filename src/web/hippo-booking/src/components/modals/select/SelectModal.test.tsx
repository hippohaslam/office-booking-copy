import { describe } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useState } from "react";
import SelectModal from "./SelectModal";

describe("SelectModal", () => {
  const TestWrapper = () => {
    const [isOpen, setIsOpen] = useState(true);
    const listOfStuff = () => {
      return (
        <div>
          <div onClick={() => setIsOpen(false)}>Option 1</div>
          <div>Option 2</div>
          <div>Option 3</div>
        </div>
      );
    };

    return (
      <SelectModal title='Select a SVG' isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {listOfStuff()}
      </SelectModal>
    );
  };

  it("should render with clickable options", () => {
    render(<TestWrapper />);
    const modal = screen.getByTestId("modal-page-overlay");
    expect(modal).toBeInTheDocument();

    const option1 = screen.getByText("Option 1");
    expect(option1).toBeInTheDocument();
    userEvent.click(option1);
  });

  it("should close when clicking outside", async () => {
    const { rerender } = render(<TestWrapper />);
    const modal = screen.getByTestId("modal-page-overlay");
    expect(modal).toBeInTheDocument();

    let option1 = screen.queryByText("Option 1");
    expect(option1).toBeInTheDocument();

    await userEvent.click(modal);

    rerender(<TestWrapper />);
    const modalAfterClick = screen.queryByTestId("modal-page-overlay");
    expect(modalAfterClick).not.toBeInTheDocument();

    option1 = screen.queryByText("Option 1");
    expect(option1).not.toBeInTheDocument();
  });
});
