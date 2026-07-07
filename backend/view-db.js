const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dyno.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function viewDatabase() {
  console.log('\n================================================================');
  console.log('                 DYNO DATABASE INSPECTION TOOL                  ');
  console.log('================================================================');

  try {
    // 1. Show Users
    console.log('\n--- [USERS TABLE] ---');
    const users = await allQuery('SELECT id, name, email, role, phone, created_at FROM users');
    if (users.length === 0) {
      console.log('No registered users found.');
    } else {
      console.table(users);
    }

    // 2. Show Workers
    console.log('\n--- [WORKERS TABLE] ---');
    const workers = await allQuery('SELECT id, name, category, rating, jobs, rate, location, verified, exp, avail FROM workers');
    if (workers.length === 0) {
      console.log('No workers found.');
    } else {
      console.table(workers.map(w => ({ ...w, verified: w.verified === 1 ? 'Yes' : 'No' })));
    }

    // 3. Show Bookings
    console.log('\n--- [BOOKINGS TABLE] ---');
    const bookings = await allQuery('SELECT id, worker_id, client_id, role, start_date, days, amount, status, created_at FROM bookings');
    if (bookings.length === 0) {
      console.log('No bookings found.');
    } else {
      console.table(bookings);
    }

    // 4. Show Jobs
    console.log('\n--- [JOBS TABLE] ---');
    const jobs = await allQuery('SELECT id, client_id, category, location, start_date, days, budget, contact_name, contact_phone, created_at FROM jobs');
    if (jobs.length === 0) {
      console.log('No jobs posted.');
    } else {
      console.table(jobs);
    }

  } catch (err) {
    console.error('Error querying database tables:', err.message);
  } finally {
    db.close(() => {
      console.log('\n================================================================');
    });
  }
}

viewDatabase();
