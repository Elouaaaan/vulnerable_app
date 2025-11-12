document.addEventListener('DOMContentLoaded', () => {
  const loadingEl = document.getElementById('appointments-loading');
  const emptyEl = document.getElementById('appointments-empty');
  const listEl = document.getElementById('appointments-list');
  const errorEl = document.getElementById('appointments-error');

  if (!loadingEl || !emptyEl || !listEl || !errorEl) {
    return;
  }

  loadAppointments({ loadingEl, emptyEl, listEl, errorEl });
});

async function loadAppointments({ loadingEl, emptyEl, listEl, errorEl }) {
  try {
    const response = await fetch('/appointments/data', {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { appointments } = await response.json();

    if (!appointments || appointments.length === 0) {
      emptyEl.classList.remove('hidden');
      return;
    }

    const fragment = document.createDocumentFragment();
    appointments.forEach(appt => {
      const item = document.createElement('li');
      const start = new Date(appt.start_ts);
      const end = new Date(appt.end_ts);

      item.innerHTML = `
        With Dr ${appt.doctor_surname} ${appt.doctor_name} —
        ${start.toLocaleString()} to ${end.toLocaleString()}
        — Status: <strong>${appt.status}</strong>
        ${appt.reason ? ' — Reason: ' + appt.reason : ''}
        — <a href="/appointments/confirm/${appt.id}">details</a>
      `;

      fragment.appendChild(item);
    });

    listEl.appendChild(fragment);
    listEl.classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load appointments', err);
    errorEl.classList.remove('hidden');
  } finally {
    loadingEl.classList.add('hidden');
  }
}

