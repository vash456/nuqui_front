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
    throw new Error('Metodo no implementado');
  }

  resetearIntentos() {
    throw new Error('Metodo no implementado');
  }

  editarPerfil() {
    throw new Error('Metodo no implementado');
  }
}
