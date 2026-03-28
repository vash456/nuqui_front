import { IAutenticable } from './IAutenticable.js';

export class Cliente extends IAutenticable {
  constructor(id, identificacion, nombreCompleto, celular, usuario, contrasena) {
    super();
    this.id = id;
    this.identificacion = identificacion;
    this.nombreCompleto = nombreCompleto;
    this.celular = celular;
    this.usuario = usuario;
    this.contrasena = contrasena;
    this.intentosFallidos = 0;
    this.bloqueado = false;
  }

  autenticar(usuario, contrasena) {
    throw new Error('Metodo no implementado');
  }

  cerrarSesion() {
    throw new Error('Metodo no implementado');
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
