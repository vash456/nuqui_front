import uiService from '../services/uiService.js';

// Validar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  uiService.checkSession();
});

// Manejar cierre de sesión
const logoutLink = document.querySelector('#logoutLink');
logoutLink?.addEventListener('click', event => {
  event.preventDefault();
  uiService.manageLogoutLink();
});

/* =========================================
   FUNCIONALIDAD DE MOVIMIENTOS
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchInput = document.querySelector('.search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const movementItems = document.querySelectorAll('.movement-item');

    // Datos de movimientos (simulado)
    const movimientosData = [
        {
            id: 1,
            name: 'Supermercado Central',
            date: '11 Mar 2025',
            type: 'Crédito',
            amount: '€125.50',
            category: 'tarjeta-credito',
            isExpense: true
        },
        {
            id: 2,
            name: 'Netflix Suscripción',
            date: '10 Mar 2025',
            type: 'Crédito',
            amount: '€15.99',
            category: 'tarjeta-credito',
            isExpense: true
        },
        {
            id: 3,
            name: 'Gasolinera Shell',
            date: '10 Mar 2025',
            type: 'Crédito',
            amount: '€65.00',
            category: 'tarjeta-credito',
            isExpense: true
        },
        {
            id: 4,
            name: 'Devolución Compra Online',
            date: '09 Mar 2025',
            type: 'Crédito',
            amount: '€99.99',
            category: 'cuenta-corriente',
            isExpense: false
        },
        {
            id: 5,
            name: 'Restaurante La Estrella',
            date: '11 Mar 2025',
            type: 'Crédito',
            amount: '€75.30',
            category: 'tarjeta-credito',
            isExpense: true
        }
    ];

    // Filtrar movimientos
    function filterMovements() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

        movementItems.forEach(item => {
            const name = item.querySelector('.movement-name').textContent.toLowerCase();
            const matchesSearch = name.includes(searchTerm);
            
            // Determinar la categoría (puede mejorarse con atributos data)
            let matchesFilter = activeFilter === 'all';
            
            if (activeFilter === 'cuenta-corriente') {
                matchesFilter = item.querySelector('.movement-name').textContent === 'Devolución Compra Online';
            } else if (activeFilter === 'tarjeta-credito') {
                matchesFilter = item.querySelector('.movement-name').textContent !== 'Devolución Compra Online';
            }

            if (matchesSearch && matchesFilter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Eventos de búsqueda
    searchInput.addEventListener('keyup', filterMovements);
    searchInput.addEventListener('change', filterMovements);

    // Eventos de filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterMovements();
        });
    });
});
