import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';

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

    return { success: true, message: 'Consignación exitosa', data: { nuevoSaldo: this.saldo } };
  }

  transferir(destino, cuenta, monto) {
    throw new Error('Metodo no implementado');
  }

  validarDestino(cuenta) {
    throw new Error('Metodo no implementado');
  }
}
