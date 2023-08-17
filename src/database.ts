import { Sequelize, Options, DataTypes } from 'sequelize';

const options: Options = {
    schema: process.env.DB_SCHEMA || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL == 'true',
    },
  };

export const sequelize = new Sequelize(options);

export const urlStore = sequelize.define('UrlStore', {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    longUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortUrl: {
      type: DataTypes.STRING,
    },
  });


