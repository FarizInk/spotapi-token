import { config } from "https://deno.land/x/dotenv/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB(config().DB_SOURCE || "db.sqlite");
db.execute(`
  CREATE TABLE IF NOT EXISTS token (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token text, 
    token_type string(50), 
    expires_in integer,
    refresh_token text,
    scope text
  )
`);

const token = db.query("SELECT * FROM token WHERE id = 1");
if (token.length === 0) {
  db.query("INSERT INTO tokens (access_token, token_type, expires_in, refresh_token, scope) VALUES (?,?,?,?,?)", ["aowkoakwokaw", "Bearer", 3600, 'refresh_token_here', 'test ajah']);
}

export default db;