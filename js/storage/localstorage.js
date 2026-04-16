const STORAGE_KEYS = {
  USERS: 'astro_users',
  SESSION_PREFIX: 'session_',
  PRODUCTOS_CLIENTE: 'productos_clientes'
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
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.SESSION_PREFIX)) {
        return this.getItem(key);
      }
    }
    return null;
  },

  saveSession(user) {
    const key = STORAGE_KEYS.SESSION_PREFIX + user.id;
    this.setItem(key, user);
  },

  clearSession(userId) {
    if (userId) {
      const key = STORAGE_KEYS.SESSION_PREFIX + userId;
      this.removeItem(key);
    } else {
      // Fallback: eliminar cualquier sesión si no se pasa userId
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.SESSION_PREFIX)) {
          this.removeItem(key);
          break;
        }
      }
    }
  },

  guardarProductosClientes(productos) {
    this.setItem(STORAGE_KEYS.PRODUCTOS_CLIENTE, productos);
  },

  obtenerProductosClientes() {
    return this.getItem(STORAGE_KEYS.PRODUCTOS_CLIENTE) ?? [];
  },

  existeNumeroCuenta(numeroCuenta) {
    if (!numeroCuenta) return false;
    const productos = this.obtenerProductosClientes();
    return productos.some(productosCliente => {
      const cuentas = productosCliente.cuentas ?? [];
      const tarjetas = productosCliente.tarjetas ?? [];
      return cuentas.some(c => c.numeroCuenta === numeroCuenta) || tarjetas.some(t => t.numeroCuenta === numeroCuenta);
    });
  }

};

export default localStorageService;
