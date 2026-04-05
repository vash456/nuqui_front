import { Cliente } from './Cliente.js';
import { CuentaAhorros } from './CuentaAhorros.js';
import { CuentaCorriente } from './CuentaCorriente.js';
import { TarjetaCredito } from './TarjetaCredito.js';

export class ProductosCliente {
  constructor(cliente) {
    if (!(cliente instanceof Cliente)) {
      throw new Error('Se requiere una instancia de Cliente');
    }
    this.cliente = cliente;
    this.cuentas = [];
    this.tarjetas = [];
  }

  agregarCuenta(cuenta) {
    if (!(cuenta instanceof CuentaAhorros) && !(cuenta instanceof CuentaCorriente)) {
      throw new Error('La cuenta debe ser una instancia de CuentaAhorros o CuentaCorriente');
    }
    this.cuentas.push(cuenta);
  }

  obtenerCuenta(numeroCuenta) {
    return this.cuentas.find(c => c.numeroCuenta === numeroCuenta) || null;
  }

  listarCuentas() {
    return [...this.cuentas];
  }

  agregarTarjeta(tarjeta) {
    if (!(tarjeta instanceof TarjetaCredito)) {
      throw new Error('La tarjeta debe ser una instancia de TarjetaCredito');
    }
    this.tarjetas.push(tarjeta);
  }

  obtenerTarjeta(numeroCuenta) {
    return this.tarjetas.find(t => t.numeroCuenta === numeroCuenta) || null;
  }

  listarTarjetas() {
    return [...this.tarjetas];
  }

  obtenerCliente() {
    return this.cliente;
  }

  tieneProductos() {
    return this.cuentas.length > 0 || this.tarjetas.length > 0;
  }

  obtenerResumen() {
    return {
      clienteId: this.cliente.id,
      clienteNombre: this.cliente.nombreCompleto,
      cuentas: this.cuentas.length,
      tarjetas: this.tarjetas.length,
      productosTotal: this.cuentas.length + this.tarjetas.length
    };
  }

  obtenerProductosPorTipo(tipo) {
    switch (tipo) {
      case 'cuentas':
        return this.listarCuentas();
      case 'cuentasAhorros':
        return this.cuentas.filter(c => c instanceof CuentaAhorros);
      case 'cuentasCorrientes':
        return this.cuentas.filter(c => c instanceof CuentaCorriente);
      case 'tarjetas':
        return this.listarTarjetas();
      default:
        return [];
    }
  }
}