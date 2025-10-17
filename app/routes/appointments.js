var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/authMiddleware');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

// List current user's appointments
router.get('/', authMiddleware, function(req, res, next) {
  const patientEmail = req.user.email;
  // Build query using JOIN to users for email comparison
  const sql = `
    SELECT a.id, a.start_ts, a.end_ts, a.status, a.reason,
           du.name as doctor_name, du.surname as doctor_surname
    FROM appointments a
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users du ON du.id = d.user_id
    JOIN users pu ON pu.id = a.patient_id
    WHERE pu.email = '` + patientEmail + `' ORDER BY a.start_ts DESC`;
  db.any(sql)
    .then(appointments => {
      res.render('appointments_list', { appointments });
    })
    .catch(err => {
      console.error(err);
      res.status(500).render('error');
    });
});

// JSON: available slots for a given doctor
router.get('/slots', authMiddleware, function(req, res, next) {
  const doctorId = req.query.doctor_id;
  if (!doctorId) {
    res.status(400).json({ message: 'doctor_id is required' });
    return;
  }

  db.any(
    `SELECT id, start_ts, end_ts
     FROM time_slots
     WHERE doctor_id = $1 AND is_booked = false AND start_ts > now()
     ORDER BY start_ts ASC
     LIMIT 200`,
    [doctorId]
  )
  .then(slots => {
    res.json({ slots });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });
});

// Show booking page with doctors and available slots
router.get('/new', authMiddleware, function(req, res, next) {
  Promise.all([
    db.any(`
      SELECT d.id as doctor_id, u.name, u.surname, COALESCE(s.name, '') as specialty
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN specialties s ON s.id = d.specialty_id
      ORDER BY u.surname, u.name
    `),
    db.any(`
      SELECT ts.id, ts.doctor_id, ts.start_ts, ts.end_ts
      FROM time_slots ts
      WHERE ts.is_booked = false AND ts.start_ts > now()
      ORDER BY ts.start_ts ASC
      LIMIT 200
    `)
  ])
  .then(([doctors, timeSlots]) => {
    res.render('appointments_new', { doctors, timeSlots });
  })
  .catch(err => {
    console.error(err);
    res.status(500).render('error');
  });
});

// Create appointment booking
router.post('/', authMiddleware, function(req, res, next) {
  if (!req.body) {
    res.status(400).send({ message: 'Missing request body' });
    return;
  }

  const { doctor_id, time_slot_id, reason } = req.body;
  if (!doctor_id || !time_slot_id) {
    res.status(400).send({ message: 'doctor_id and time_slot_id are required' });
    return;
  }

  const patientId = req.user.id;

  db.tx(async t => {
    const slot = await t.oneOrNone(
      `SELECT id, doctor_id, start_ts, end_ts, is_booked FROM time_slots WHERE id = $1 FOR UPDATE`,
      [time_slot_id]
    );

    if (!slot) {
      throw new Error('Time slot not found');
    }
    if (slot.is_booked) {
      throw new Error('Time slot already booked');
    }
    if (String(slot.doctor_id) !== String(doctor_id)) {
      throw new Error('Time slot does not belong to selected doctor');
    }

    await t.none(`UPDATE time_slots SET is_booked = true WHERE id = $1`, [slot.id]);

    const appt = await t.one(
      `INSERT INTO appointments (patient_id, doctor_id, time_slot_id, start_ts, end_ts, status, reason, created_by)
       VALUES ($1, $2, $3, $4, $5, 'requested', $6, $7)
       RETURNING id`,
      [patientId, slot.doctor_id, slot.id, slot.start_ts, slot.end_ts, reason || null, patientId]
    );

    return { appointmentId: appt.id };
  })
  .then(({ appointmentId }) => {
    res.status(201).redirect(`/appointments/confirm/${appointmentId}`);
  })
  .catch(err => {
    console.error('Appointment creation error:', err);
    res.status(400).render('error');
  });
});

// Simple confirmation page
router.get('/confirm/:id', authMiddleware, function(req, res, next) {
  const appointmentId = req.params.id;
  const patientEmail = req.user.email;
  const confirmSql = `
    SELECT a.id, a.start_ts, a.end_ts, a.status, a.reason,
           du.name as doctor_name, du.surname as doctor_surname
    FROM appointments a
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users du ON du.id = d.user_id
    JOIN users pu ON pu.id = a.patient_id
    WHERE a.id = $1 AND pu.email = $2`;
  db.oneOrNone(confirmSql, [appointmentId, patientEmail])
  .then(appointment => {
    if (!appointment) {
      return res.status(404).render('error');
    }
    res.render('appointments_confirm', { appointment });
  })
  .catch(err => {
    console.error(err);
    res.status(500).render('error');
  });
});

module.exports = router;


