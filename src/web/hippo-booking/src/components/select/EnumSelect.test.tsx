import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import EnumSelect from "./EnumSelect";
import { useState } from "react";

// Define test enum
enum TestEnum {
  First = 1,
  Second = 2,
  AThird = 3,
}

// Test wrapper to simulate a parent component managing state
const EnumSelectTestWrapper = () => {
  const [value, setValue] = useState<string>("1");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
  };

  return <EnumSelect enumObj={TestEnum} value={value} onChange={handleChange} name='test' />;
};

describe("EnumSelect", () => {
  it("should render correct labels and values", () => {
    render(<EnumSelect enumObj={TestEnum} value='1' onChange={() => {}} name='test' />);

    // Check if the options are rendered correctly
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("First");
    expect(options[0]).toHaveValue("1");
    expect(options[1]).toHaveTextContent("Second");
    expect(options[1]).toHaveValue("2");
  });

  // Well so far we have been using PascalCase for the enum values
  it("should seperate labels by Captial letters", () => {
    render(<EnumSelect enumObj={TestEnum} value='1' onChange={() => {}} name='test' />);

    const options = screen.getAllByRole("option");
    expect(options[2]).toHaveTextContent("A Third");
  });

  it("should change option when selected", async () => {
    const handleChange = vi.fn((e) => e.target.value);
    const { rerender } = render(<EnumSelect enumObj={TestEnum} value='1' onChange={handleChange} name='test' />);

    const select = screen.getByRole("combobox");

    await userEvent.selectOptions(select, ["2"]);

    rerender(<EnumSelect enumObj={TestEnum} value='2' onChange={handleChange} name='test' />);

    const secondOption = screen.getByRole("option", { name: "Second" }) as HTMLOptionElement;
    expect(secondOption.selected).toBe(true);
  });

  it("should call onChange and update value when an option is selected", async () => {
    render(<EnumSelectTestWrapper />);

    const select = screen.getByRole("combobox");

    // Select the second option
    await userEvent.selectOptions(select, "2");

    // Check if the value of the select box has changed
    expect(select).toHaveValue("2");

    // Verify the selected option
    const secondOption = screen.getByRole("option", { name: "Second" }) as HTMLOptionElement;
    expect(secondOption.selected).toBe(true);
  });
});
