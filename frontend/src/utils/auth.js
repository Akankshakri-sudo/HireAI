// Safe access to the locally stored auth user. localStorage values can be
// corrupted (or absent) — a raw JSON.parse there crashes the whole app.

export function getStoredUser() {
  try {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}
