import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';
import localStorageService from '../storage/localstorage.js';

export class CuentaCorriente extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, porcentajeSobregiro, limiteSobregiro) {
    super(numeroCuenta, saldo, fechaApertura, estado);
    this.porcentajeSobregiro = porcentajeSobregiro;
    this.limiteSobregiro = limiteSobregiro;
  }

  retirar(monto) {
    if (monto <= 0) {
      return { success: false, message: 'El monto a retirar debe ser mayor a cero' };
    }
    if (monto > this.saldo + this.calcularLimiteSobregiro()) {
      return { success: false, message: 'Fondos insuficientes, incluyendo sobregiro' };
    }
    this.saldo -= monto;

    // Registrar movimiento
        const movimiento = new Movimiento(
          this.movimientos.length + 1,
          new Date(),
          TipoMovimiento.RETIRO,
          monto,
          this.saldo,
          `Retiro de ${monto}`
        );
        this.registrarMovimiento(movimiento);
    
        return { success: true, message: 'Retiro exitoso', data: { nuevoSaldo: this.saldo } };
  }

  calcularLimiteSobregiro() {
    return (this.saldo * this.porcentajeSobregiro) / 100;
  }

  consignar(monto) {
    if (monto <= 0) {
      return { success: false, message: 'El monto a consignar debe ser mayor a cero' };
    }
    this.saldo += monto;

    console.log("movimientos antes de la transferencia:");
    console.log(this.movimientos);

    // Registrar movimiento
    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.CONSIGNACION,
      monto,
      this.saldo,
      `Consignación de ${monto}`
    );
    this.registrarMovimiento(movimiento);
    console.log("movimientos despues de la transferencia:");
    console.log(this.movimientos);
    return { success: true, message: 'Consignación exitosa', data: { nuevoSaldo: this.saldo } };
  }

  transferir(destino, monto) {
    const validacion = this.validarDestino(destino);
    if (!validacion.success) return validacion;

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto de la transferencia debe ser mayor a cero' };
    }

    const limiteDisponible = this.saldo + this.calcularLimiteSobregiro();
    if (valor > limiteDisponible) {
      return { success: false, message: 'Fondos insuficientes, incluyendo sobregiro' };
    }

    const destinoEsTarjeta = destino?.constructor?.name === 'TarjetaCredito';
    if (destinoEsTarjeta) {
      const deudaDestino = Number(destino.deuda) || 0;
      if (valor > deudaDestino) {
        return { success: false, message: 'El monto excede la deuda de la tarjeta destino' };
      }
    }
    console.log("movimientos antes de la transferencia:");
    console.log(this.movimientos);
    
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

    console.log("movimientos despues de la transferencia:");
    console.log(this.movimientos);

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
