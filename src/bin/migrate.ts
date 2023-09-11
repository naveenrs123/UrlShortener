import 'dotenv/config';
import { options, sequelize } from '../database.js';

(async () => {
  await sequelize.createSchema(options.schema!, {});
  await sequelize.sync();
})();
