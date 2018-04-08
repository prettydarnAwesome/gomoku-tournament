let r = require('rethinkdb')
require('dotenv').config()
let asTable = require('as-table')

let tables = ['Authors','Bots','Sets','SetScores','Matches','MatchScores']

r.connect({ host: process.env.DB_ADDRESS, port: process.env.DB_PORT, db: 'gomoku' }, async function(err, conn) {
    if(err) throw err;

    for(let table of tables)
    {
        console.log("--"+table+"--")
        console.log(asTable.configure({delimiter:" | "})(await getTable(conn,table)))
        console.log()
    }
    
    conn.close(function(err) { if (err) throw err; })
});

async function getTable(conn, tableName)
{
    let result = await r.table(tableName).run(conn, function(err, res){
        if(err) throw err;
    });

    return await result.toArray()
}