const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'dyno.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper functions for Promises
const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

async function initDb() {
  // Create tables
  await query.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('client', 'worker')),
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query.run(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      jobs INTEGER DEFAULT 0,
      rate INTEGER NOT NULL,
      location TEXT NOT NULL,
      verified INTEGER DEFAULT 0, -- 0 for false, 1 for true
      exp TEXT NOT NULL,
      img TEXT NOT NULL,
      bio TEXT NOT NULL,
      avail TEXT NOT NULL,
      lat REAL,
      lng REAL,
      user_id INTEGER UNIQUE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Migration: Add lat/lng columns if they do not exist in an existing database
  try {
    await query.run('ALTER TABLE workers ADD COLUMN lat REAL');
    await query.run('ALTER TABLE workers ADD COLUMN lng REAL');
    console.log('Migrated workers table to add coordinates columns.');
  } catch (e) {
    // Columns already exist, ignore error
  }

  // Update coordinates for default mock locations if null
  try {
    await query.run('UPDATE workers SET lat = 28.6304, lng = 77.2177 WHERE location = "Delhi" AND lat IS NULL');
    await query.run('UPDATE workers SET lat = 28.6273, lng = 77.3725 WHERE location = "Noida" AND lat IS NULL');
    await query.run('UPDATE workers SET lat = 28.4901, lng = 77.0805 WHERE location = "Gurgaon" AND lat IS NULL');
    await query.run('UPDATE workers SET lat = 28.4089, lng = 77.3178 WHERE location = "Faridabad" AND lat IS NULL');
  } catch (e) {
    console.error('Error updating coord coordinates:', e.message);
  }

  await query.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      start_date TEXT NOT NULL,
      days INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('upcoming', 'active', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(worker_id) REFERENCES workers(id),
      FOREIGN KEY(client_id) REFERENCES users(id)
    )
  `);

  await query.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      days INTEGER NOT NULL,
      budget INTEGER NOT NULL,
      description TEXT,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES users(id)
    )
  `);

  // Seed workers if table is empty
  const count = await query.get('SELECT COUNT(*) as count FROM workers');
  if (count.count === 0) {
    console.log('Seeding initial worker database...');
    const seedWorkers = [
      { name: "Rajan Mehta", category: "driver", rating: 4.9, jobs: 312, rate: 800, location: "Delhi", verified: 1, exp: "5 yrs", img: "👨‍✈️", bio: "Professional driver with clean record. Available for city, outstation & wedding trips.", avail: "Immediate", lat: 28.6304, lng: 77.2177 },
      { name: "Sunita Devi", category: "caretaker", rating: 4.8, jobs: 198, rate: 700, location: "Noida", verified: 1, exp: "4 yrs", img: "👩‍⚕️", bio: "Experienced elderly & child care. First aid certified. Gentle, trustworthy, punctual.", avail: "Tomorrow", lat: 28.6273, lng: 77.3725 },
      { name: "Mohan Sharma", category: "cleaner", rating: 4.7, jobs: 540, rate: 450, location: "Gurgaon", verified: 1, exp: "6 yrs", img: "🧹", bio: "Deep cleaning specialist. Brings own equipment. Trusted by 200+ families.", avail: "Immediate", lat: 28.4901, lng: 77.0805 },
      { name: "Priya Nair", category: "chef", rating: 5.0, jobs: 87, rate: 950, location: "Delhi", verified: 1, exp: "3 yrs", img: "👩‍🍳", bio: "South Indian & North Indian cuisine expert. Hygienic, creative, and punctual.", avail: "Weekends", lat: 28.6448, lng: 77.2167 },
      { name: "Arjun Singh", category: "handyman", rating: 4.6, jobs: 421, rate: 600, location: "Faridabad", verified: 1, exp: "7 yrs", img: "🔨", bio: "Electrician + plumber + carpentry. All-in-one repair expert. Affordable rates.", avail: "Immediate", lat: 28.4089, lng: 77.3178 },
      { name: "Kavita Rao", category: "caretaker", rating: 4.9, jobs: 264, rate: 750, location: "Delhi", verified: 1, exp: "5 yrs", img: "👩‍🦱", bio: "Nanny & elderly care. Background checked. References from 50+ families.", avail: "Immediate", lat: 28.6139, lng: 77.2090 },
      { name: "Deepak Kumar", category: "driver", rating: 4.5, jobs: 189, rate: 750, location: "Gurgaon", verified: 0, exp: "2 yrs", img: "🧑‍✈️", bio: "Reliable city driver. Knows Delhi NCR thoroughly. App-based tracking enabled.", avail: "Tomorrow", lat: 28.4595, lng: 77.0266 },
      { name: "Ramesh Patel", category: "security", rating: 4.7, jobs: 93, rate: 800, location: "Noida", verified: 1, exp: "4 yrs", img: "💂", bio: "Ex-army trained. Event security specialist. Night shifts available.", avail: "Immediate", lat: 28.5355, lng: 77.3910 }
    ];

    for (const w of seedWorkers) {
      await query.run(`
        INSERT INTO workers (name, category, rating, jobs, rate, location, verified, exp, img, bio, avail, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [w.name, w.category, w.rating, w.jobs, w.rate, w.location, w.verified, w.exp, w.img, w.bio, w.avail, w.lat, w.lng]);
    }
    console.log('Seeding completed.');
  }
}

module.exports = {
  db,
  query,
  initDb
};
