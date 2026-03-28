import { Cuenta } from './Cuenta.js';

export class CuentaCorriente extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, porcentajeSobregiro, limiteSobregiro) {
    super(numeroCuenta, saldo, fechaApertura, estado);
    this.porcentajeSobregiro = porcentajeSobregiro;
    this.limiteSobregiro = limiteSobregiro;
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  calcularLimiteSobregiro() {
    throw new Error('Metodo no implementado');
  }

  transferir(destino, cuenta, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
    throw new Error('Metodo no implementado');
  }
}
