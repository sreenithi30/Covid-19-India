// app.js

const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./covid19India.db')

const app = express()
app.use(express.json())

// API 1
app.get('/states/', (req, res) => {
  db.all('SELECT * FROM state', (err, rows) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
    } else {
      res.json(
        rows.map(row => ({
          stateId: row.state_id,
          stateName: row.state_name,
          population: row.population,
        })),
      )
    }
  })
})

// API 2
app.get('/states/:stateId/', (req, res) => {
  const stateId = req.params.stateId
  db.get('SELECT * FROM state WHERE state_id = ?', [stateId], (err, row) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Internal Server Error')
    } else if (!row) {
      res.status(404).send('State Not Found')
    } else {
      res.json({
        stateId: row.state_id,
        stateName: row.state_name,
        population: row.population,
      })
    }
  })
})

// API 3
app.post('/districts/', (req, res) => {
  const {districtName, stateId, cases, cured, active, deaths} = req.body
  db.run(
    'INSERT INTO district (district_name, state_id, cases, cured, active, deaths) VALUES (?, ?, ?, ?, ?, ?)',
    [districtName, stateId, cases, cured, active, deaths],
    function (err) {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
      } else {
        res.send('District Successfully Added')
      }
    },
  )
})

// API 4
app.get('/districts/:districtId/', (req, res) => {
  const districtId = req.params.districtId
  db.get(
    'SELECT * FROM district WHERE district_id = ?',
    [districtId],
    (err, row) => {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
      } else if (!row) {
        res.status(404).send('District Not Found')
      } else {
        res.json({
          districtId: row.district_id,
          districtName: row.district_name,
          stateId: row.state_id,
          cases: row.cases,
          cured: row.cured,
          active: row.active,
          deaths: row.deaths,
        })
      }
    },
  )
})

// API 5
app.delete('/districts/:districtId/', (req, res) => {
  const districtId = req.params.districtId
  db.run(
    'DELETE FROM district WHERE district_id = ?',
    [districtId],
    function (err) {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
      } else {
        res.send('District Removed')
      }
    },
  )
})

// API 6
app.put('/districts/:districtId/', (req, res) => {
  const {districtName, stateId, cases, cured, active, deaths} = req.body
  const districtId = req.params.districtId
  db.run(
    'UPDATE district SET district_name = ?, state_id = ?, cases = ?, cured = ?, active = ?, deaths = ? WHERE district_id = ?',
    [districtName, stateId, cases, cured, active, deaths, districtId],
    function (err) {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
      } else {
        res.send('District Details Updated')
      }
    },
  )
})

// API 7
app.get('/states/:stateId/stats/', (req, res) => {
  const stateId = req.params.stateId
  db.get(
    'SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths FROM district WHERE state_id = ?',
    [stateId],
    (err, row) => {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
      } else {
        res.json({
          totalCases: row.totalCases,
          totalCured: row.totalCured,
          totalActive: row.totalActive,
          totalDeaths: row.totalDeaths,
        })
      }
    },
  )
})

// API 8
app.get('/districts/:districtId/details/', (req, res) => {
  const districtId = req.params.districtId
  db.get(
    'SELECT state.state_name FROM district JOIN state ON district.state_id = state.state_id WHERE district.district_id = ?',
    [districtId],
    (err, row) => {
      if (err) {
        console.error(err.message)
        res.status(500).send('Internal Server Error')
      } else if (!row) {
        res.status(404).send('District Not Found')
      } else {
        res.json({
          stateName: row.state_name,
        })
      }
    },
  )
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

module.exports = app
