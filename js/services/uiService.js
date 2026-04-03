const uiService = {
  showMessage(element, message, type = 'error') {
    if (!element) return;
    element.textContent = message;
    element.className = type === 'success' ? 'form-message success' : 'form-message error';
  },

  clearMessage(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'form-message';
  },

  showLoading(button, text = 'Cargando...') {
    if (!button) return;
    button.disabled = true;
    button.textContent = text;
  },

  hideLoading(button, originalText = 'Enviar') {
    if (!button) return;
    button.disabled = false;
    button.textContent = originalText;
  },
};

export default uiService;