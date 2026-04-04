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
      nombre: user.nombreCompleto || user.nombre,
      identificacion: user.identificacion,
      usuario: user.usuario,
      email: user.email,
      telefono: user.celular || user.telefono,
      fechaNacimiento: user.fechaNacimiento,
      createdAt: user.createdAt,
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

    // const newUser = {
    //   id: Date.now().toString(),
    //   nombre: userData.nombre.trim(),
    //   identificacion: userData.identificacion.trim(),
    //   usuario: userData.usuario.trim(),
    //   email: userData.email.trim().toLowerCase(),
    //   telefono: userData.telefono ? userData.telefono.trim() : '',
    //   password: userData.password,
    //   createdAt: new Date().toISOString(),
    // };

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

  logout(userId = null) {
    this.clearSession(userId);
    return { success: true, message: 'Sesión cerrada.' };
  },
};

export default authService;
