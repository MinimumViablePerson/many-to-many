import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const app = express()
app.use(cors())
app.use(express.json())

const db = new Database('./data.db', {
  verbose: console.log
})

const getAllDrivers = db.prepare(`
SELECT * FROM drivers;
`)

const getAllPassengers = db.prepare(`
SELECT * FROM passengers;
`)

const getPassengersForDriver = db.prepare(`
SELECT DISTINCT passengers.* FROM passengers
JOIN rides ON passengers.id = rides.passengerId
WHERE rides.driverId = ?;
`)

const getDriversForPassenger = db.prepare(`
SELECT DISTINCT drivers.* FROM drivers
JOIN rides ON drivers.id = rides.driverId
WHERE rides.passengerId = ?;
`)

const createRide = db.prepare(`
INSERT INTO rides (driverId, passengerId, price) VALUES (?, ? , ?);
`)

const getRideById = db.prepare(`
SELECT * FROM rides WHERE id = ?;
`)

const getDriverById = db.prepare(`
SELECT * FROM drivers WHERE id = ?;
`)

const getPassengerById = db.prepare(`
SELECT * FROM passengers WHERE id = ?;
`)

app.get('/drivers', (req, res) => {
  const drivers = getAllDrivers.all()

  for (const driver of drivers) {
    const passengers = getPassengersForDriver.all(driver.id)
    driver.passengers = passengers
  }

  // get rides for each driver

  res.send(drivers)
})

app.get('/passengers', (req, res) => {
  const passengers = getAllPassengers.all()

  for (const passenger of passengers) {
    const drivers = getDriversForPassenger.all(passenger.id)
    passenger.drivers = drivers
  }

  // get rides for each passenger

  res.send(passengers)
})

// Naive approach
// app.post('/rides', (req, res) => {
//   const { driverId, passengerId, price } = req.body

//   const info = createRide.run(driverId, passengerId, price)
//   const ride = getRideById.get(info.lastInsertRowid)
//   res.send(ride)
// })

// Production ready approach
app.post('/rides', (req, res) => {
  const { driverId, passengerId, price } = req.body

  const errors = []
  if (typeof driverId !== 'number')
    errors.push(`driverId missing or not a number`)
  if (typeof passengerId !== 'number')
    errors.push(`passengerId missing or not a number`)
  if (typeof price !== 'number') errors.push(`price missing or not a number`)

  if (errors.length === 0) {
    const driver = getDriverById.get(driverId)
    const passenger = getPassengerById.get(passengerId)

    if (driver && passenger) {
      const info = createRide.run(driverId, passengerId, price)
      const ride = getRideById.get(info.lastInsertRowid)
      res.send(ride)
    } else {
      res.status(400).send({ error: 'Driver or passenger not found.' })
    }
  } else {
    res.status(400).send({ errors: errors })
  }
})

app.listen(4000, () => {
  console.log(`Server up: http://localhost:4000`)
})
