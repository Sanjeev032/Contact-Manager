const db = require('../config/db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

const contactModel = {
  async findAll() {
    return all('SELECT * FROM contacts ORDER BY created_at DESC');
  },

  async findById(id) {
    return get('SELECT * FROM contacts WHERE id = ?', [id]);
  },

  async findByEmail(email) {
    return get('SELECT * FROM contacts WHERE email = ?', [email]);
  },

  async create({ name, email, phone }) {
    const now = new Date().toISOString();
    const result = await run(
      `INSERT INTO contacts (name, email, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, now, now]
    );
    const id = result.lastID;
    return this.findById(id);
  },

  async update(id, { name, email, phone }) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    await run(
      `UPDATE contacts
       SET name = ?, email = ?, phone = ?, updated_at = ?
       WHERE id = ?`,
      [
        name ?? existing.name,
        email ?? existing.email,
        phone ?? existing.phone,
        now,
        id
      ]
    );

    return this.findById(id);
  },

  async delete(id) {
    const result = await run('DELETE FROM contacts WHERE id = ?', [id]);
    return result.changes > 0;
  }
};

module.exports = contactModel;

