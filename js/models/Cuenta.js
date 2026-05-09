import { roundMoney } from '../utils/money.js';

export class Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado) {
    this.numeroCuenta = numeroCuenta;
    this.saldo = roundMoney(saldo);
    this.fechaApertura = fechaApertura;
    this.estado = estado;
    this.movimientos = [];
  }

  consultarSaldo() {
    return roundMoney(this.saldo);
  }

  consignar(monto) {
    throw new Error('Metodo no implementado');
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  transferir(destino, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
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
