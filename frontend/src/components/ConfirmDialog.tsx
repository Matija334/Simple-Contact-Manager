type Props = {
    title: string;
    body?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
                                          title, body, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel
                                      }: Props) {
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>{title}</h3>
                {body && <p>{body}</p>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                    <button className="button" onClick={onCancel}>{cancelText}</button>
                    <button className="button danger" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}