import React from "react";
import "./styles.css";
import type { Contact, ListResponse } from "./types";
import {
    listContacts,
    createContact,
    updateContact,
    deleteContact,
    exportContacts,
    importContacts,
} from "./api";
import TopBar from "./components/TopBar";
import SearchBar from "./components/SearchBar";
import ContactTable, { type SortKey } from "./components/ContactTable";
import ContactEditor from "./components/ContactEditor";
import ConfirmDialog from "./components/ConfirmDialog";
import ContactGrid from "./components/ContactGrid";

export default function App() {
    const [rows, setRows] = React.useState<Contact[]>([]);
    const [total, setTotal] = React.useState(0);
    const [q, setQ] = React.useState("");
    const [sort, setSort] = React.useState<SortKey>("last_name");
    const [dir, setDir] = React.useState<"asc" | "desc">("asc");
    const [limit, setLimit] = React.useState(20);
    const [offset, setOffset] = React.useState(0);
    const [editing, setEditing] = React.useState<Contact | null>(null);
    const [confirmDel, setConfirmDel] = React.useState<Contact | null>(null);
    const [toast, setToast] = React.useState<{ kind: "success" | "error"; text: string } | null>(null);
    const [view, setView] = React.useState<"list" | "grid">(
        (localStorage.getItem("scm:view") as "list" | "grid") || "list"
    );

    async function load() {
        try {
            const data: ListResponse = await listContacts({ q, sort, dir, limit, offset });
            setRows(data.data);
            setTotal(data.total);
        } catch (e: any) {
            console.error(e);
            showToast("error", "Failed to load contacts");
        }
    }

    React.useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, sort, dir, limit, offset]);

    function onSort(key: SortKey) {
        if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSort(key);
            setDir("asc");
        }
    }

    function showToast(kind: "success" | "error", text: string) {
        setToast({ kind, text });
        setTimeout(() => setToast(null), 2500);
    }

    function changeView(v: "list" | "grid") {
        setView(v);
        localStorage.setItem("scm:view", v);
    }

    async function handleSave(payload: Partial<Contact>) {
        try {
            if (editing?.id) await updateContact(editing.id, payload);
            else await createContact(payload);
            setEditing(null);
            await load();
            showToast("success", "Contact saved");
        } catch (e: any) {
            showToast("error", e.message || "Save failed");
        }
    }

    async function handleDelete() {
        if (!confirmDel?.id) return;
        try {
            await deleteContact(confirmDel.id);
            setConfirmDel(null);
            // Optimistic update
            setRows((prev) => prev.filter((r) => r.id !== confirmDel.id));
            setTotal((t) => Math.max(0, t - 1));
            showToast("success", "Contact deleted");
            await load();
        } catch (e: any) {
            showToast("error", e.message || "Delete failed");
        }
    }

    return (
        <div className="container">
            <TopBar
                onAdd={() => setEditing({} as Contact)}
                onExport={() => exportContacts()}
                onImport={async (file) => {
                    try {
                        await importContacts(file);
                        await load();
                        showToast("success", "Import complete");
                    } catch (e: any) {
                        showToast("error", e.message || "Import failed");
                    }
                }}
                view={view}
                onChangeView={changeView}
            />

            <div className="content">
                <SearchBar value={q} onChange={(v) => { setOffset(0); setQ(v); }} />

                {view === "list" ? (
                    <ContactTable
                        rows={rows}
                        sort={sort}
                        dir={dir}
                        onSort={onSort}
                        onEdit={(r) => setEditing(r)}
                        onDelete={(r) => setConfirmDel(r)}
                    />
                ) : (
                    <ContactGrid
                        rows={rows}
                        onEdit={(r) => setEditing(r)}
                        onDelete={(r) => setConfirmDel(r)}
                    />
                )}

                {/* Pagination */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 12,
                    }}
                >
                    <div className="subtle">
                        {rows.length} / {total} shown
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select
                            className="select"
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setOffset(0);
                            }}
                        >
                            {[10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n} / page
                                </option>
                            ))}
                        </select>
                        <button
                            className="button"
                            disabled={offset === 0}
                            onClick={() => setOffset(Math.max(0, offset - limit))}
                        >
                            Prev
                        </button>
                        <button
                            className="button"
                            disabled={offset + limit >= total}
                            onClick={() => setOffset(offset + limit)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {editing && (
                <ContactEditor initial={editing} onCancel={() => setEditing(null)} onSave={handleSave} />
            )}

            {confirmDel && (
                <ConfirmDialog
                    title="Delete this contact?"
                    body={`${confirmDel.first_name} ${confirmDel.last_name}`}
                    confirmText="Delete"
                    onCancel={() => setConfirmDel(null)}
                    onConfirm={handleDelete}
                />
            )}

            {toast && <div className={`toast ${toast.kind}`}>{toast.text}</div>}
        </div>
    );
}