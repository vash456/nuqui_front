import localStorageService from '../storage/localstorage.js';
import { Cliente } from '../models/Cliente.js';

const authService = {
  getUsers() {
    return localStorageService.getUsers();
  },

  saveUsers(users) {
    localStorageService.saveUsers(users);
  },

  getUserForSession(user) {
    return {
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      identificacion: user.identificacion,
      usuario: user.usuario,
      email: user.email,
      celular: user.celular,
    };
  },

  getCurrentUser() {
    return localStorageService.getCurrentSession();
  },

  saveSession(user) {
    const safeUser = this.getUserForSession(user);
    localStorageService.saveSession(safeUser);
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

    const newUser = new Cliente(
      Date.now().toString(),
      userData.identificacion.trim(),
      userData.nombre.trim(),
      userData.telefono ? userData.telefono.trim() : '',
      userData.usuario.trim(),
      userData.email.trim().toLowerCase(),
      userData.fechaNacimiento || null,
      userData.password
    );

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

    if (user.contrasena !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    this.saveSession(this.getUserForSession(user));
    return { success: true, message: 'Login exitoso.', user: user.usuario };
  },

  logout(userId = null) {
    this.clearSession(userId);
    return { success: true, message: 'Sesión cerrada.' };
  },

  updatePassword(userId, oldPassword, newPassword) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const user = users[userIndex];

    if (user.contrasena !== oldPassword) {
      return { success: false, message: 'La contraseña actual es incorrecta.' };
    }

    user.contrasena = newPassword;
    this.saveUsers(users);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  },
};

export default authService;
