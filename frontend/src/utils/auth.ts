export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getRole = (): string | null => {
  return localStorage.getItem('role');
};

export const setAuth = (token: string, role: string, userId?: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  if (userId) localStorage.setItem('userId', userId);
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
};

export const logout = (): void => {
  clearAuth();
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};