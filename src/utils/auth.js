export function getAuthData() {
  try {
    const raw = localStorage.getItem('authData');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    // Corrupted value in localStorage — recover by clearing the key and returning empty object
    try { localStorage.removeItem('authData'); } catch (err) { /* ignore */ }
    return {};
  }
}

export function setAuthData(obj) {
  try {
    localStorage.setItem('authData', JSON.stringify(obj));
  } catch (e) {
    // ignore write errors for now
  }
}

export default { getAuthData, setAuthData };
