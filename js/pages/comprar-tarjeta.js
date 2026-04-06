import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';

const comprarForm = document.querySelector('#comprarForm');
const tarjetaSelect = document.querySelector('#tarjetaSelect');
const montoInput = document.querySelector('#monto');
const cuotasSelect = document.querySelector('#cuotas');
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

// Mostrar información de la tarjeta seleccionada
tarjetaSelect.addEventListener('change', () => {
    const numeroCuenta = tarjetaSelect.value;
    if (!numeroCuenta) {
        tarjetaInfo.style.display = 'none';
        return;
    }

    try {
        const currentUser = sesionService.getCurrentUser();
        const productos = productosService.obtenerProductosCliente(currentUser.id);
        const tarjeta = productos.obtenerTarjeta(numeroCuenta);

        if (tarjeta) {
            deudaActual.textContent = tarjeta.deuda.toFixed(2);
            cupoDisponible.textContent = (tarjeta.cupo - tarjeta.deuda).toFixed(2);
            tarjetaInfo.style.display = 'block';
        }
    } catch (error) {
        console.error('Error obteniendo información de tarjeta:', error);
    }
});

// Manejar compra
comprarForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    uiService.clearMessage(messageBox);

    const numeroCuenta = tarjetaSelect.value;
    const monto = parseFloat(montoInput.value);
    const cuotas = parseInt(cuotasSelect.value);

    if (!numeroCuenta) {
        uiService.showMessage(messageBox, 'Selecciona una tarjeta');
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

        const result = tarjeta.comprar(monto, cuotas);

        if (!result.success) {
            uiService.showMessage(messageBox, result.message);
            return;
        }

        // Guardar cambios
        productosService.guardarProductos(productos);

        uiService.showMessage(messageBox, result.message, 'success');

        // Actualizar información mostrada
        deudaActual.textContent = result.data.nuevaDeuda.toFixed(2);
        cupoDisponible.textContent = (tarjeta.cupo - result.data.nuevaDeuda).toFixed(2);

        // Limpiar formulario
        montoInput.value = '';
        cuotasSelect.value = '1';

    } catch (error) {
        console.error('Error en compra:', error);
        uiService.showMessage(messageBox, 'Error inesperado al procesar la compra');
    }
});

// Manejar logout
document.querySelector('#logoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    uiService.manageLogoutLink();
});

// Cargar tarjetas al iniciar
cargarTarjetas();