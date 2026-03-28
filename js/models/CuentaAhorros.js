import { Cuenta } from './Cuenta.js';

export class CuentaAhorros extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, tasaInteres) {
    super(numeroCuenta, saldo, fechaApertura, estado);
    this.tasaInteres = tasaInteres;
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  aplicarIntereses() {
    throw new Error('Metodo no implementado');
  }

  calcularIntereses() {
    throw new Error('Metodo no implementado');
  }

  transferir(destino, cuenta, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
    throw new Error('Metodo no implementado');
  }
}
