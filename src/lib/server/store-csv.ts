import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { COLUMNS, TABLE_NAMES, type Row, type TableName } from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const SEED_DIR = path.join(DATA_DIR, "seed");

function ensureDataDir() {
  if (fs.existsSync(path.join(DATA_DIR, "users.csv"))) return;
  TABLE_NAMES.forEach((name) => {
    const seedFile = path.join(SEED_DIR, `${name}.csv`);
    if (fs.existsSync(seedFile)) {
      fs.copyFileSync(seedFile, path.join(DATA_DIR, `${name}.csv`));
    }
  });
}

function filePath(name: TableName) {
  return path.join(DATA_DIR, `${name}.csv`);
}

export function readTableCsv(name: TableName): Row[] {
  ensureDataDir();
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, "utf8");
  if (!content.trim()) return [];
  return parse(content, { columns: true, skip_empty_lines: true }) as Row[];
}

export function writeTableCsv(name: TableName, rows: Row[]): void {
  ensureDataDir();
  const content = stringify(rows, { header: true, columns: COLUMNS[name] });
  fs.writeFileSync(filePath(name), content);
}

export function resetCsv(): void {
  TABLE_NAMES.forEach((name) => {
    const seedFile = path.join(SEED_DIR, `${name}.csv`);
    if (fs.existsSync(seedFile)) {
      fs.copyFileSync(seedFile, filePath(name));
    }
  });
}
