import './config/env.js';
import app from './app.js';
import { sequelize } from './models/sequelize/index.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // await sequelize.sync({ alter: true }); // REMOVED

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
