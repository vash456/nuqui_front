import { Cuenta } from './Cuenta.js';

export class TarjetaCredito extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, cupo, deuda, numeroCuotas) {
    super(numeroCuenta, saldo, fechaApertura, estado);
    this.cupo = cupo;
    this.deuda = deuda;
    this.numeroCuotas = numeroCuotas;
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  comprar(monto, cuotas) {
    throw new Error('Metodo no implementado');
  }

  pagar(monto) {
    throw new Error('Metodo no implementado');
  }

  calcularTasaCosto() {
    throw new Error('Metodo no implementado');
  }

  calcularCuotaMensual() {
    throw new Error('Metodo no implementado');
  }

  transferir(destino, cuenta, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
    throw new Error('Metodo no implementado');
  }
}
