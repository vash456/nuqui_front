import uiService from '../services/uiService.js';
import productosService from '../services/productosService.js';
import sesionService from '../services/sesionService.js';

const comprarForm = document.querySelector('#comprarForm');
const tarjetaSelect = document.querySelector('#tarjetaSelect');
const montoInput = document.querySelector('#monto');
const cuotasSelect = document.querySelector('#cuotas');
const tarjetaInfo = document.querySelector('#tarjetaInfo');
const cupoDisponible = document.querySelector('#cupoDisponible');
const tasaInteres = document.querySelector('#tasaInteres');
const cuotaMensual = document.querySelector('#cuotaMensual');
const tasaRow = document.querySelector('#tasaRow');
const cuotaRow = document.querySelector('#cuotaRow');
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

// Obtener tarjeta seleccionada (para cálculos previos sin guardar)
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

// Actualizar información de cuota cuando cambian cuotas o monto
function actualizarInformacionCuota() {
    const tarjeta = obtenerTarjetaSeleccionada();
    const monto = parseFloat(montoInput.value);
    const cuotas = parseInt(cuotasSelect.value);

    if (!tarjeta || !monto || monto <= 0) {
        tasaRow.style.display = 'none';
        cuotaRow.style.display = 'none';
        return;
    }

    try {
        const detalles = tarjeta.calcularDetallesCuota(monto, cuotas);
        
        if (cuotas === 1) {
            tasaRow.style.display = 'none';
            cuotaRow.style.display = 'none';
        } else {
            tasaInteres.textContent = `${detalles.tasa}%`;
            cuotaMensual.textContent = `$${detalles.cuotaMensual.toFixed(2)}`;
            tasaRow.style.display = 'flex';
            cuotaRow.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error calculando cuota:', error);
        tasaRow.style.display = 'none';
        cuotaRow.style.display = 'none';
    }
}

// Validar monto contra cupo disponible
function validarMonto() {
    const tarjeta = obtenerTarjetaSeleccionada();
    const monto = parseFloat(montoInput.value);

    if (!tarjeta || !monto) return;

    const cupoDisponibleNum = tarjeta.cupo - tarjeta.deuda;
    
    if (monto > cupoDisponibleNum) {
        montoInput.classList.add('input-error');
        uiService.showMessage(messageBox, `El monto excede el cupo disponible ($${cupoDisponibleNum.toFixed(2)})`);
    } else {
        montoInput.classList.remove('input-error');
        uiService.clearMessage(messageBox);
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
        cupoDisponible.textContent = `$${(tarjeta.cupo - tarjeta.deuda).toFixed(2)}`;
        tarjetaInfo.style.display = 'block';
        actualizarInformacionCuota();
    } catch (error) {
        console.error('Error obteniendo información de tarjeta:', error);
    }
});

// Actualizar información cuando cambia el monto
montoInput.addEventListener('input', () => {
    validarMonto();
    actualizarInformacionCuota();
});

// Actualizar información cuando cambian las cuotas
cuotasSelect.addEventListener('change', () => {
    actualizarInformacionCuota();
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

    if (!monto || monto <= 0) {
        uiService.showMessage(messageBox, 'Ingresa un monto válido');
        return;
    }

    try {
        const currentUser = sesionService.getCurrentUser();
        const productos = productosService.obtenerProductosCliente(currentUser.id);
        const tarjeta = productos.obtenerTarjeta(tarjetaSelect.value);

        if (!tarjeta) {
            uiService.showMessage(messageBox, 'Tarjeta no encontrada');
            return;
        }

        const result = tarjeta.comprar(monto, cuotas);

        if (!result.success) {
            uiService.showMessage(messageBox, result.message);
            return;
        }

        // Guardar cambios con el mismo objeto productos que tiene la tarjeta modificada
        productosService.guardarProductos(productos);

        // Construir mensaje de éxito con información de la cuota
        let mensajeExito = `✓ ${result.message}`;
        if (cuotas > 1) {
            mensajeExito += `\nCuotas: ${cuotas} | Tasa: ${result.data.tasa}% | Cuota: $${result.data.cuotaMensual.toFixed(2)}`;
        }
        
        uiService.showMessage(messageBox, mensajeExito, 'success');

        // Actualizar información mostrada
        cupoDisponible.textContent = `$${(tarjeta.cupo - result.data.nuevaDeuda).toFixed(2)}`;

        // Limpiar formulario
        montoInput.value = '';
        cuotasSelect.value = '1';
        montoInput.classList.remove('input-error');
        tasaRow.style.display = 'none';
        cuotaRow.style.display = 'none';

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