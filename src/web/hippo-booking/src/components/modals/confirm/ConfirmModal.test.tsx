import { render } from "@testing-library/react"
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import ConfirmModal from "./ConfirmModal"

test("Modal is not shown when isOpen is set to false", async () => {

    // Arrange
    render(
        <ConfirmModal isOpen={false} onConfirm={() => {}} confirmButtonLabel="Yes. Cancel it" onCancel={() => {}} cancelButtonLabel="No. Keep it"/>
    )

    // Assert
    const modal = screen.queryByRole("alertdialog");
    expect(modal).not.toBeInTheDocument();
})

test("Modal is shown when isOpen is set to true", async () => {
    // Arrange
    render(
        <ConfirmModal isOpen={true} onConfirm={() => {}} confirmButtonLabel="Yes. Cancel it" onCancel={() => {}} cancelButtonLabel="No. Keep it"/>
    )

    // Assert
    const modal = screen.queryByRole("alertdialog");
    expect(modal).toBeInTheDocument();
})

test("Modal has correct content", async () => {
    // Arrange
    render(
        <ConfirmModal isOpen={true} onConfirm={() => {}} confirmButtonLabel="Yes. Cancel it" onCancel={() => {}} cancelButtonLabel="No. Keep it"/>
    )

    // Assert
    const h2 = screen.getByRole("heading");
    expect(h2).toHaveTextContent("Are you sure you want to cancel this booking?");

    const confirmButton = screen.getByText("Yes. Cancel it")
    expect(confirmButton).toBeInTheDocument();

    const cancelButton = screen.getByText("No. Keep it")
    expect(cancelButton).toBeInTheDocument();
})

test("Correct function is called when confirm button is clicked", async () => {
    // Arrange
    const onConfirm = vi.fn();

    render(
        <ConfirmModal isOpen={true} onConfirm={onConfirm} confirmButtonLabel="Yes. Cancel it" onCancel={() => {}} cancelButtonLabel="No. Keep it"/>
    )

    // Act
    const confirmButton = screen.getByText("Yes. Cancel it");
    await userEvent.click(confirmButton);

    // Assert
    expect(onConfirm).toHaveBeenCalledOnce();
})

test("Correct function is called when cancel button is clicked", async () => {
    // Arrange
    const onCancel = vi.fn();

    render(
        <ConfirmModal isOpen={true} onConfirm={() => {}} confirmButtonLabel="Yes. Cancel it" onCancel={onCancel} cancelButtonLabel="No. Keep it"/>
    )

    // Act
    const cancelButton = screen.getByText("No. Keep it");
    await userEvent.click(cancelButton);

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
})

test("Cancel function is called when outside of modal is clicked", async () => {
    // Arrange
    const onCancel = vi.fn();

    render(
        <ConfirmModal isOpen={true} onConfirm={() => {}} confirmButtonLabel="Yes. Cancel it" onCancel={onCancel} cancelButtonLabel="No. Keep it"/>
    )

    // Act
    const overlay = screen.getByTestId("modal-page-overlay");
    await userEvent.click(overlay);

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
})

test("Cancel function is called when escape key is pressed", async () => {
    // Arrange
    const onCancel = vi.fn();

    render(
        <ConfirmModal isOpen={true} onConfirm={() => {}} confirmButtonLabel="Yes. Cancel it" onCancel={onCancel} cancelButtonLabel="No. Keep it"/>
    )

    // Act
    await screen.findByText("Yes. Cancel it");
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
})