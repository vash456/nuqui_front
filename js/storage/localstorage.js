const STORAGE_KEYS = {
  USERS: 'nuqui_users',
  SESSION: 'nuqui_session',
};

const localStorageService = {
  getItem(key) {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  },

  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },

  getUsers() {
    return this.getItem(STORAGE_KEYS.USERS) ?? [];
  },

  saveUsers(users) {
    this.setItem(STORAGE_KEYS.USERS, users);
  },

  getCurrentSession() {
    return this.getItem(STORAGE_KEYS.SESSION);
  },

  saveSession(user) {
    this.setItem(STORAGE_KEYS.SESSION, user);
  },

  clearSession() {
    this.removeItem(STORAGE_KEYS.SESSION);
  },
};

export default localStorageService;
