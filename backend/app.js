// Simple Contact Manager API (Express + SQLite)
// Features: CRUD contacts, optional filtering/search, XLSX export/import
// Run: node server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use in-memory for uploads (simple + no temp files to clean up)
const upload = multer({ storage: multer.memoryStorage() });

// --- Database (SQLite)
const DB_FILE = process.env.DB_FILE || path.join(__dirname, "contacts.sqlite");
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name  TEXT NOT NULL,
      email      TEXT,
      phone      TEXT,
      company    TEXT,
      notes      TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(last_name, first_name)`);
});

// --- Helpers
const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, changes: this.changes });
        });
    });

const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

const get = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });

// --- Routes

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// List contacts (with optional q filter and simple sorting/pagination)
app.get("/contacts", async (req, res) => {
    try {
        const {
            q = "",
            sort = "last_name",
            dir = "asc",
            limit = 100,
            offset = 0,
        } = req.query;

        const allowedSort = new Set([
            "first_name",
            "last_name",
            "email",
            "phone",
            "company",
            "created_at",
            "updated_at",
        ]);
        const safeSort = allowedSort.has(String(sort)) ? String(sort) : "last_name";
        const safeDir = String(dir).toLowerCase() === "desc" ? "DESC" : "ASC";

        const params = [];
        let where = "";
        if (q) {
            const like = `%${q}%`;
            where = `WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?`;
            params.push(like, like, like, like, like);
        }

        const rows = await all(
            `
      SELECT *
      FROM contacts
      ${where}
      ORDER BY ${safeSort} ${safeDir}
      LIMIT ? OFFSET ?
    `,
            [...params, Number(limit), Number(offset)]
        );

        const totalRow = await get(
            `SELECT COUNT(*) as total FROM contacts ${where}`,
            params
        );

        res.json({ data: rows, total: totalRow.total });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get single contact
app.get("/contacts/:id", async (req, res) => {
    try {
        const row = await get(`SELECT * FROM contacts WHERE id = ?`, [req.params.id]);
        if (!row) return res.status(404).json({ error: "Not found" });
        res.json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create contact
app.post("/contacts", async (req, res) => {
    try {
        const {
            first_name = "",
            last_name = "",
            email = null,
            phone = null,
            company = null,
            notes = null,
        } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({ error: "first_name and last_name are required" });
        }

        const result = await run(
            `
      INSERT INTO contacts (first_name, last_name, email, phone, company, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            [first_name, last_name, email, phone, company, notes]
        );

        const created = await get(`SELECT * FROM contacts WHERE id = ?`, [result.id]);
        res.status(201).json(created);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update contact
app.put("/contacts/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await get(`SELECT * FROM contacts WHERE id = ?`, [id]);
        if (!existing) return res.status(404).json({ error: "Not found" });

        const payload = {
            first_name: req.body.first_name ?? existing.first_name,
            last_name:  req.body.last_name  ?? existing.last_name,
            email:      req.body.email      ?? existing.email,
            phone:      req.body.phone      ?? existing.phone,
            company:    req.body.company    ?? existing.company,
            notes:      req.body.notes      ?? existing.notes,
        };

        await run(
            `
      UPDATE contacts
      SET first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, notes = ?,
          updated_at = datetime('now')
      WHERE id = ?
      `,
            [
                payload.first_name,
                payload.last_name,
                payload.email,
                payload.phone,
                payload.company,
                payload.notes,
                id,
            ]
        );

        const updated = await get(`SELECT * FROM contacts WHERE id = ?`, [id]);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete contact (hard delete to keep it simple)
app.delete("/contacts/:id", async (req, res) => {
    try {
        const result = await run(`DELETE FROM contacts WHERE id = ?`, [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: "Not found" });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Export to Excel (XLSX)
app.get("/export", async (_req, res) => {
    try {
        const rows = await all(`SELECT * FROM contacts ORDER BY last_name ASC, first_name ASC`);
        // Convert rows to worksheet
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contacts");

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        const filename = `contacts_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return res.send(buf);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Import from Excel (expects same columns as export; upserts by id when provided)
app.post("/contacts/import", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

        let inserted = 0, updated = 0, skipped = 0;

        // Simple transaction for speed & consistency
        await run("BEGIN");
        try {
            for (const r of rows) {
                const first = r.first_name || r.firstName || r["first name"];
                const last  = r.last_name  || r.lastName  || r["last name"];
                if (!first || !last) { skipped++; continue; }

                const email   = r.email ?? null;
                const phone   = r.phone ?? null;
                const company = r.company ?? null;
                const notes   = r.notes ?? null;

                // If an id column exists and matches a row, update; else insert
                const id = r.id ?? null;
                if (id) {
                    const exists = await get(`SELECT id FROM contacts WHERE id = ?`, [id]);
                    if (exists) {
                        await run(
                            `UPDATE contacts SET first_name=?, last_name=?, email=?, phone=?, company=?, notes=?, updated_at=datetime('now') WHERE id=?`,
                            [first, last, email, phone, company, notes, id]
                        );
                        updated++;
                    } else {
                        await run(
                            `INSERT INTO contacts (id, first_name, last_name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [id, first, last, email, phone, company, notes]
                        );
                        inserted++;
                    }
                } else {
                    await run(
                        `INSERT INTO contacts (first_name, last_name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)`,
                        [first, last, email, phone, company, notes]
                    );
                    inserted++;
                }
            }
            await run("COMMIT");
        } catch (inner) {
            await run("ROLLBACK");
            throw inner;
        }

        res.json({ ok: true, inserted, updated, skipped, totalParsed: rows.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Start server
app.listen(PORT, () => {
    console.log(`Simple Contact Manager API listening on http://localhost:${PORT}`);
});