export function getAuthInfo() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return { token, role };
}

export function isGuest() {
  const { role, token } = getAuthInfo();
  return role === 'guest' || token === 'guest-token';
}

export function isLoggedIn() {
  const { token } = getAuthInfo();
  return !!token && token !== 'guest-token';
}
