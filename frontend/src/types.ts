export type Contact = {
    id?: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type ListResponse = {
    data: Contact[];
    total: number;
};