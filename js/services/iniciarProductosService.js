import productosService from './productosService.js';
import { CuentaAhorros } from '../models/CuentaAhorros.js';
import { CuentaCorriente } from '../models/CuentaCorriente.js';
import { TarjetaCredito } from '../models/TarjetaCredito.js';

const iniciarProductosService = {
  // Inicializar productos para un nuevo usuario
  inicializarProductosCliente(user) {
    if (!user || !user.id) {
      throw new Error('Usuario inválido para inicialización');
    }

    // Verificar si ya tiene productos
    const existingProductos = productosService.obtenerProductosCliente(user.id);
    if (existingProductos) {
      return existingProductos; // Ya está inicializado
    }

    // Crear ProductosCliente vacío para el usuario
    const productosCliente = productosService.crearProductosCliente(user);
    productosCliente.agregarCuenta(new CuentaAhorros(`AH-${Date.now()}-001`, 0, new Date().toISOString(), 'activa', 0.015));
    productosCliente.agregarCuenta(new CuentaCorriente(`CC-${Date.now()}-001`, 0, new Date().toISOString(), 'activa', 0.2, 500000));
    productosCliente.agregarTarjeta(new TarjetaCredito(`TC-${Date.now()}-001`, 0, new Date().toISOString(), 'activa', 3000000, 0, 12));
    productosService.guardarProductos(productosCliente);

    return productosCliente;
  },

};

export default iniciarProductosService;