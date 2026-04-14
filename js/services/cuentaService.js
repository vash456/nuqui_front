import { CuentaCorriente } from '../models/CuentaCorriente.js';
import { CuentaAhorros } from '../models/CuentaAhorros.js';

const cuentaService = {
  validarMonto(monto) {
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto debe ser un número mayor a cero' };
    }
    return { success: true, value: valor };
  },

  esCuentaValida(cuenta) {
    return cuenta instanceof CuentaCorriente || cuenta instanceof CuentaAhorros;
  },

  retirar(cuenta, monto) {
    if (!this.esCuentaValida(cuenta)) {
      return { success: false, message: 'Cuenta inválida para retiro' };
    }

    const validation = this.validarMonto(monto);
    if (!validation.success) return validation;

    return cuenta.retirar(validation.value);
  },

  consignar(cuenta, monto) {
    if (!this.esCuentaValida(cuenta)) {
      return { success: false, message: 'Cuenta inválida para consignación' };
    }

    const validation = this.validarMonto(monto);
    if (!validation.success) return validation;

    return cuenta.consignar(validation.value);
  },

  obtenerSaldoDisponible(cuenta) {
    if (!this.esCuentaValida(cuenta)) {
      return 0;
    }

    if (cuenta instanceof CuentaCorriente) {
      return Number(cuenta.saldo) + Number(cuenta.calcularLimiteSobregiro());
    }

    return Number(cuenta.saldo);
  }
};

export default cuentaService;
