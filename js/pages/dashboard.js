import uiService from '../services/uiService.js';
import sesionService from '../services/sesionService.js';
import productosService from '../services/productosService.js';
import iniciarProductosService from '../services/iniciarProductosService.js';

// Validar sesión y cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  if (!uiService.checkSession()) return;
  cargarDatosDashboard();
});

// Selectores del DOM
const eyeIcon = document.querySelector('.eye-icon');
const balanceAmount = document.querySelector('.balance-info h2');
const creditCard = document.querySelector('.accounts-grid .account-card:nth-child(1)');
const checkingCard = document.querySelector('.accounts-grid .account-card:nth-child(2)');
const savingsCard = document.querySelector('.accounts-grid .account-card:nth-child(3)');
const logoutLink = document.querySelector('#logoutLink');

let balanceVisible = true;
let originalBalance = balanceAmount?.textContent || '$0.00';
let originalAmounts = Array.from(document.querySelectorAll('.account-card .amount')).map(el => el.textContent);

// Manejar cierre de sesión
logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  uiService.manageLogoutLink();
});

// Funcionalidad para ocultar/mostrar balance
eyeIcon?.addEventListener('click', () => {
  if (balanceVisible) {
    // Ocultar balance
    balanceAmount.textContent = '*****';
    originalAmounts.forEach((_, index) => {
      const amount = document.querySelectorAll('.account-card .amount')[index];
      if (amount) amount.textContent = '*****';
    });
    eyeIcon.className = 'fas fa-eye-slash eye-icon';
  } else {
    // Mostrar balance
    balanceAmount.textContent = originalBalance;
    Array.from(document.querySelectorAll('.account-card .amount')).forEach((el, index) => {
      el.textContent = originalAmounts[index] || '*****';
    });
    eyeIcon.className = 'far fa-eye eye-icon';
  }
  balanceVisible = !balanceVisible;
});

function formatCurrency(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(number);
}

function setText(element, text) {
  if (!element) return;
  element.textContent = text;
}

function cargarDatosDashboard() {
  const currentUser = sesionService.getCurrentUser();
  if (!currentUser) return;

  const clientNameElement = document.querySelector('.client-name');
  setText(clientNameElement, `Bienvenido, ${currentUser.nombreCompleto || currentUser.usuario || 'Cliente'}`);

  let productosCliente = productosService.obtenerProductosCliente(currentUser.id);
  if (!productosCliente) {
    productosCliente = iniciarProductosService.inicializarProductosCliente(currentUser);
  }

  const cuentas = productosCliente.cuentas ?? [];
  const tarjetas = productosCliente.tarjetas ?? [];

  const cuentaAhorros = cuentas.find(c => 'tasaInteres' in c) || null;
  const cuentaCorriente = cuentas.find(c => 'limiteSobregiro' in c || 'porcentajeSobregiro' in c) || null;
  const tarjetaCredito = tarjetas.find(t => t && 'cupo' in t && 'deuda' in t) || null;

  const totalSaldo = (Number(cuentaAhorros?.saldo) || 0) + (Number(cuentaCorriente?.saldo) || 0);
  setText(balanceAmount, formatCurrency(totalSaldo));

  if (creditCard) {
    setText(creditCard.querySelector('.card-number'), tarjetaCredito?.numeroCuenta || 'No disponible');
    setText(creditCard.querySelector('.amount'), tarjetaCredito ? formatCurrency(tarjetaCredito.deuda) : '$0.00');
    const badge = creditCard.querySelector('.badge');
    if (badge) {
      if (tarjetaCredito) {
        const disponible = (Number(tarjetaCredito.cupo) || 0) - (Number(tarjetaCredito.deuda) || 0);
        badge.textContent = `Disponible: ${formatCurrency(disponible)}`;
      } else {
        badge.textContent = 'Disponible: $0.00';
      }
    }
  }

  if (checkingCard) {
    setText(checkingCard.querySelector('.card-number'), cuentaCorriente?.numeroCuenta || 'No disponible');
    setText(checkingCard.querySelector('.amount'), cuentaCorriente ? formatCurrency(cuentaCorriente.saldo) : '$0.00');
  }

  if (savingsCard) {
    setText(savingsCard.querySelector('.card-number'), cuentaAhorros?.numeroCuenta || 'No disponible');
    setText(savingsCard.querySelector('.amount'), cuentaAhorros ? formatCurrency(cuentaAhorros.saldo) : '$0.00');
    const badge = savingsCard.querySelector('.badge');
    if (badge) {
      badge.textContent = cuentaAhorros ? `Interés Anual: ${Number(cuentaAhorros.tasaInteres || 0).toFixed(2)}%` : 'Interés Anual: 0.00%';
    }
  }

  originalBalance = balanceAmount?.textContent || originalBalance;
  originalAmounts = Array.from(document.querySelectorAll('.account-card .amount')).map(el => el.textContent);
}
