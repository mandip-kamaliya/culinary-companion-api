import Database from "better-sqlite3";
import fs from "fs";
import path, { dirname } from "path"
import { fileURLToPath } from "url";

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename);

const Datadir = path.join(__dirname,"..","data")
const dbpath = path.join(Datadir,"recipe.db")

if(!fs.existsSync(Datadir)){
    fs.mkdirSync(Datadir)
    console.log("Data folder created")
}

const db = new Database(dbpath,{verbose:console.log});

function initializeDatabase(){
    console.log("database initialisation");
    db.exec(`
                CREATE TABLE IF NOT EXISTS recipe(
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                name TEXT NOT NULL,
                ingredients TEXT NOT NULL, 
                instructions TEXT NOT NULL 
                 );       
           `);
    console.log("schema initialisation complete");       
}
initializeDatabase();
export default db;