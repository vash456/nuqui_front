import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';

export class TarjetaCredito extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, cupo, deuda, numeroCuotas) {
    super(numeroCuenta, saldo, fechaApertura, estado);
    this.cupo = cupo;
    this.deuda = deuda;
    this.numeroCuotas = numeroCuotas;
  }

  comprar(monto, cuotas = 1) {
    if (monto <= 0) {
      return { success: false, message: 'El monto de compra debe ser mayor a cero' };
    }
    if (this.deuda + monto > this.cupo) {
      return { success: false, message: 'Compra excede el cupo disponible' };
    }
    this.deuda += monto;

    // Registrar movimiento
    const movimiento = new Movimiento(
      new Date(),
      TipoMovimiento.COMPRA,
      monto,
      this.deuda,
      `Compra de ${monto} en ${cuotas} cuotas`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Compra realizada', data: { nuevaDeuda: this.deuda, cuotas } };
  }

  pagar(monto) {
    if (monto <= 0) {
      return { success: false, message: 'El monto a pagar debe ser mayor a cero' };
    }
    if (monto > this.deuda) {
      return { success: false, message: 'El monto excede la deuda actual' };
    }
    this.deuda -= monto;

    // Registrar movimiento
    const movimiento = new Movimiento(
      new Date(),
      TipoMovimiento.PAGO,
      monto,
      this.deuda,
      `Pago de ${monto}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Pago realizado', data: { nuevaDeuda: this.deuda } };
  }

  retirar(monto) {
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
