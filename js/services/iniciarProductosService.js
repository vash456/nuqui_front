import productosService from './productosService.js';

const iniciarProductosService = {
  // Inicializar productos para un nuevo usuario
  inicializarProductosCliente(user) {
    if (!user || !user.id) {
      throw new Error('Usuario inválido para inicialización');
    }

    // Verificar si ya tiene productos
    const existingProductos = productosService.obtenerProductosCliente(user.id);
    if (existingProductos) {
      return existingProductos; // Ya está inicializado
    }

    // Crear ProductosCliente vacío para el usuario
    const productosCliente = productosService.crearProductosCliente(user);
    productosService.guardarProductos(productosCliente);

    return productosCliente;
  },

};

export default iniciarProductosService;