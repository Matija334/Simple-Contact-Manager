type Props = {
    value: string;
    onChange: (v: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
    return (
        <div className="row" style={{ marginBottom: 12 }}>
            <div className="col-6">
                <input
                    className="input"
                    placeholder="Search name, email, phone, company…"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}