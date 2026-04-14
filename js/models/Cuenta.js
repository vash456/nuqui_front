export class Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado) {
    this.numeroCuenta = numeroCuenta;
    this.saldo = Number(saldo) || 0;
    this.fechaApertura = fechaApertura;
    this.estado = estado;
    this.movimientos = [];
  }

  consultarSaldo() {
    return Number(this.saldo) || 0;
  }

  consignar(monto) {
    throw new Error('Metodo no implementado');
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  obtenerMovimientos() {
    return [...this.movimientos];
  }

  registrarMovimiento(movimiento) {
    if (!movimiento || typeof movimiento !== 'object') {
      throw new Error('Movimiento inválido');
    }
    this.movimientos.push(movimiento);
  }
}
