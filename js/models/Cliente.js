import { IAutenticable } from './IAutenticable.js';
import authService from "../services/authService.js";

export class Cliente extends IAutenticable {
  constructor(id, identificacion, nombreCompleto, celular, usuario, email, fechaNacimiento, contrasena) {
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
    this.fechaRegistro = new Date();
  }

  autenticar(usuario, contrasena) {
    return authService.login(usuario, contrasena);
  }

  cerrarSesion() {
    return authService.logout(this.id);
  }

  cambiarContrasena(contrasenaActual, newContrasena) {
    throw new Error('Metodo no implementado');
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

  editarPerfil() {
    throw new Error('Metodo no implementado');
  }
}
