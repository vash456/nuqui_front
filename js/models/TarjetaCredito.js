import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';

export class TarjetaCredito extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, cupo, deuda, numeroCuotas) {
    super(numeroCuenta, Number(saldo) || 0, fechaApertura, estado);
    this.cupo = Number(cupo) || 0;
    this.deuda = Number(deuda) || 0;
    this.numeroCuotas = numeroCuotas;
  }

  comprar(monto, cuotas = 1) {
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto de compra debe ser mayor a cero' };
    }
    if (this.deuda + valor > this.cupo) {
      return { success: false, message: 'Compra excede el cupo disponible' };
    }
    this.deuda += valor;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.COMPRA,
      valor,
      this.deuda,
      `Compra de ${valor} en ${cuotas} cuotas`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Compra realizada', data: { nuevaDeuda: this.deuda, cuotas } };
  }

  pagar(monto) {
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto a pagar debe ser mayor a cero' };
    }
    if (valor > this.deuda) {
      return { success: false, message: 'El monto excede la deuda actual' };
    }
    this.deuda -= valor;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.PAGO,
      valor,
      this.deuda,
      `Pago de ${valor}`
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
