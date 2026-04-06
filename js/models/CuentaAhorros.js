import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';

export class CuentaAhorros extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, tasaInteres) {
    super(numeroCuenta, saldo, fechaApertura, estado);
    this.tasaInteres = tasaInteres;
  }

  retirar(monto) {
    if (monto <= 0) {
      return { success: false, message: 'El monto a retirar debe ser mayor a cero' };
    }
    if (monto > this.saldo) {
      return { success: false, message: 'Fondos insuficientes' };
    }
    this.saldo -= monto;

    // Registrar movimiento
    const movimiento = new Movimiento(
      new Date(),
      TipoMovimiento.RETIRO,
      monto,
      this.saldo,
      `Retiro de ${monto}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Retiro exitoso', data: { nuevoSaldo: this.saldo } };
  }

  consignar(monto) {
    if (monto <= 0) {
      return { success: false, message: 'El monto a consignar debe ser mayor a cero' };
    }
    this.saldo += monto;

    // Registrar movimiento
    const movimiento = new Movimiento(
      new Date(),
      TipoMovimiento.CONSIGNACION,
      monto,
      this.saldo,
      `Consignación de ${monto}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Consignación exitosa', data: { nuevoSaldo: this.saldo } };
  }

  aplicarIntereses() {
    const intereses = this.calcularIntereses();
    this.saldo += intereses;

    // Registrar movimiento
    const movimiento = new Movimiento(
      new Date(),
      TipoMovimiento.INTERESES,
      intereses,
      this.saldo,
      `Aplicación de intereses ${intereses}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Intereses aplicados', data: { intereses, nuevoSaldo: this.saldo } };
  }

  calcularIntereses() {
    return (this.saldo * this.tasaInteres) / 100;
  }

  transferir(destino, cuenta, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
    throw new Error('Metodo no implementado');
  }
}
