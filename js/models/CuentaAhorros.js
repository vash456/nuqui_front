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

    // Calcular comisión del 1.5%
    const comision = valor * 0.015;
    const totalADescontar = valor + comision;

    if (totalADescontar > this.saldo) {
      return { 
        success: false, 
        message: `Fondos insuficientes. Se requiere: $${totalADescontar.toFixed(2)} (retiro: $${valor.toFixed(2)} + comisión: $${comision.toFixed(2)})` 
      };
    }

    // Registrar retiro
    this.saldo -= valor;
    const movimientoRetiro = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.RETIRO,
      valor,
      this.saldo,
      `Retiro de ${valor}`
    );
    this.registrarMovimiento(movimientoRetiro);

    // Registrar comisión
    this.saldo -= comision;
    const movimientoComision = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.COMISIÓN,
      comision,
      this.saldo,
      `Comisión por retiro (1.5%): ${comision.toFixed(2)}`
    );
    this.registrarMovimiento(movimientoComision);

    return { success: true, message: 'Retiro exitoso', data: { nuevoSaldo: this.saldo, comision: comision } };
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
      TipoMovimiento.INTERES,
      intereses,
      this.saldo,
      `Intereses aplicados (${this.tasaInteres}%): ${intereses.toFixed(2)}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Intereses aplicados', data: { intereses, nuevoSaldo: this.saldo } };
  }

  calcularIntereses() {
    // Tasa de interés es un porcentaje, convertir a decimal dividiendo entre 100
    const tasaDecimal = Number(this.tasaInteres) / 100;
    return Number(this.saldo) * tasaDecimal;
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
