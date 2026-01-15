import app from './app.js';
import dotenv from 'dotenv';
import { sequelize } from './models/sequelize/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    // Creates tables for all defined models if they do not exist
    // Note: avoid `alter: true` to prevent unintended schema changes
    // and issues like exceeding MySQL's max index/keys limit.
    await sequelize.sync({alter: false});

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
