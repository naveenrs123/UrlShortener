import { UrlStore, sequelize } from './database';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

test('create entry', async () => {
  expect.assertions(1);

  const entry = await UrlStore.create({
    key: '134532a34',
    longUrl: 'https://www.google.com',
    shortUrl: 'http://localhost:8080/134532a34',
  });

  expect(entry.key).toEqual('134532a34');
});

test('retrieve entry', async () => {
  expect.assertions(2);

  const entry = await UrlStore.findByPk('134532a34');

  expect(entry?.key).toEqual('134532a34');
  expect(entry?.longUrl).toEqual('https://www.google.com');
});

test('delete entry', async () => {
  expect.assertions(1);

  await UrlStore.destroy({ where: { key: '134532a34' } });

  const entry = await UrlStore.findByPk('134532a34');
  expect(entry).toBeNull();
});

afterAll(async () => {
  await sequelize.close();
});
