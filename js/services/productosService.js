import localStorageService from '../storage/localstorage.js';
import { ProductosCliente } from '../models/ProductosCliente.js';
import { Cliente } from '../models/Cliente.js';
import { CuentaAhorros } from '../models/CuentaAhorros.js';
import { CuentaCorriente } from '../models/CuentaCorriente.js';
import { TarjetaCredito } from '../models/TarjetaCredito.js';

const productosService = {
  // Crear un ProductosCliente para un cliente existente
  crearProductosCliente(cliente) {
    if (!(cliente instanceof Cliente)) {
      throw new Error('Se requiere una instancia de Cliente');
    }
    return new ProductosCliente(cliente);
  },

  // Guardar productos de un cliente en localStorage
  guardarProductos(productosCliente) {
    if (!(productosCliente instanceof ProductosCliente)) {
      throw new Error('Se requiere una instancia de ProductosCliente');
    }

    const productos = this.getAllProductos();
    const index = productos.findIndex(p => p.cliente.id === productosCliente.cliente.id);

    if (index >= 0) {
      productos[index] = productosCliente;
    } else {
      productos.push(productosCliente);
    }

    localStorageService.guardarProductosClientes(productos);
  },

  // Obtener productos de un cliente por ID
  obtenerProductosCliente(clienteId) {
    const productos = this.getAllProductos();
    return productos.find(p => p.cliente.id === clienteId) || null;
  },

  // Obtener todos los productos (para administración)
  getAllProductos() {
    return localStorageService.obtenerProductosClientes() || [];
  },

  // Crear y agregar una cuenta de ahorros a un cliente
  crearCuentaAhorros(clienteId, numeroCuenta, saldo, fechaApertura, estado, tasaInteres) {
    const productosCliente = this.obtenerProductosCliente(clienteId);
    if (!productosCliente) {
      throw new Error('Cliente no encontrado');
    }

    const cuenta = new CuentaAhorros(numeroCuenta, saldo, fechaApertura, estado, tasaInteres);
    productosCliente.agregarCuenta(cuenta);
    this.guardarProductos(productosCliente);

    return cuenta;
  },

  // Crear y agregar una cuenta corriente a un cliente
  crearCuentaCorriente(clienteId, numeroCuenta, saldo, fechaApertura, estado, porcentajeSobregiro, limiteSobregiro) {
    const productosCliente = this.obtenerProductosCliente(clienteId);
    if (!productosCliente) {
      throw new Error('Cliente no encontrado');
    }

    const cuenta = new CuentaCorriente(numeroCuenta, saldo, fechaApertura, estado, porcentajeSobregiro, limiteSobregiro);
    productosCliente.agregarCuenta(cuenta);
    this.guardarProductos(productosCliente);

    return cuenta;
  },

  // Crear y agregar una tarjeta de crédito a un cliente
  crearTarjetaCredito(clienteId, numeroCuenta, saldo, fechaApertura, estado, cupo, deuda, numeroCuotas) {
    const productosCliente = this.obtenerProductosCliente(clienteId);
    if (!productosCliente) {
      throw new Error('Cliente no encontrado');
    }

    const tarjeta = new TarjetaCredito(numeroCuenta, saldo, fechaApertura, estado, cupo, deuda, numeroCuotas);
    productosCliente.agregarTarjeta(tarjeta);
    this.guardarProductos(productosCliente);

    return tarjeta;
  },

  // Obtener resumen de productos de un cliente
  obtenerResumenCliente(clienteId) {
    const productosCliente = this.obtenerProductosCliente(clienteId);
    return productosCliente ? productosCliente.obtenerResumen() : null;
  },

  // Listar todos los productos de un cliente
  listarProductosCliente(clienteId) {
    const productosCliente = this.obtenerProductosCliente(clienteId);
    if (!productosCliente) return { cuentas: [], tarjetas: [] };

    return {
      cuentas: productosCliente.listarCuentas(),
      tarjetas: productosCliente.listarTarjetas()
    };
  }
};

export default productosService;