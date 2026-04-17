import { IAutenticable } from './IAutenticable.js';
import authService from "../services/authService.js";
import sesionService from '../services/sesionService.js';

export class Cliente extends IAutenticable {
  constructor(id, identificacion, nombreCompleto, celular, usuario, email, fechaNacimiento, contrasena, fechaRegistro = null) {
    super();
    this.id = id;
    this.identificacion = identificacion;
    this.nombreCompleto = nombreCompleto;
    this.celular = celular;
    this.usuario = usuario;
    this.email = email;
    this.fechaNacimiento = fechaNacimiento;
    this.contrasena = contrasena;
    this.intentosFallidos = 0;
    this.bloqueado = false;
    this.fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : new Date();
  }

  autenticar(usuario, contrasena) {
    return authService.login(usuario, contrasena);
  }

  cerrarSesion() {
    return authService.logout(this.id);
  }

  cambiarContrasena(contrasenaActual, newContrasena) {
    const users = authService.getUsers();
    const userIndex = users.findIndex(user => user.id === this.id);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const user = users[userIndex];
    if (user.contrasena !== contrasenaActual) {
      return { success: false, message: 'La contraseña actual es incorrecta.' };
    }

    user.contrasena = newContrasena;
    authService.saveUsers(users);

    return { success: true, message: 'Contraseña actualizada correctamente.' };
  }

  editarPerfil({ nombreCompleto, usuario, email, celular, fechaNacimiento }) {
    const users = authService.getUsers();
    const userIndex = users.findIndex(user => user.id === this.id);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const existingUser = users[userIndex];
    const usernameExists = users.some((user, index) => index !== userIndex && user.usuario.toLowerCase() === usuario.toLowerCase());
    if (usernameExists) {
      return { success: false, message: 'El nombre de usuario ya está en uso.' };
    }

    const emailExists = users.some((user, index) => index !== userIndex && user.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'El correo electrónico ya está en uso.' };
    }

    existingUser.nombreCompleto = nombreCompleto;
    existingUser.usuario = usuario;
    existingUser.email = email.toLowerCase();
    existingUser.celular = celular;
    existingUser.fechaNacimiento = fechaNacimiento || null;

    authService.saveUsers(users);

    if (sesionService.getCurrentUser()?.id === this.id) {
      sesionService.saveSession(existingUser);
    }

    this.nombreCompleto = nombreCompleto;
    this.usuario = usuario;
    this.email = email.toLowerCase();
    this.celular = celular;
    this.fechaNacimiento = fechaNacimiento || null;

    return { success: true, message: 'Perfil actualizado correctamente.' };
  }

  incrementarIntentos() {
    if (this.bloqueado) {
      return;
    }

    this.intentosFallidos = (this.intentosFallidos || 0) + 1;
    if (this.intentosFallidos >= 3) {
      this.bloqueado = true;
    }
  }

  resetearIntentos() {
    this.intentosFallidos = 0;
    this.bloqueado = false;
  }
}

