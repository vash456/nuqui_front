import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';

const transferForm = document.querySelector('#transferForm');
const origenSelect = document.querySelector('#origenSelect');
const beneficiarioInput = document.querySelector('#beneficiario');
const destinoInput = document.querySelector('#destinoCuenta');
const montoInput = document.querySelector('#monto');
const descripcionInput = document.querySelector('#descripcion');
const messageBox = document.querySelector('#message');
const origenInfo = document.querySelector('#origenInfo');
const origenSeleccionado = document.querySelector('#origenSeleccionado');
const saldoOrigen = document.querySelector('#saldoOrigen');
const detalleOrigen = document.querySelector('#detalleOrigen');

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });
}

function getProductoLabel(producto) {
  if (!producto) return 'Producto no disponible';
  if (producto.constructor.name === 'TarjetaCredito') {
    return `Tarjeta de Crédito - ${producto.numeroCuenta}`;
  }
  const tipo = producto.constructor.name === 'CuentaCorriente' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
  return `${tipo} - ${producto.numeroCuenta}`;
}

function getProductoDetalle(producto) {
  if (!producto) return null;
  if (producto.constructor.name === 'TarjetaCredito') {
    const deuda = Number(producto.deuda) || 0;
    const cupo = Number(producto.cupo) || 0;
    const disponible = cupo - deuda;
    return {
      label: 'Deuda actual',
      value: formatCurrency(deuda),
      extra: `Cupo disponible: ${formatCurrency(disponible)}`
    };
  }

  return {
    label: 'Saldo disponible',
    value: formatCurrency(producto.saldo),
    extra: ''
  };
}

function mostrarMensaje(message, type = 'error') {
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.className = type === 'success' ? 'form-message success' : 'form-message error';
  messageBox.style.display = 'block';
}

function limpiarMensaje() {
  if (!messageBox) return;
  messageBox.textContent = '';
  messageBox.className = 'form-message';
  messageBox.style.display = 'none';
}

function actualizarInfoOrigen(producto) {
  if (!producto) {
    origenInfo.style.display = 'none';
    return;
  }

  const detalle = getProductoDetalle(producto);
  origenSeleccionado.textContent = getProductoLabel(producto);
  saldoOrigen.textContent = `${detalle.label}: ${detalle.value}`;
  detalleOrigen.textContent = detalle.extra;
  origenInfo.style.display = 'block';
}

function cargarOrigenes() {
  const currentUser = sesionService.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const productos = productosService.obtenerProductosCliente(currentUser.id);
  if (!productos) {
    mostrarMensaje('No se encontraron productos para este usuario');
    return;
  }

  const origenes = [...productos.listarCuentas(), ...productos.listarTarjetas()];
  if (origenes.length === 0) {
    mostrarMensaje('No tienes cuentas ni tarjetas disponibles para transferir');
    return;
  }

  origenes.forEach(producto => {
    const option = document.createElement('option');
    option.value = producto.numeroCuenta;
    option.textContent = getProductoLabel(producto);
    origenSelect.appendChild(option);
  });
}

function obtenerOrigenSeleccionado(numeroCuenta) {
  const currentUser = sesionService.getCurrentUser();
  if (!currentUser) return null;

  const productos = productosService.obtenerProductosCliente(currentUser.id);
  if (!productos) return null;

  return productos.obtenerCuenta(numeroCuenta) || productos.obtenerTarjeta(numeroCuenta);
}

function obtenerDestino(numeroCuenta) {
  const resultado = productosService.obtenerProductoPorNumeroCuenta(numeroCuenta);
  return resultado ? resultado.producto : null;
}

function obtenerPropietarioDestino(numeroCuenta) {
  const resultado = productosService.obtenerProductoPorNumeroCuenta(numeroCuenta);
  return resultado ? resultado.productosCliente : null;
}

document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
  cargarOrigenes();
});

origenSelect?.addEventListener('change', () => {
  const numeroCuenta = origenSelect.value;
  if (!numeroCuenta) {
    actualizarInfoOrigen(null);
    return;
  }

  const producto = obtenerOrigenSeleccionado(numeroCuenta);
  actualizarInfoOrigen(producto);
});

const logoutLink = document.querySelector('#logoutLink');
logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  uiService.manageLogoutLink();
});

transferForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  limpiarMensaje();

  const origenNumero = origenSelect?.value?.trim();
  const destinoNumero = destinoInput?.value?.trim();
  const beneficiario = beneficiarioInput?.value?.trim();
  const descripcion = descripcionInput?.value?.trim();
  const monto = Number(montoInput?.value);

  if (!origenNumero) {
    mostrarMensaje('Selecciona un origen para la transferencia');
    return;
  }

  if (!destinoNumero) {
    mostrarMensaje('Ingresa el número de cuenta o tarjeta de destino');
    return;
  }

  if (!beneficiario) {
    mostrarMensaje('Ingresa el nombre del beneficiario');
    return;
  }

  if (!Number.isFinite(monto) || monto <= 0) {
    mostrarMensaje('Ingresa un monto válido mayor a cero');
    return;
  }

  const currentUser = sesionService.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const productosUsuario = productosService.obtenerProductosCliente(currentUser.id);
  if (!productosUsuario) {
    mostrarMensaje('No se encontraron tus productos para realizar la transferencia');
    return;
  }

  const origen = productosUsuario.obtenerCuenta(origenNumero) || productosUsuario.obtenerTarjeta(origenNumero);
  if (!origen) {
    mostrarMensaje('No se encontró el origen seleccionado');
    return;
  }

  const destinoResultado = productosService.obtenerProductoPorNumeroCuenta(destinoNumero);
  if (!destinoResultado || !destinoResultado.producto) {
    mostrarMensaje('No se encontró el destino indicado');
    return;
  }

  let destino = destinoResultado.producto;
  let propietarioDestino = destinoResultado.productosCliente;

  if (propietarioDestino?.cliente?.id === currentUser.id) {
    const productoLocal = productosUsuario.obtenerCuenta(destinoNumero) || productosUsuario.obtenerTarjeta(destinoNumero);
    if (productoLocal) {
      destino = productoLocal;
      propietarioDestino = productosUsuario;
    }
  }

  if (destino.numeroCuenta === origen.numeroCuenta) {
    mostrarMensaje('No puedes transferir a la misma cuenta/tarjeta');
    return;
  }

  const resultado = origen.transferir(destino, monto);
  if (!resultado.success) {
    mostrarMensaje(resultado.message);
    return;
  }

  productosService.guardarProductos(productosUsuario);
  if (propietarioDestino && propietarioDestino.cliente.id !== currentUser.id) {
    productosService.guardarProductos(propietarioDestino);
  }

  mostrarMensaje('Transferencia realizada con éxito', 'success');
  setTimeout(() => {
    window.location.href = 'transferencia-exitosa.html';
  }, 1000);
});
