import type {Contact} from "../types";

type Props = {
    rows: Contact[];
    onEdit: (row: Contact) => void;
    onDelete: (row: Contact) => void;
};

export default function ContactGrid({ rows, onEdit, onDelete }: Props) {
    if (rows.length === 0) {
        return <div className="empty">No contacts found.</div>;
    }

    return (
        <div className="grid">
            {rows.map((r) => (
                <div key={r.id} className="card">
                    <div className="card-title">
                        {r.first_name} {r.last_name}
                    </div>
                    <div className="card-subtle">{r.company || "—"}</div>

                    <div className="kv">
                        <span>Email</span>
                        <span>{r.email || "—"}</span>
                    </div>
                    <div className="kv">
                        <span>Phone</span>
                        <span>{r.phone || "—"}</span>
                    </div>
                    <div className="kv">
                        <span>Updated</span>
                        <span>{r.updated_at?.replace("T", " ") || r.created_at?.replace("T", " ") || "—"}</span>
                    </div>

                    <div className="card-actions">
                        <button className="button" onClick={() => onEdit(r)}>Edit</button>
                        <button className="button danger" onClick={() => onDelete(r)}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}