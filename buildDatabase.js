let r = require('rethinkdb')
require('dotenv').config()
let dbName = 'gomoku'

function callback(err, res)
{
    if(err) throw err;
    console.log(res);
}

r.connect({ host: process.env.DB_ADDRESS, port: process.env.DB_PORT, db: 'gomoku' }, async function(err, conn) {
    if(err) throw err;

    await r.dbDrop(dbName).run(conn)

    //Create DB
    await r.dbCreate(dbName).run(conn, callback)
    
    //Create Tables
    await r.tableCreate('Authors', {primaryKey: 'authorID'}).run(conn, callback);
    r.table('Authors').indexCreate('authorName').run(conn, callback);

    await r.tableCreate('Bots', {primaryKey: 'botID'}).run(conn, callback);
    r.table('Bots').indexCreate('authorID').run(conn, callback);

    await r.tableCreate('Sets', {primaryKey: 'setID'}).run(conn, callback);

    await r.tableCreate('SetScores', {primaryKey: 'setScoreID'}).run(conn, callback);
    r.table('SetScores').indexCreate('setID').run(conn, callback);
    r.table('SetScores').indexCreate('botID').run(conn, callback);
    // r.table("SetScores").indexCreate(
    //     "setScoreKey", [r.row("setID"), r.row("botID")] //compound secondary key
    // ).run(conn, callback)

    await r.tableCreate('Matches', {primaryKey: 'matchID'}).run(conn, callback);
    r.table('Matches').indexCreate('setID').run(conn, callback);

    await r.tableCreate('MatchScores', {primaryKey: 'matchScoreID'}).run(conn, callback);
    r.table('MatchScores').indexCreate('matchID').run(conn, callback);
    await r.table('MatchScores').indexCreate('botID').run(conn, callback);
    // await r.table("MatchScores").indexCreate(
    //     "matchScoreKey", [r.row("matchID"), r.row("botID")] //compound secondary key
    // ).run(conn, callback)


    conn.close(function(err) { if (err) throw err; })
});