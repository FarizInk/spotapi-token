var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to the SQLite database.')
    db.run(`CREATE TABLE tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            access_token text, 
            token_type string(50), 
            expires_in integer,
            refresh_token text,
            scope text
            )`,
      (err) => {
        if (err) {
          // console.log(err);
          // Table already created
        } else {
          // Table just created, creating some rows
          var insert = 'INSERT INTO tokens (access_token, token_type, expires_in, refresh_token, scope) VALUES (?,?,?,?)'
          db.run(insert, ["aowkoakwokaw", "Bearer", 3600, 'refresh here', 'test ajah']);
        }
      });
  }
});


module.exports = db