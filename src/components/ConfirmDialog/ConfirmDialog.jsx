import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  busyLabel = "Working…",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCancelEvent = (event) => {
    event.preventDefault();
    if (!busy) onCancel();
  };

  const handleClick = (event) => {
    if (event.target === dialogRef.current && !busy) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onCancel={handleCancelEvent}
      onClick={handleClick}
    >
      <div className="confirm-dialog-body">
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h2>
        <div id="confirm-dialog-message" className="confirm-dialog-message">{message}</div>
        {error && <p className="confirm-dialog-error" role="alert">{error}</p>}
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel} disabled={busy} autoFocus>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog-confirm confirm-dialog-confirm-${tone}`}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
