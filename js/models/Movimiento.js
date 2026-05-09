import { TipoMovimiento } from './TipoMovimiento.js';
import { roundMoney } from '../utils/money.js';

export class Movimiento {
  constructor(id, fechaHora, tipo, valor, saldoPosterior, descripcion) {
    this.id = id;
    this.fechaHora = fechaHora;
    this.tipo = tipo;
    this.valor = roundMoney(valor);
    this.saldoPosterior = roundMoney(saldoPosterior);
    this.descripcion = descripcion;
  }
}
