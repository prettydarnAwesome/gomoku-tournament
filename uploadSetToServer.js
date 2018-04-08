let r = require('rethinkdb')

const codeDirectory = 'botData/'

require('dotenv').config()

function uploadSetToServer(boardSize, winCondition, setLength, stats, bot1ID, bot2ID) {

    r.connect({ host: process.env.DB_ADDRESS, port: process.env.DB_PORT, db: 'gomoku' }, async function (err, conn) {
        if (err) throw err;
        console.log("Inserting new Set")
        let setResult = await r.table("Sets").insert({
            setLength: setLength,
            dateTime: Date.now(),
            boardSize: boardSize,
            winCondition: winCondition
        }).run(conn, callback);
        let setID = setResult.generated_keys[0];
        console.log("Set with ID: " + setID + " inserted")


        console.log("Inserting new SetScores")
        r.table("SetScores").insert([
            {
                setID: setID,
                botID: bot1ID,
                botWins: stats.wins[0],
                botDraws: stats.draws,
                botLosses: stats.losses[0]
            },
            {
                setID: setID,
                botID: bot2ID,
                botWins: stats.wins[1],
                botDraws: stats.draws,
                botLosses: stats.losses[1]
            }]).run(conn, callback);


        let matchIndex = 0
        let matchResults = []
        //Create matches documents
        for (let match of stats.matches) {

            let moves = []
            for (let turn of match.turns) {
                moves.push(turn.move.x + turn.move.y * boardSize)
            }
            match.turns[0].player

            matchResults.push({
                setID: setID,
                moveList: moves,
                index: matchIndex
            })

            matchIndex += 1;
        }

        console.log("Inserting " + setLength + " Matches")
        let matchesInsertResult = await r.table('Matches').insert(matchResults).run(conn, callback) //insert matches
        let matchIDs = matchesInsertResult.generated_keys;

        matchIndex = 0
        let matchScores = []
        //Generate matchScores
        for (let match of stats.matches) {

            matchScores.push({
                matchID: matchIDs[matchIndex],
                botID: bot1ID,
                timeTaken: 0,
                won: match.winner == 1 ? true : false,
                turnOrderPriority: match.turns[0].player == 1 ? 0 : 1
            })

            matchScores.push({
                matchID: matchIDs[matchIndex],
                botID: bot2ID,
                timeTaken: 0,
                won: match.winner == 2 ? true : false,
                turnOrderPriority: match.turns[0].player == 2 ? 0 : 1
            })

            matchIndex += 1
        }

        console.log("Inserting " + setLength + " MatchScores")
        await r.table("MatchScores").insert(matchScores).run(conn, callback) //Insert matchScores
        console.log("MatchScores inserted")

        conn.close(function (err) { if (err) throw err; })

    });
}

function callback(err, res) {
    if (err) throw err;
}

module.exports = uploadSetToServer