import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';
import { roundMoney } from '../utils/money.js';

const pagarForm = document.querySelector('#pagarForm');
const tarjetaSelect = document.querySelector('#tarjetaSelect');
const cuentaSelect = document.querySelector('#cuentaSelect');
const montoInput = document.querySelector('#monto');
const tarjetaInfo = document.querySelector('#tarjetaInfo');
const cuentaInfo = document.querySelector('#cuentaInfo');
const tarjetaSeleccionada = document.querySelector('#tarjetaSeleccionada');
const cuentaSeleccionada = document.querySelector('#cuentaSeleccionada');
const deudaActual = document.querySelector('#deudaActual');
const cupoDisponible = document.querySelector('#cupoDisponible');
const saldoCuenta = document.querySelector('#saldoCuenta');
const messageBox = document.querySelector('#message');

document.addEventListener('DOMContentLoaded', () => {
  if (!uiService.checkSession()) return;
  cargarProductosPago();
});

function formatCurrency(value) {
  const number = roundMoney(value);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(number);
}

function getCuentaLabel(cuenta) {
  if (!cuenta) return 'Cuenta no disponible';
  const tipo = cuenta.constructor.name === 'CuentaCorriente' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
  return `${tipo} - ${cuenta.numeroCuenta}`;
}

function getTarjetaLabel(tarjeta) {
  return tarjeta ? `Tarjeta de Crédito - ${tarjeta.numeroCuenta}` : 'Tarjeta no disponible';
}

function getSaldoDisponible(cuenta) {
  if (!cuenta) return 0;
  if (cuenta.constructor.name === 'CuentaCorriente') {
    return roundMoney(Number(cuenta.saldo) + Number(cuenta.calcularLimiteSobregiro()));
  }
  return roundMoney(cuenta.saldo);
}

function obtenerProductosUsuario() {
  const currentUser = sesionService.getCurrentUser();
  if (!currentUser) return null;
  return productosService.obtenerProductosCliente(currentUser.id);
}

function obtenerTarjetaSeleccionada(productos = obtenerProductosUsuario()) {
  const numeroTarjeta = tarjetaSelect?.value;
  if (!productos || !numeroTarjeta) return null;
  return productos.obtenerTarjeta(numeroTarjeta);
}

function obtenerCuentaSeleccionada(productos = obtenerProductosUsuario()) {
  const numeroCuenta = cuentaSelect?.value;
  if (!productos || !numeroCuenta) return null;
  return productos.obtenerCuenta(numeroCuenta);
}

function actualizarInfoTarjeta(tarjeta) {
  if (!tarjeta) {
    tarjetaInfo.style.display = 'none';
    return;
  }

  tarjetaSeleccionada.textContent = getTarjetaLabel(tarjeta);
  deudaActual.textContent = formatCurrency(tarjeta.deuda);
  cupoDisponible.textContent = formatCurrency(tarjeta.cupo - tarjeta.deuda);
  tarjetaInfo.style.display = 'block';
}

function actualizarInfoCuenta(cuenta) {
  if (!cuenta) {
    cuentaInfo.style.display = 'none';
    return;
  }

  cuentaSeleccionada.textContent = getCuentaLabel(cuenta);
  saldoCuenta.textContent = formatCurrency(getSaldoDisponible(cuenta));
  cuentaInfo.style.display = 'block';
}

function cargarProductosPago() {
  try {
    const productos = obtenerProductosUsuario();
    if (!productos) {
      uiService.showMessage(messageBox, 'No se encontraron productos para este usuario');
      return;
    }

    const tarjetas = productos.listarTarjetas();
    const cuentas = productos.listarCuentas();

    if (tarjetas.length === 0) {
      uiService.showMessage(messageBox, 'No tienes tarjetas disponibles');
    }

    if (cuentas.length === 0) {
      uiService.showMessage(messageBox, 'No tienes cuentas disponibles para realizar pagos');
    }

    tarjetas.forEach(tarjeta => {
      const option = document.createElement('option');
      option.value = tarjeta.numeroCuenta;
      option.textContent = getTarjetaLabel(tarjeta);
      tarjetaSelect.appendChild(option);
    });

    cuentas.forEach(cuenta => {
      const option = document.createElement('option');
      option.value = cuenta.numeroCuenta;
      option.textContent = getCuentaLabel(cuenta);
      cuentaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando productos para pago:', error);
    uiService.showMessage(messageBox, 'Error al cargar los productos');
  }
}

tarjetaSelect?.addEventListener('change', () => {
  actualizarInfoTarjeta(obtenerTarjetaSeleccionada());
});

cuentaSelect?.addEventListener('change', () => {
  actualizarInfoCuenta(obtenerCuentaSeleccionada());
});

pagarForm?.addEventListener('submit', event => {
  event.preventDefault();
  uiService.clearMessage(messageBox);

  const numeroTarjeta = tarjetaSelect?.value;
  const numeroCuenta = cuentaSelect?.value;
  const monto = roundMoney(montoInput?.value);

  if (!numeroTarjeta) {
    uiService.showMessage(messageBox, 'Selecciona una tarjeta');
    return;
  }

  if (!numeroCuenta) {
    uiService.showMessage(messageBox, 'Selecciona la cuenta desde donde pagarás');
    return;
  }

  if (!Number.isFinite(monto) || monto <= 0) {
    uiService.showMessage(messageBox, 'Ingresa un monto válido');
    return;
  }

  try {
    const productos = obtenerProductosUsuario();
    const tarjeta = obtenerTarjetaSeleccionada(productos);
    const cuenta = obtenerCuentaSeleccionada(productos);

    if (!tarjeta) {
      uiService.showMessage(messageBox, 'Tarjeta no encontrada');
      return;
    }

    if (!cuenta) {
      uiService.showMessage(messageBox, 'Cuenta no encontrada');
      return;
    }

    const result = tarjeta.pagarDesdeCuenta(cuenta, monto);
    if (!result.success) {
      uiService.showMessage(messageBox, result.message);
      return;
    }

    productosService.guardarProductos(productos);

    uiService.showMessage(messageBox, `✓ ${result.message}`, 'success');
    actualizarInfoTarjeta(tarjeta);
    actualizarInfoCuenta(cuenta);
    montoInput.value = '';
  } catch (error) {
    console.error('Error en pago:', error);
    uiService.showMessage(messageBox, 'Error inesperado al procesar el pago');
  }
});

document.querySelector('#logoutLink')?.addEventListener('click', event => {
  event.preventDefault();
  uiService.manageLogoutLink();
});
