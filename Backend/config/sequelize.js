import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.resolve(__dirname, "../certs/ca.pem");
const isProduction = process.env.NODE_ENV === "production";

const inlineCa = isProduction && process.env.DB_SSL_CA
  ? process.env.DB_SSL_CA.replace(/\\n/g, "\n")
  : null;
const fileCa = isProduction && fs.existsSync(certPath) ? fs.readFileSync(certPath, "utf8") : null;
const ca = inlineCa || fileCa;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    timezone: "+05:30",
    dialectOptions: ca ? { ssl: { ca } } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export default sequelize;
