import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';
import localStorageService from '../storage/localstorage.js';

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
    return { success: true, message: 'Intereses aplicados', data: { intereses, nuevoSaldo: this.saldo } };
  }

  calcularIntereses() {
    return (Number(this.saldo) * Number(this.tasaInteres)) / 100;
  }

  transferir(destino, monto) {
    const validacion = this.validarDestino(destino);
    if (!validacion.success) return validacion;

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto de la transferencia debe ser mayor a cero' };
    }

    if (valor > this.saldo) {
      return { success: false, message: 'Fondos insuficientes en la cuenta de ahorros' };
    }

    const destinoEsTarjeta = destino?.constructor?.name === 'TarjetaCredito';
    if (destinoEsTarjeta) {
      const deudaDestino = Number(destino.deuda) || 0;
      if (valor > deudaDestino) {
        return { success: false, message: 'El monto excede la deuda de la tarjeta destino' };
      }
    }

    this.saldo -= valor;
    const movimientoSalida = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.TRANSFERENCIA_OUT,
      valor,
      this.saldo,
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

    return { success: true, message: 'Transferencia realizada con éxito', data: { saldo: this.saldo } };
  }

  validarDestino(cuenta) {
    if (!cuenta || !cuenta.numeroCuenta) {
      return { success: false, message: 'Destino inválido para la transferencia' };
    }
    if (cuenta.numeroCuenta === this.numeroCuenta) {
      return { success: false, message: 'No se puede transferir a la misma cuenta' };
    }
    if (!localStorageService.existeNumeroCuenta(cuenta.numeroCuenta)) {
      return { success: false, message: 'La cuenta destino no existe' };
    }
    return { success: true };
  }
}
