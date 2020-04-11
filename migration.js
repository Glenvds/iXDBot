const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./ixdBotDB.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS MusicRequests (
    "id"    INTEGER NOT NULL,
    "urlSearch" 
)`)