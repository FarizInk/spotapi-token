import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.5.0/mod.ts";

export interface DatabaseTokenType { 
  id: number,
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token: string,
  scope: string,
}

const db = new DB(config().DB_SOURCE || "db.sqlite");
db.execute(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token text, 
    token_type string(50), 
    expires_in integer,
    refresh_token text,
    scope text
  )
`);

const token = db.query("SELECT * FROM tokens WHERE id = 1");
if (token.length === 0) {
  db.query("INSERT INTO tokens (access_token, token_type, expires_in, refresh_token, scope) VALUES (?,?,?,?,?)", [null, null, null, null, null]);
}

export default db;
