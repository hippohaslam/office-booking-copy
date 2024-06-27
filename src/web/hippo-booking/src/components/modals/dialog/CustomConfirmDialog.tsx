import './CustomConfirmDialog.scss';

type CustomConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
};
const CustomConfirmDialog = ({ isOpen, onConfirm, onCancel, message }: CustomConfirmDialogProps) => {
  if (!isOpen) return null;
  // TODO: Style the dialog. Currently looks terrible. Ideally move this to a separate component and style it properly.
  return (
    <div className="modal-dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </div>
  );
};

export default CustomConfirmDialog;
