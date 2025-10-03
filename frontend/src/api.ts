const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function listContacts(params: {
    q?: string;
    sort?: string;
    dir?: "asc" | "desc";
    limit?: number;
    offset?: number;
} = {}) {
    const q = new URLSearchParams(params as any).toString();
    const res = await fetch(`${BASE}/contacts?${q}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getContact(id: number) {
    const res = await fetch(`${BASE}/contacts/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function createContact(payload: any) {
    const res = await fetch(`${BASE}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateContact(id: number, payload: any) {
    const res = await fetch(`${BASE}/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteContact(id: number) {
    const res = await fetch(`${BASE}/contacts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export function exportContacts() {
    const url = `${BASE}/export`;
    // Trigger download by navigating
    window.location.href = url;
}

export async function importContacts(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/contacts/import`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}