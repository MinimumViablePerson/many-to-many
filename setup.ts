import Database from 'better-sqlite3'

const db = new Database('./data.db', {
  verbose: console.log
})

// drivers
const drivers = [
  { name: 'Endi' },
  { name: 'Geri' },
  { name: 'Ed' },
  { name: 'Ilir' }
]

// passengers
const passengers = [
  { name: 'Rinor' },
  { name: 'Elidon' },
  { name: 'Visard' },
  { name: 'Desintila' },
  { name: 'Artiola' }
]

// rides
const rides = [
  {
    driverId: 1,
    passengerId: 1,
    price: 20.3
  },
  {
    driverId: 1,
    passengerId: 2,
    price: 30.3
  },
  {
    driverId: 1,
    passengerId: 3,
    price: 40.3
  },
  {
    driverId: 1,
    passengerId: 4,
    price: 100.3
  },
  {
    driverId: 1,
    passengerId: 5,
    price: 12342545.3
  },
  {
    driverId: 2,
    passengerId: 1,
    price: 40.3
  },
  {
    driverId: 1,
    passengerId: 3,
    price: 70.3
  },
  {
    driverId: 1,
    passengerId: 5,
    price: 100.3
  },
  {
    driverId: 4,
    passengerId: 1,
    price: 50.3
  },
  {
    driverId: 4,
    passengerId: 2,
    price: 80.7
  }
]

db.exec(`
DROP TABLE IF EXISTS rides;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS passengers;

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER,
  name TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS passengers (
  id INTEGER,
  name TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rides (
  id INTEGER,
  driverId INTEGER NOT NULL,
  passengerId INTEGER NOT NULL,
  price REAL NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (driverId) REFERENCES drivers(id),
  FOREIGN KEY (passengerId) REFERENCES passengers(id)
);
`)

const createDriver = db.prepare(`
INSERT INTO drivers (name) VALUES (?);
`)

const createPassenger = db.prepare(`
INSERT INTO passengers (name) VALUES (?);
`)

const createRide = db.prepare(`
INSERT INTO rides (driverId, passengerId, price)
VALUES (?, ? ,?);
`)

for (const driver of drivers) {
  createDriver.run(driver.name)
}

for (const passenger of passengers) {
  createPassenger.run(passenger.name)
}

for (const ride of rides) {
  createRide.run(ride.driverId, ride.passengerId, ride.price)
}
