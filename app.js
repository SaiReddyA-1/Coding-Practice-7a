const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const DBpath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const ConnectDBandServer = async () => {
  try {
    db = await open({
      filename: DBpath,
      driver: sqlite3.Database,
    })
    console.log('Database Connected Successfully')
    app.listen(3000, () => {
      console.log('Server is Connected in https//:localhost:3000/')
    })
  } catch (e) {
    console.log(`Error Connecting to the Database is: ${e.message}`)
  }
}
ConnectDBandServer()

//API 1
app.get('/players/', async (req, res) => {
  const Query = `SELECT player_id as playerId , player_name as playerName FROM player_details;`
  const DBres = await db.all(Query)
  res.send(DBres)
})
//API 2
app.get('/players/:ID/', async (req, res) => {
  const {ID} = req.params
  const Query = `SELECT player_id as playerId , player_name as playerName FROM player_details WHERE player_id = ?;`
  const DBres = await db.get(Query, [ID])
  res.send(DBres)
})
//API 3
app.put('/players/:ID/', async (req, res) => {
  const {ID} = req.params
  const {playerName} = req.body
  const Query = `UPDATE player_details SET player_name = ?  WHERE player_id = ?;`
  const DBres = await db.run(Query, [playerName, ID])
  res.send('Player Details Updated')
})
//API 4
app.get('/matches/:ID/', async (req, res) => {
  const {ID} = req.params
  const Query = `SELECT 
  match_id AS matchID,
  match,
  year
FROM 
  match_details 
WHERE 
  match_id = ?;
`
  const DBres = await db.get(Query, [ID])
  res.send(DBres)
})

//API 5
app.get('/players/:ID/matches', async (req, res) => {
  const {ID} = req.params
  const Query = `SELECT m.match_id as matchID , m.match , m.year from player_match_score p natural join match_details m where p.player_id = ?;`

  const DBres = await db.all(Query, [ID])
  res.send(DBres)
})
//API 6
app.get('/matches/:ID/players', async (req, res) => {
  const {ID} = req.params
  const Query = `SELECT m.player_id as playerID, m.player_name as playerName  
               FROM player_match_score p 
               NATURAL JOIN player_details m
               WHERE p.match_id = ?;`

  const DBres = await db.all(Query, [ID])
  res.send(DBres)
})
// API 7
app.get('/players/:playerId/playerScores/', async (req, res) => {
  try {
    const {playerId} = req.params
    const query =
      'SELECT p.player_id AS playerId, p.player_name AS playerName, SUM(s.score) AS totalScore, SUM(s.fours) AS totalFours, SUM(s.sixes) AS totalSixes FROM player_details p INNER JOIN player_match_score s ON p.player_id = s.player_id WHERE p.player_id = ?;'
    const playerScores = await db.get(query, [playerId])
    res.json(playerScores)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

module.exports = app
