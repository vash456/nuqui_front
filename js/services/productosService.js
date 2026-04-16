import localStorageService from '../storage/localstorage.js';
import { ProductosCliente } from '../models/ProductosCliente.js';
import { Cliente } from '../models/Cliente.js';
import { CuentaAhorros } from '../models/CuentaAhorros.js';
import { CuentaCorriente } from '../models/CuentaCorriente.js';
import { TarjetaCredito } from '../models/TarjetaCredito.js';

const productosService = {
  crearProductosCliente(cliente) {
    if (!(cliente instanceof Cliente)) {
      throw new Error('Se requiere una instancia de Cliente');
    }
    return new ProductosCliente(cliente);
  },

  construirCliente(clienteData) {
    if (!clienteData) return null;
    return new Cliente(
      clienteData.id,
      clienteData.identificacion,
      clienteData.nombreCompleto,
      clienteData.celular,
      clienteData.usuario,
      clienteData.email,
      clienteData.fechaNacimiento,
      clienteData.contrasena
    );
  },

  construirCuenta(cuentaData) {
    if (!cuentaData) return null;

    if (cuentaData.cupo !== undefined && cuentaData.deuda !== undefined) {
      const tarjeta = new TarjetaCredito(
        cuentaData.numeroCuenta,
        cuentaData.saldo,
        cuentaData.fechaApertura,
        cuentaData.estado,
        cuentaData.cupo,
        cuentaData.deuda,
        cuentaData.numeroCuotas
      );
      tarjeta.movimientos = cuentaData.movimientos ?? [];
      return tarjeta;
    }

    if (cuentaData.tasaInteres !== undefined) {
      const ahorro = new CuentaAhorros(
        cuentaData.numeroCuenta,
        cuentaData.saldo,
        cuentaData.fechaApertura,
        cuentaData.estado,
        cuentaData.tasaInteres
      );
      ahorro.movimientos = cuentaData.movimientos ?? [];
      return ahorro;
    }

    if (cuentaData.limiteSobregiro !== undefined || cuentaData.porcentajeSobregiro !== undefined) {
      const corriente = new CuentaCorriente(
        cuentaData.numeroCuenta,
        cuentaData.saldo,
        cuentaData.fechaApertura,
        cuentaData.estado,
        cuentaData.porcentajeSobregiro,
        cuentaData.limiteSobregiro
      );
      corriente.movimientos = cuentaData.movimientos ?? [];
      return corriente;
    }

    return null;
  },

  construirProductosCliente(productosData) {
    if (!productosData) return null;

    const cliente = this.construirCliente(productosData.cliente);
    if (!cliente) return null;

    const productosCliente = new ProductosCliente(cliente);

    (productosData.cuentas ?? []).forEach(cuentaData => {
      const cuenta = this.construirCuenta(cuentaData);
      if (cuenta) productosCliente.agregarCuenta(cuenta);
    });

    (productosData.tarjetas ?? []).forEach(tarjetaData => {
      const tarjeta = this.construirCuenta(tarjetaData);
      if (tarjeta) productosCliente.agregarTarjeta(tarjeta);
    });

    return productosCliente;
  },

  guardarProductos(productosCliente) {
    if (!productosCliente || !productosCliente.cliente) {
      throw new Error('Se requiere un ProductosCliente válido para guardar');
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

  obtenerProductosCliente(clienteId) {
    const productos = this.getAllProductos();
    return productos.find(p => p.cliente.id === clienteId) || null;
  },

  obtenerProductoPorNumeroCuenta(numeroCuenta) {
    if (!numeroCuenta) return null;

    const productos = this.getAllProductos();
    for (const productosCliente of productos) {
      const cuenta = productosCliente.obtenerCuenta(numeroCuenta);
      if (cuenta) {
        return { producto: cuenta, productosCliente };
      }

      const tarjeta = productosCliente.obtenerTarjeta(numeroCuenta);
      if (tarjeta) {
        return { producto: tarjeta, productosCliente };
      }
    }

    return null;
  },

  getAllProductos() {
    const rawProductos = localStorageService.obtenerProductosClientes() ?? [];
    return rawProductos
      .map(productosData => this.construirProductosCliente(productosData))
      .filter(Boolean);
  },

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

  obtenerResumenCliente(clienteId) {
    const productosCliente = this.obtenerProductosCliente(clienteId);
    return productosCliente ? productosCliente.obtenerResumen() : null;
  },

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
