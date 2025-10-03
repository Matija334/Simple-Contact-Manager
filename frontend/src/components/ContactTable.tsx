import type {Contact} from "../types";

export type SortKey =
    | "first_name"
    | "last_name"
    | "email"
    | "phone"
    | "company"
    | "created_at"
    | "updated_at";

type Props = {
    rows: Contact[];
    sort: SortKey;
    dir: "asc" | "desc";
    onSort: (key: SortKey) => void;
    onEdit: (row: Contact) => void;
    onDelete: (row: Contact) => void;
};

const heads: { key: SortKey; label: string }[] = [
    { key: "first_name", label: "First" },
    { key: "last_name", label: "Last" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "company", label: "Company" },
    { key: "updated_at", label: "Updated" },
];

export default function ContactTable({
                                         rows, sort, dir, onSort, onEdit, onDelete,
                                     }: Props) {
    return (
        <table className="table">
            <thead>
            <tr>
                {heads.map(h => (
                    <th key={h.key} onClick={() => onSort(h.key)}>
                        {h.label} {sort === h.key ? (dir === "asc" ? "▲" : "▼") : ""}
                    </th>
                ))}
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {rows.length === 0 && (
                <tr><td colSpan={heads.length + 1}><div className="empty">No contacts found.</div></td></tr>
            )}
            {rows.map(r => (
                <tr key={r.id}>
                    <td>{r.first_name}</td>
                    <td>{r.last_name}</td>
                    <td>{r.email || <span className="badge">—</span>}</td>
                    <td>{r.phone || <span className="badge">—</span>}</td>
                    <td>{r.company || <span className="badge">—</span>}</td>
                    <td>{r.updated_at?.replace("T", " ") || r.created_at?.replace("T", " ")}</td>
                    <td>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="button" onClick={() => onEdit(r)}>Edit</button>
                            <button className="button danger" onClick={() => onDelete(r)}>Delete</button>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}