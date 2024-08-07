import './CustomConfirmDialog.scss';

type CustomConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  confirmButtonLabel: string;
  onCancel: () => void;
  cancelButtonLabel: string;
  message: string;
};
const CustomConfirmDialog = ({ isOpen, onConfirm, confirmButtonLabel, onCancel, cancelButtonLabel, message }: CustomConfirmDialogProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>{confirmButtonLabel}</button>
      <button onClick={onCancel}>{cancelButtonLabel}</button>
    </div>
  );
};

export default CustomConfirmDialog;
