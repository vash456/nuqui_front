import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';
import cuentaService from '../services/cuentaService.js';

const retirarForm = document.querySelector('#retirarForm');
const cuentaSelect = document.querySelector('#cuentaSelect');
const montoInput = document.querySelector('#monto');
const cuentaInfo = document.querySelector('#cuentaInfo');
const cuentaSeleccionada = document.querySelector('#cuentaSeleccionada');
const saldoDisponible = document.querySelector('#saldoDisponible');
const messageBox = document.querySelector('#message');

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
});

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });
}

function getCuentaLabel(cuenta) {
  if (!cuenta) return 'Cuenta no disponible';
  const tipo = cuenta.constructor.name === 'CuentaCorriente' ? 'Cuenta Corriente' : 'Cuenta Ahorros';
  return `${tipo} - ${cuenta.numeroCuenta}`;
}

function actualizarInfoCuenta(cuenta) {
  if (!cuenta) {
    cuentaInfo.style.display = 'none';
    return;
  }

  cuentaSeleccionada.textContent = getCuentaLabel(cuenta);
  saldoDisponible.textContent = formatCurrency(cuentaService.obtenerSaldoDisponible(cuenta));
  cuentaInfo.style.display = 'block';
}

function cargarCuentas() {
  try {
    const currentUser = sesionService.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }

    const productos = productosService.obtenerProductosCliente(currentUser.id);
    if (!productos) {
      uiService.showMessage(messageBox, 'No se encontraron productos para este usuario');
      return;
    }

    const cuentas = productos.listarCuentas();
    if (cuentas.length === 0) {
      uiService.showMessage(messageBox, 'No tienes cuentas disponibles');
      return;
    }

    cuentas.forEach(cuenta => {
      const option = document.createElement('option');
      option.value = cuenta.numeroCuenta;
      option.textContent = `${cuenta.constructor.name} - ${cuenta.numeroCuenta}`;
      cuentaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando cuentas:', error);
    uiService.showMessage(messageBox, 'Error al cargar las cuentas');
  }
}

cuentaSelect.addEventListener('change', () => {
  const numeroCuenta = cuentaSelect.value;
  if (!numeroCuenta) {
    actualizarInfoCuenta(null);
    return;
  }

  try {
    const currentUser = sesionService.getCurrentUser();
    const productos = productosService.obtenerProductosCliente(currentUser.id);
    const cuenta = productos.obtenerCuenta(numeroCuenta);
    actualizarInfoCuenta(cuenta);
  } catch (error) {
    console.error('Error obteniendo información de cuenta:', error);
    actualizarInfoCuenta(null);
  }
});

retirarForm.addEventListener('submit', (event) => {
  event.preventDefault();
  uiService.clearMessage(messageBox);

  const numeroCuenta = cuentaSelect.value;
  const monto = parseFloat(montoInput.value);

  if (!numeroCuenta) {
    uiService.showMessage(messageBox, 'Selecciona una cuenta');
    return;
  }

  try {
    const currentUser = sesionService.getCurrentUser();
    const productos = productosService.obtenerProductosCliente(currentUser.id);
    const cuenta = productos.obtenerCuenta(numeroCuenta);

    if (!cuenta) {
      uiService.showMessage(messageBox, 'Cuenta no encontrada');
      return;
    }

    const result = cuentaService.retirar(cuenta, monto);
    if (!result.success) {
      uiService.showMessage(messageBox, result.message);
      return;
    }

    productosService.guardarProductos(productos);
    uiService.showMessage(messageBox, result.message, 'success');
    actualizarInfoCuenta(cuenta);
    montoInput.value = '';
  } catch (error) {
    console.error('Error en retiro:', error);
    uiService.showMessage(messageBox, 'Error inesperado al procesar el retiro');
  }
});

// Manejar logout
document.querySelector('#logoutLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  uiService.manageLogoutLink();
});

cargarCuentas();
