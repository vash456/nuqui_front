import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';

const pagarForm = document.querySelector('#pagarForm');
const tarjetaSelect = document.querySelector('#tarjetaSelect');
const montoInput = document.querySelector('#monto');
const tarjetaInfo = document.querySelector('#tarjetaInfo');
const deudaActual = document.querySelector('#deudaActual');
const cupoDisponible = document.querySelector('#cupoDisponible');
const messageBox = document.querySelector('#message');

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
});

// Cargar tarjetas del usuario
async function cargarTarjetas() {
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

        const tarjetas = productos.listarTarjetas();
        if (tarjetas.length === 0) {
            uiService.showMessage(messageBox, 'No tienes tarjetas disponibles');
            return;
        }

        // Llenar select con tarjetas
        tarjetas.forEach(tarjeta => {
            const option = document.createElement('option');
            option.value = tarjeta.numeroCuenta;
            option.textContent = `Tarjeta ${tarjeta.numeroCuenta}`;
            tarjetaSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error cargando tarjetas:', error);
        uiService.showMessage(messageBox, 'Error al cargar las tarjetas');
    }
}

// Obtener tarjeta seleccionada
function obtenerTarjetaSeleccionada() {
    const numeroCuenta = tarjetaSelect.value;
    if (!numeroCuenta) return null;

    try {
        const currentUser = sesionService.getCurrentUser();
        const productos = productosService.obtenerProductosCliente(currentUser.id);
        return productos.obtenerTarjeta(numeroCuenta);
    } catch (error) {
        console.error('Error obteniendo tarjeta:', error);
        return null;
    }
}

// Mostrar información de la tarjeta seleccionada
tarjetaSelect.addEventListener('change', () => {
    const tarjeta = obtenerTarjetaSeleccionada();
    
    if (!tarjeta) {
        tarjetaInfo.style.display = 'none';
        return;
    }

    try {
        deudaActual.textContent = formatCurrency(tarjeta.deuda);
        cupoDisponible.textContent = formatCurrency(tarjeta.cupo - tarjeta.deuda);
        tarjetaInfo.style.display = 'block';
    } catch (error) {
        console.error('Error obteniendo información de tarjeta:', error);
    }
});

function formatCurrency(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(number);
}

// Manejar pago
pagarForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    uiService.clearMessage(messageBox);

    const numeroCuenta = tarjetaSelect.value;
    const monto = parseFloat(montoInput.value);

    if (!numeroCuenta) {
        uiService.showMessage(messageBox, 'Selecciona una tarjeta');
        return;
    }

    if (!monto || monto <= 0) {
        uiService.showMessage(messageBox, 'Ingresa un monto válido');
        return;
    }

    try {
        const currentUser = sesionService.getCurrentUser();
        const productos = productosService.obtenerProductosCliente(currentUser.id);
        const tarjeta = productos.obtenerTarjeta(numeroCuenta);

        if (!tarjeta) {
            uiService.showMessage(messageBox, 'Tarjeta no encontrada');
            return;
        }

        const result = tarjeta.pagar(monto);

        if (!result.success) {
            uiService.showMessage(messageBox, result.message);
            return;
        }

        // Guardar cambios con el mismo objeto productos que tiene la tarjeta modificada
        productosService.guardarProductos(productos);

        uiService.showMessage(messageBox, `✓ ${result.message}`, 'success');

        // Actualizar información mostrada
        deudaActual.textContent = formatCurrency(result.data.nuevaDeuda);
        cupoDisponible.textContent = formatCurrency(tarjeta.cupo - result.data.nuevaDeuda);

        // Limpiar formulario
        montoInput.value = '';

    } catch (error) {
        console.error('Error en pago:', error);
        uiService.showMessage(messageBox, 'Error inesperado al procesar el pago');
    }
});

// Manejar logout
document.querySelector('#logoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    uiService.manageLogoutLink();
});

// Cargar tarjetas al iniciar
cargarTarjetas();