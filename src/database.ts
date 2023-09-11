import { Sequelize, Options, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export const options: Options = {
  database: process.env.DB || 'postgres',
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

export class UrlStore extends Model<InferAttributes<UrlStore>, InferCreationAttributes<UrlStore>> {
  declare key: string;
  declare longUrl: string;
  declare shortUrl: string;
}

UrlStore.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    longUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortUrl: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    schema: options.schema,
    timestamps: false,
    tableName: 'UrlStore',
  },
);
