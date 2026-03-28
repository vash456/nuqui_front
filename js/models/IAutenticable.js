export class IAutenticable {
  autenticar(usuario, contrasena) {
    throw new Error('Metodo no implementado');
  }

  cerrarSesion() {
    throw new Error('Metodo no implementado');
  }

  cambiarContrasena(contrasenaActual, newContrasena) {
    throw new Error('Metodo no implementado');
  }
}
