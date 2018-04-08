let r = require('rethinkdb')
require('dotenv').config()

r.connect({ host: process.env.DB_ADDRESS, port: process.env.DB_PORT, db: 'gomoku' }, async function(err, conn) {
    if(err) throw err;

    await wipeData(conn);

    conn.close(function(err) { if (err) throw err; })

});

function callback(err, res)
{
    if(err) throw err;
    console.log(res);
}

async function wipeData(conn)
{
    await r.table("Authors").delete().run(conn, callback);
    
    await r.table("Bots").delete().run(conn, callback);
    
    await r.table("Sets").delete().run(conn, callback);
    
    await r.table("SetScores").delete().run(conn, callback);
    
    await r.table("Matches").delete().run(conn, callback);
    
    await r.table("MatchScores").delete().run(conn, callback);
}
