const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

db.exec(schemaSql, (err) => {
  if (err) {
    console.error('Failed to apply database schema:', err);
  } else {
    console.log('Database initialized / schema ensured.');
  }
});

