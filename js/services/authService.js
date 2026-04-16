import localStorageService from '../storage/localstorage.js';
import { Cliente } from '../models/Cliente.js';
import sesionService from './sesionService.js';

const authService = {
  getUsers() {
    return localStorageService.getUsers();
  },

  saveUsers(users) {
    localStorageService.saveUsers(users);
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
    
    const userIndex = users.findIndex(user =>
      user.usuario.toLowerCase() === identifier.toLowerCase() ||
      user.email.toLowerCase() === identifier.toLowerCase()
    );

    if (userIndex === -1) {
      return { success: false, message: 'Usuario o correo no encontrado.' };
    }

    const storedUser = users[userIndex];
    const cliente = new Cliente(
      storedUser.id,
      storedUser.identificacion,
      storedUser.nombreCompleto,
      storedUser.celular,
      storedUser.usuario,
      storedUser.email,
      storedUser.fechaNacimiento,
      storedUser.contrasena
    );

    cliente.intentosFallidos = storedUser.intentosFallidos ?? 0;
    cliente.bloqueado = storedUser.bloqueado ?? false;

    if (cliente.bloqueado) {
      return {
        success: false,
        message: 'Tu cuenta está bloqueada tras 3 intentos fallidos. Contacta al soporte para desbloquearla.'
      };
    }

    if (storedUser.contrasena !== password) {
      cliente.incrementarIntentos();
      storedUser.intentosFallidos = cliente.intentosFallidos;
      storedUser.bloqueado = cliente.bloqueado;
      this.saveUsers(users);

      if (cliente.bloqueado) {
        return {
          success: false,
          message: 'Has superado el número máximo de intentos. Tu cuenta ha sido bloqueada.'
        };
      }

      return {
        success: false,
        message: `Contraseña incorrecta. Intento ${cliente.intentosFallidos} de 3.`
      };
    }

    cliente.resetearIntentos();
    storedUser.intentosFallidos = cliente.intentosFallidos;
    storedUser.bloqueado = cliente.bloqueado;
    this.saveUsers(users);

    sesionService.saveSession(sesionService.getUserForSession(storedUser));
    return { success: true, message: 'Login exitoso.', user: storedUser.usuario };
  },

  logout(userId) {
    sesionService.clearSession(userId);
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
