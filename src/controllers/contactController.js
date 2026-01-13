const contactModel = require('../models/contactModel');

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  if (typeof phone !== 'string' && typeof phone !== 'number') return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validateContactPayload({ name, email, phone }) {
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email is not valid');
  }

  if (phone === undefined || phone === null || String(phone).trim() === '') {
    errors.push('Phone is required');
  } else if (!isValidPhone(phone)) {
    errors.push('Phone must be 10 to 15 digits');
  }

  return errors;
}

const contactController = {
  async getAll(req, res, next) {
    try {
      const contacts = await contactModel.findAll();
      return res.status(200).json(contacts);
    } catch (err) {
      return next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid contact id' });
      }

      const contact = await contactModel.findById(id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      return res.status(200).json(contact);
    } catch (err) {
      return next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, email, phone } = req.body || {};

      const errors = validateContactPayload({ name, email, phone });
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const existingEmail = await contactModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const contact = await contactModel.create({ name: name.trim(), email: email.trim(), phone: String(phone).trim() });
      return res.status(201).json(contact);
    } catch (err) {
      if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return next(err);
    }
  },

  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid contact id' });
      }

      const { name, email, phone } = req.body || {};

      const existing = await contactModel.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      
      const payloadToValidate = {
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone
      };

      const errors = validateContactPayload(payloadToValidate);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      
      if (email && email !== existing.email) {
        const existingEmail = await contactModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== id) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }

      const updated = await contactModel.update(id, {
        name: name !== undefined ? name.trim() : undefined,
        email: email !== undefined ? email.trim() : undefined,
        phone: phone !== undefined ? String(phone).trim() : undefined
      });

      if (!updated) {
        
        return res.status(404).json({ error: 'Contact not found' });
      }

      return res.status(200).json(updated);
    } catch (err) {
      if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid contact id' });
      }

      const deleted = await contactModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
};

module.exports = contactController;

