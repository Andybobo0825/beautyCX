import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const exportDir = process.argv[2] ?? '.tmp/mssql/export';
const out = process.argv[3] ?? 'data/beautycx.sqlite';
const reportOut = process.argv[4] ?? 'data/beautycx-sqlite-report.json';

mkdirSync(dirname(out), { recursive: true });
if (existsSync(out)) rmSync(out);

function readJson(table) {
  return JSON.parse(readFileSync(join(exportDir, `${table}.json`), 'utf8'));
}

const db = new DatabaseSync(out);
db.exec('PRAGMA foreign_keys = OFF; PRAGMA journal_mode = WAL;');

db.exec(`
CREATE TABLE Client (
  cId TEXT PRIMARY KEY,
  cName TEXT,
  account TEXT,
  password TEXT,
  email TEXT,
  phone TEXT,
  sex TEXT,
  birthday TEXT
);

CREATE TABLE Product (
  pId TEXT PRIMARY KEY,
  pName TEXT,
  brand TEXT,
  category TEXT,
  clickTimes INTEGER,
  review REAL
);

CREATE TABLE Price_Now (
  pId TEXT NOT NULL,
  updateTime TEXT NOT NULL,
  store TEXT,
  storePrice REAL,
  storeDiscount TEXT,
  storeLink TEXT,
  status INTEGER,
  PRIMARY KEY (pId, updateTime),
  FOREIGN KEY (pId) REFERENCES Product(pId)
);

CREATE TABLE Price_History (
  pId TEXT NOT NULL,
  updateTime TEXT NOT NULL,
  prePrice REAL,
  storeName TEXT,
  PRIMARY KEY (pId, updateTime),
  FOREIGN KEY (pId) REFERENCES Product(pId)
);

CREATE TABLE Client_Favorites (
  cId TEXT NOT NULL,
  pId TEXT NOT NULL,
  updateTime TEXT,
  PRIMARY KEY (cId, pId),
  FOREIGN KEY (cId) REFERENCES Client(cId),
  FOREIGN KEY (pId) REFERENCES Product(pId)
);

CREATE TABLE Good_Review (
  pId TEXT NOT NULL,
  date TEXT NOT NULL,
  userName TEXT,
  rating REAL,
  reviewText TEXT,
  PRIMARY KEY (pId, date),
  FOREIGN KEY (pId) REFERENCES Product(pId)
);

CREATE TABLE Product_Picture (
  picId INTEGER PRIMARY KEY,
  pId TEXT,
  pic BLOB,
  updateTime TEXT,
  isMain INTEGER,
  storage_key TEXT,
  visibility TEXT,
  width INTEGER,
  height INTEGER,
  file_extension TEXT,
  FOREIGN KEY (pId) REFERENCES Product(pId)
);
`);

const specs = {
  Client: ['cId','cName','account','password','email','phone','sex','birthday'],
  Product: ['pId','pName','brand','category','clickTimes','review'],
  Price_Now: ['pId','updateTime','store','storePrice','storeDiscount','storeLink','status'],
  Price_History: ['pId','updateTime','prePrice','storeName'],
  Client_Favorites: ['cId','pId','updateTime'],
  Good_Review: ['pId','date','userName','rating','reviewText'],
  Product_Picture: ['picId','pId','pic','updateTime','isMain','storage_key','visibility','width','height','file_extension']
};

const counts = {};
db.exec('BEGIN');
for (const [table, columns] of Object.entries(specs)) {
  const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`);
  const rows = readJson(table);
  for (const row of rows) {
    stmt.run(...columns.map((column) => {
      const value = row[column] ?? null;
      if (table === 'Product_Picture' && column === 'pic' && value) return Buffer.from(value, 'hex');
      return value;
    }));
  }
  counts[table] = rows.length;
}
db.exec('COMMIT');

db.exec(`
CREATE INDEX idx_price_now_pid ON Price_Now(pId);
CREATE INDEX idx_price_history_pid ON Price_History(pId);
CREATE INDEX idx_product_picture_pid ON Product_Picture(pId);
CREATE INDEX idx_client_favorites_cid ON Client_Favorites(cId);
CREATE INDEX idx_good_review_pid ON Good_Review(pId);
PRAGMA foreign_keys = ON;
PRAGMA optimize;
`);

const check = {};
for (const table of Object.keys(specs)) {
  check[table] = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
}
const sampleProducts = db.prepare(`SELECT pId, pName, brand, category FROM Product ORDER BY pId LIMIT 5`).all();
const blobBytes = db.prepare(`SELECT COALESCE(SUM(length(pic)), 0) AS bytes FROM Product_Picture`).get().bytes;
const report = {
  source: 'DB20251219_backup',
  sourceType: 'Microsoft SQL Server backup (.bak)',
  output: out,
  counts,
  check,
  blobBytes,
  sampleProducts
};
writeFileSync(reportOut, JSON.stringify(report, null, 2), 'utf8');
db.close();
console.log(JSON.stringify(report, null, 2));
