import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';

const consignarForm = document.querySelector('#consignarForm');
const cuentaSelect = document.querySelector('#cuentaSelect');
const montoInput = document.querySelector('#monto');
const cuentaInfo = document.querySelector('#cuentaInfo');
const saldoActual = document.querySelector('#saldoActual');
const messageBox = document.querySelector('#message');

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
});

// Cargar cuentas del usuario
async function cargarCuentas() {
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

        // Llenar select con cuentas
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

// Mostrar información de la cuenta seleccionada
cuentaSelect.addEventListener('change', () => {
    const numeroCuenta = cuentaSelect.value;
    if (!numeroCuenta) {
        cuentaInfo.style.display = 'none';
        return;
    }

    try {
        const currentUser = sesionService.getCurrentUser();
        const productos = productosService.obtenerProductosCliente(currentUser.id);
        const cuenta = productos.obtenerCuenta(numeroCuenta);

        if (cuenta) {
            saldoActual.textContent = cuenta.saldo.toFixed(2);
            cuentaInfo.style.display = 'block';
        }
    } catch (error) {
        console.error('Error obteniendo información de cuenta:', error);
    }
});

// Manejar consignación
consignarForm.addEventListener('submit', async (event) => {
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

        const result = cuenta.consignar(monto);

        if (!result.success) {
            uiService.showMessage(messageBox, result.message);
            return;
        }

        // Guardar cambios
        productosService.guardarProductos(productos);

        uiService.showMessage(messageBox, result.message, 'success');

        // Actualizar saldo mostrado
        saldoActual.textContent = result.data.nuevoSaldo.toFixed(2);

        // Limpiar formulario
        montoInput.value = '';

    } catch (error) {
        console.error('Error en consignación:', error);
        uiService.showMessage(messageBox, 'Error inesperado al procesar la consignación');
    }
});

// Manejar logout
document.querySelector('#logoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    uiService.manageLogoutLink();
});

// Cargar cuentas al iniciar
cargarCuentas();