import React from "react";

type Props = {
    onAdd: () => void;
    onExport: () => void;
    onImport: (file: File) => void;
    view: "list" | "grid";
    onChangeView: (v: "list" | "grid") => void;
};

export default function TopBar({ onAdd, onExport, onImport, view, onChangeView }: Props) {
    const fileRef = React.useRef<HTMLInputElement | null>(null);

    return (
        <div className="header">
            <div>
                <div className="title">Simple Contact Manager</div>
            </div>
            <div className="toolbar">
                <div className="seg">
                    <button
                        className={`seg-btn ${view === "list" ? "active" : ""}`}
                        onClick={() => onChangeView("list")}
                        title="List view"
                    >
                        List
                    </button>
                    <button
                        className={`seg-btn ${view === "grid" ? "active" : ""}`}
                        onClick={() => onChangeView("grid")}
                        title="Grid view"
                    >
                        Grid
                    </button>
                </div>

                <button className="button primary" onClick={onAdd}>Add contact</button>
                <button className="button" onClick={onExport}>Export Excel</button>
                <button className="button" onClick={() => fileRef.current?.click()}>Import Excel</button>
                <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onImport(f);
                        e.currentTarget.value = "";
                    }}
                />
            </div>
        </div>
    );
}