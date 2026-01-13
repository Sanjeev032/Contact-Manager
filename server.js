require('dotenv').config();
const express = require('express');
const contactsRouter = require('./src/routes/contactRoutes');
require('./src/db/init'); 

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/contacts', contactsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

