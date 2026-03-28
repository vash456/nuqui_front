export class Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado) {
    this.numeroCuenta = numeroCuenta;
    this.saldo = saldo;
    this.fechaApertura = fechaApertura;
    this.estado = estado;
    this.movimientos = [];
  }

  consultarSaldo() {
    throw new Error('Metodo no implementado');
  }

  consignar(monto) {
    throw new Error('Metodo no implementado');
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  obtenerMovimientos() {
    throw new Error('Metodo no implementado');
  }

  registrarMovimiento(movimiento) {
    throw new Error('Metodo no implementado');
  }
}
