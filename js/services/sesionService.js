import localStorageService from '../storage/localstorage.js';

const sesionService = {
    getUserForSession(user) {
        return {
          id: user.id,
          nombreCompleto: user.nombreCompleto,
          identificacion: user.identificacion,
          usuario: user.usuario,
          email: user.email,
          celular: user.celular,
        };
      },
    
      getCurrentUser() {
        return localStorageService.getCurrentSession();
      },
    
      saveSession(user) {
        const safeUser = this.getUserForSession(user);
        localStorageService.saveSession(safeUser);
      },
    
      clearSession(userId) {
        localStorageService.clearSession(userId);
      },
};

export default sesionService;