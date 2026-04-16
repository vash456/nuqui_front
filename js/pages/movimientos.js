import uiService from '../services/uiService.js';
import sesionService from '../services/sesionService.js';
import productosService from '../services/productosService.js';
import { TipoMovimiento } from '../models/TipoMovimiento.js';

const searchInput = document.querySelector('.search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const movementsList = document.querySelector('#movementsList');
const noMovements = document.querySelector('#noMovements');
const summaryIncome = document.querySelector('#summaryIncome');
const summaryExpense = document.querySelector('#summaryExpense');
const summaryBalance = document.querySelector('#summaryBalance');

let allMovements = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!uiService.checkSession()) return;
  initializeMovementsPage();
});

function initializeMovementsPage() {
  cargarMovimientos();
  searchInput.addEventListener('input', renderMovements);
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderMovements();
    });
  });

  const logoutLink = document.querySelector('#logoutLink');
  logoutLink?.addEventListener('click', event => {
    event.preventDefault();
    uiService.manageLogoutLink();
  });
}

function cargarMovimientos() {
  const currentUser = sesionService.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const productos = productosService.obtenerProductosCliente(currentUser.id);
  if (!productos) {
    allMovements = [];
    renderMovements();
    return;
  }

  const cuentas = productos.listarCuentas();
  const tarjetas = productos.listarTarjetas();

  const movimientos = [];

  cuentas.forEach(cuenta => {
    const accountType = cuenta.constructor.name === 'CuentaCorriente' ? 'cuenta-corriente' : 'cuenta-ahorros';
    const accountLabel = cuenta.constructor.name === 'CuentaCorriente' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';

    (cuenta.movimientos ?? []).forEach(mov => {
      movimientos.push({
        ...mov,
        accountType,
        accountLabel,
        accountNumber: cuenta.numeroCuenta,
        isExpense: mov.tipo === 'RETIRO' || mov.tipo === 'TRANSFERENCIA_OUT',
        isIncome: mov.tipo === 'CONSIGNACION' || mov.tipo === 'TRANSFERENCIA_IN'
      });
    });
  });

  tarjetas.forEach(tarjeta => {
    (tarjeta.movimientos ?? []).forEach(mov => {
      movimientos.push({
        ...mov,
        accountType: 'tarjeta-credito',
        accountLabel: 'Tarjeta de Crédito',
        accountNumber: tarjeta.numeroCuenta,
        isExpense: mov.tipo === 'RETIRO' || mov.tipo === 'TRANSFERENCIA_OUT',
        isIncome: mov.tipo === 'CONSIGNACION' || mov.tipo === 'TRANSFERENCIA_IN'
      });
    });
  });

  allMovements = movimientos.sort((a, b) => {
    const dateA = new Date(a.fechaHora);
    const dateB = new Date(b.fechaHora);
    return dateB - dateA;
  });

  renderMovements();
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2
  });
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function renderMovements() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

  const filtered = allMovements.filter(movement => {
    const matchesFilter = activeFilter === 'all' || movement.accountType === activeFilter;
    const text = `${movement.descripcion || ''} ${movement.accountLabel || ''} ${movement.accountNumber || ''}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  movementsList.innerHTML = '';

  if (filtered.length === 0) {
    noMovements.style.display = 'block';
  } else {
    noMovements.style.display = 'none';
  }

  let totalIncome = 0;
  let totalExpense = 0;

  filtered.forEach(movement => {
    const isExpense = movement.isExpense;
    const iconClass = isExpense ? 'fa-minus' : 'fa-plus';
    const item = document.createElement('div');
    item.className = 'movement-item';
    item.innerHTML = `
      <div class="movement-icon ${isExpense ? 'expense' : 'income'}">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="movement-details">
        <h3 class="movement-name">${movement.descripcion || 'Movimiento'}</h3>
        <p class="movement-date">${formatDate(movement.fechaHora)} ${formatTime(movement.fechaHora)} • ${movement.accountLabel}</p>
        <p class="movement-account">Cuenta: ${movement.accountNumber}</p>
      </div>
      <div class="movement-amount ${isExpense ? 'expense-text' : 'income-text'}">
        ${isExpense ? '-' : '+'}${formatCurrency(movement.valor)}
      </div>
    `;

    movementsList.appendChild(item);

    if (movement.isIncome) totalIncome += Number(movement.valor) || 0;
    if (movement.isExpense) totalExpense += Number(movement.valor) || 0;
  });

  summaryIncome.textContent = formatCurrency(totalIncome);
  summaryExpense.textContent = formatCurrency(totalExpense);
  summaryBalance.textContent = formatCurrency(totalIncome - totalExpense);
}
