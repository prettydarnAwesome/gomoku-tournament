
let r = require('rethinkdb')
const fs = require('fs');
const path = require('path');

const codeDirectory = 'botData/'

const uploadToServer = require('./uploadSetToServer.js')

require('dotenv').config()


r.connect({ host: process.env.DB_ADDRESS, port: process.env.DB_PORT, db: 'gomoku' }, async function (err, conn) {


    r.table('Bots').changes().run(conn, function (err, cursor) {
        console.log("Listening to database...")
        cursor.each((err, row) => {
          console.log(row)
          runTournament(row.new_val.botID, 100, 19, 5)
        })
    })
})


function runTournament(targetBotID, setLength, boardSize, winCondition) {
    console.log("Running tournament for botID: "+targetBotID);

    r.connect({ host: process.env.DB_ADDRESS, port: process.env.DB_PORT, db: 'gomoku' }, async function (err, conn) {
        if (err) throw err;

        let result = await r.table('Bots').run(conn, function (err, res) {
            if (err) throw err;
        });

        result = await result.toArray();

        if (!fs.existsSync(codeDirectory)) {
            fs.mkdirSync(codeDirectory);
        }

        for (let bot of result) {
            fs.writeFileSync(codeDirectory + bot.botID + ".js", bot.code);
        };

        for(let bot of result)
        {
            if(bot.botID !== targetBotID)
            {
                let stats = await playSet(targetBotID, bot.botID, setLength, boardSize, winCondition);//play set

                await uploadToServer(boardSize, winCondition, setLength, stats, targetBotID, bot.botID)
            }
        }
        
        //require('./uploadSetToServer.js')(boardSize, winCondition, setLength, stats, bot1ID, bot2ID)

        //Delete files
        fs.readdir(codeDirectory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlinkSync(path.join(codeDirectory, file))
            }
        });

        conn.close(function (err) { if (err) throw err; })
    });
    console.log("Tournament for botID: "+targetBotID+ " completed.");
}

async function playSet(bot1ID, bot2ID, setLength, boardSize, winCondition)
{
    let gomoku = new (require('@cesque/gomoku'))(boardSize, winCondition);

    // for (let bot of result) {
    //     fs.writeFileSync(codeDirectory + bot.botID + ".js", bot.code);
    //     await gomoku.add(path.resolve(__dirname, codeDirectory + bot.botID + ".js"), bot.botID, {})
    // };

    await gomoku.add(path.resolve(__dirname, codeDirectory + bot1ID + ".js"), bot1ID, {})
    await gomoku.add(path.resolve(__dirname, codeDirectory + bot2ID + ".js"), bot2ID, {})

    //console.time(setLength + ' games')
    await gomoku.playSet(setLength)
    //console.timeEnd(setLength + ' games')

    let stats = gomoku.stats()

    gomoku.dismantle()

    return stats
}

function callback(err, res) {
    if (err) throw err;
}

module.exports = runTournament

//runTournament('d5aca6b4-07c4-4ed0-aaf3-5bc449f9e0c0', 100, 19, 5);