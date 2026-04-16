import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';
import localStorageService from '../storage/localstorage.js';

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

  transferir(destino, monto) {
    const validacion = this.validarDestino(destino);
    if (!validacion.success) return validacion;

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto de la transferencia debe ser mayor a cero' };
    }

    const disponible = this.cupo - this.deuda;
    if (valor > disponible) {
      return { success: false, message: 'Cupo insuficiente en la tarjeta de crédito' };
    }

    const destinoEsTarjeta = destino?.constructor?.name === 'TarjetaCredito';
    if (destinoEsTarjeta) {
      const deudaDestino = Number(destino.deuda) || 0;
      if (valor > deudaDestino) {
        return { success: false, message: 'El monto excede la deuda de la tarjeta destino' };
      }
    }

    this.deuda += valor;
    const movimientoSalida = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.TRANSFERENCIA_OUT,
      valor,
      this.deuda,
      `Transferencia a ${destino.numeroCuenta}`
    );
    this.registrarMovimiento(movimientoSalida);

    if (destinoEsTarjeta) {
      destino.deuda -= valor;
      const movimientoEntrada = new Movimiento(
        destino.movimientos.length + 1,
        new Date(),
        TipoMovimiento.TRANSFERENCIA_IN,
        valor,
        destino.deuda,
        `Transferencia recibida de ${this.numeroCuenta}`
      );
      destino.registrarMovimiento(movimientoEntrada);
    } else {
      destino.saldo += valor;
      const movimientoEntrada = new Movimiento(
        destino.movimientos.length + 1,
        new Date(),
        TipoMovimiento.TRANSFERENCIA_IN,
        valor,
        destino.saldo,
        `Transferencia recibida de ${this.numeroCuenta}`
      );
      destino.registrarMovimiento(movimientoEntrada);
    }

    return { success: true, message: 'Transferencia realizada con éxito', data: { deuda: this.deuda } };
  }

  validarDestino(cuenta) {
    if (!cuenta || !cuenta.numeroCuenta) {
      return { success: false, message: 'Destino inválido para la transferencia' };
    }
    if (cuenta.numeroCuenta === this.numeroCuenta) {
      return { success: false, message: 'No se puede transferir a la misma tarjeta' };
    }
    if (!localStorageService.existeNumeroCuenta(cuenta.numeroCuenta)) {
      return { success: false, message: 'La cuenta destino no existe' };
    }
    return { success: true };
  }
}
