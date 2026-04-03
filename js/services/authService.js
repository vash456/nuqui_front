import localStorageService from '../storage/localstorage.js';

const authService = {
  getUsers() {
    return localStorageService.getUsers();
  },

  saveUsers(users) {
    localStorageService.saveUsers(users);
  },

  getCurrentUser() {
    return localStorageService.getCurrentSession();
  },

  saveSession(user) {
    localStorageService.saveSession(user);
  },

  clearSession() {
    localStorageService.clearSession();
  },

  register(userData) {
    const users = this.getUsers();

    if (!userData.nombre || !userData.identificacion || !userData.usuario || !userData.email || !userData.password) {
      return { success: false, message: 'Todos los campos obligatorios deben estar completos.' };
    }

    const exists = users.some(user =>
      user.identificacion === userData.identificacion ||
      user.usuario.toLowerCase() === userData.usuario.toLowerCase() ||
      user.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (exists) {
      return { success: false, message: 'Ya existe un usuario con la misma identificación, usuario o correo.' };
    }

    const newUser = {
      id: Date.now().toString(),
      nombre: userData.nombre.trim(),
      identificacion: userData.identificacion.trim(),
      usuario: userData.usuario.trim(),
      email: userData.email.trim().toLowerCase(),
      telefono: userData.telefono ? userData.telefono.trim() : '',
      password: userData.password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registro exitoso.', user: newUser };
  },

  login(identifier, password) {
    const users = this.getUsers();
    
    const user = users.find(user =>
      user.usuario.toLowerCase() === identifier.toLowerCase() ||
      user.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      return { success: false, message: 'Usuario o correo no encontrado.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    this.saveSession(this.getUserForSession(user));
    return { success: true, message: 'Login exitoso.', user: user.usuario };
  },

  getUserForSession(user) {
    return {
      id: user.id,
      nombre: user.nombre,
      identificacion: user.identificacion,
      usuario: user.usuario,
      email: user.email,
      telefono: user.telefono,
      createdAt: user.createdAt,
    };
  },

  logout() {
    this.clearSession();
    return { success: true, message: 'Sesión cerrada.' };
  },
};

export default authService;
