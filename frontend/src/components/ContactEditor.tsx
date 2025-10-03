import React from "react";
import type {Contact} from "../types";

type Props = {
    initial?: Partial<Contact>;
    onCancel: () => void;
    onSave: (payload: Partial<Contact>) => void;
};

export default function ContactEditor({ initial = {}, onCancel, onSave }: Props) {
    const [form, setForm] = React.useState<Partial<Contact>>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
        ...initial,
    });

    function set<K extends keyof Contact>(key: K, v: Contact[K]) {
        setForm(prev => ({ ...prev, [key]: v }));
    }

    const valid = (form.first_name?.trim() && form.last_name?.trim());

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>{initial?.id ? "Edit contact" : "Add contact"}</h3>
                <div className="row">
                    <div className="col-6">
                        <input className="input" placeholder="First name"
                               value={form.first_name||""} onChange={e=>set("first_name", e.target.value)} />
                    </div>
                    <div className="col-6">
                        <input className="input" placeholder="Last name"
                               value={form.last_name||""} onChange={e=>set("last_name", e.target.value)} />
                    </div>
                    <div className="col-6">
                        <input className="input" placeholder="Email"
                               value={form.email||""} onChange={e=>set("email", e.target.value as any)} />
                    </div>
                    <div className="col-6">
                        <input className="input" placeholder="Phone"
                               value={form.phone||""} onChange={e=>set("phone", e.target.value as any)} />
                    </div>
                    <div className="col-6">
                        <input className="input" placeholder="Company"
                               value={form.company||""} onChange={e=>set("company", e.target.value as any)} />
                    </div>
                    <div className="col-12">
            <textarea className="textarea" placeholder="Notes"
                      value={form.notes||""} onChange={e=>set("notes", e.target.value as any)} />
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                    <button className="button" onClick={onCancel}>Cancel</button>
                    <button className="button primary" disabled={!valid} onClick={() => onSave(form)}>Save</button>
                </div>
            </div>
        </div>
    );
}