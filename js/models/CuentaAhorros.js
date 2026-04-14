import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';

export class CuentaAhorros extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, tasaInteres) {
    super(numeroCuenta, Number(saldo) || 0, fechaApertura, estado);
    this.tasaInteres = tasaInteres;
  }

  consultarSaldo() {
    return Number(this.saldo) || 0;
  }

  retirar(monto) {
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto a retirar debe ser mayor a cero' };
    }
    if (valor > this.saldo) {
      return { success: false, message: 'Fondos insuficientes' };
    }

    this.saldo -= valor;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.RETIRO,
      valor,
      this.saldo,
      `Retiro de ${valor}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Retiro exitoso', data: { nuevoSaldo: this.saldo } };
  }

  consignar(monto) {
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto a consignar debe ser mayor a cero' };
    }

    this.saldo += valor;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.CONSIGNACION,
      valor,
      this.saldo,
      `Consignación de ${valor}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Consignación exitosa', data: { nuevoSaldo: this.saldo } };
  }

  aplicarIntereses() {
    const intereses = this.calcularIntereses();
    this.saldo += intereses;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
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
    return (Number(this.saldo) * Number(this.tasaInteres)) / 100;
  }

  transferir(destino, cuenta, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
    throw new Error('Metodo no implementado');
  }
}
