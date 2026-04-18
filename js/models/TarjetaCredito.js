import { Cuenta } from './Cuenta.js';
import { Movimiento } from './Movimiento.js';
import { TipoMovimiento } from './TipoMovimiento.js';
import localStorageService from '../storage/localstorage.js';

export class TarjetaCredito extends Cuenta {
  constructor(numeroCuenta, saldo, fechaApertura, estado, cupo, deuda, numeroCuotas) {
    super(numeroCuenta, Number(saldo) || 0, fechaApertura, estado);
    this.cupo = Number(cupo) || 0;
    this.deuda = Number(deuda) || 0;
    this.numeroCuotas = numeroCuotas;
  }

  comprar(monto, cuotas = 1) {
    const valor = Number(monto);
    const numCuotas = Number(cuotas);

    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto de compra debe ser mayor a cero' };
    }

    if (numCuotas <= 0) {
      return { success: false, message: 'El número de cuotas debe ser mayor a cero' };
    }

    if (this.deuda + valor > this.cupo) {
      return { success: false, message: 'Compra excede el cupo disponible' };
    }

    // Calcular tasa de interés según número de cuotas
    const tasaPorcentaje = this.calcularTasaCosto(numCuotas);

    // Calcular cuota mensual usando la fórmula de amortización
    const cuotaMensual = this.calcularCuotaMensual(valor, numCuotas, tasaPorcentaje);

    // Aumentar deuda
    this.deuda += valor;

    // Crear descripción detallada del movimiento
    const descripcion = numCuotas === 1
      ? `Compra de ${valor}`
      : `Compra de ${valor} en ${numCuotas} cuotas (Tasa: ${tasaPorcentaje}%, Cuota: $${cuotaMensual.toFixed(2)})`;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.COMPRA,
      valor,
      this.deuda,
      descripcion
    );

    // Agregar metadatos del movimiento para cálculos posteriores
    movimiento.cuotas = numCuotas;
    movimiento.tasaPorcentaje = tasaPorcentaje;
    movimiento.cuotaMensual = cuotaMensual;

    this.registrarMovimiento(movimiento);

    return {
      success: true,
      message: 'Compra realizada',
      data: {
        nuevaDeuda: this.deuda,
        cuotas: numCuotas,
        tasa: tasaPorcentaje,
        cuotaMensual: cuotaMensual
      }
    };
  }

  pagar(monto) {
    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto a pagar debe ser mayor a cero' };
    }
    if (valor > this.deuda) {
      return { success: false, message: 'El monto excede la deuda actual' };
    }
    this.deuda -= valor;

    const movimiento = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.PAGO,
      valor,
      this.deuda,
      `Pago de ${valor}`
    );
    this.registrarMovimiento(movimiento);

    return { success: true, message: 'Pago realizado', data: { nuevaDeuda: this.deuda } };
  }

  retirar(monto) {
    throw new Error('Metodo no implementado');
  }

  calcularCuotaMensual(capital, numCuotas, tasaMensualPorcentaje) {
    // Fórmula de amortización: Cuota = (Capital * tasa) / (1 - (1 + tasa)^-n)
    // Donde:
    // - capital: monto a financiar
    // - numCuotas: número de cuotas (n)
    // - tasaMensualPorcentaje: tasa mensual en porcentaje

    const capitalNum = Number(capital);
    const n = Number(numCuotas);
    const tasaPorcentaje = Number(tasaMensualPorcentaje);

    if (tasaPorcentaje === 0 || n === 0) {
      // Si la tasa es 0%, la cuota es simple división
      return capitalNum / n;
    }

    // Convertir tasa de porcentaje a decimal
    const r = tasaPorcentaje / 100;

    // Aplicar fórmula de amortización
    const cuota = (capitalNum * r) / (1 - Math.pow(1 + r, -n));

    return cuota;
  }

  // Calcular información de cuota sin hacer la compra (para validación previa)
  calcularDetallesCuota(monto, numCuotas) {
    const valor = Number(monto);
    const numCuotasNum = Number(numCuotas);

    const tasaPorcentaje = this.calcularTasaCosto(numCuotasNum);
    const cuotaMensual = this.calcularCuotaMensual(valor, numCuotasNum, tasaPorcentaje);

    return {
      tasa: tasaPorcentaje,
      cuotaMensual: cuotaMensual
    };
  }

  calcularTasaCosto(numCuotas) {
    // Retorna la tasa de interés mensual como porcentaje
    if (numCuotas >= 1 && numCuotas <= 2) {
      return 0; // 0%
    } else if (numCuotas >= 3 && numCuotas <= 6) {
      return 1.9; // 1.9%
    } else if (numCuotas >= 7) {
      return 2.3; // 2.3%
    }
    return 0; // Default
  }

  transferir(destino, monto) {
    const validacion = this.validarDestino(destino);
    if (!validacion.success) return validacion;

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      return { success: false, message: 'El monto de la transferencia debe ser mayor a cero' };
    }

    const disponible = this.cupo - this.deuda;
    if (valor > disponible) {
      return { success: false, message: 'Cupo insuficiente en la tarjeta de crédito' };
    }

    const destinoEsTarjeta = destino?.constructor?.name === 'TarjetaCredito';
    if (destinoEsTarjeta) {
      const deudaDestino = Number(destino.deuda) || 0;
      if (valor > deudaDestino) {
        return { success: false, message: 'El monto excede la deuda de la tarjeta destino' };
      }
    }

    this.deuda += valor;
    const movimientoSalida = new Movimiento(
      this.movimientos.length + 1,
      new Date(),
      TipoMovimiento.TRANSFERENCIA_OUT,
      valor,
      this.deuda,
      `Transferencia a ${destino.numeroCuenta}`
    );
    this.registrarMovimiento(movimientoSalida);

    if (destinoEsTarjeta) {
      destino.deuda -= valor;
      const movimientoEntrada = new Movimiento(
        destino.movimientos.length + 1,
        new Date(),
        TipoMovimiento.TRANSFERENCIA_IN,
        valor,
        destino.deuda,
        `Transferencia recibida de ${this.numeroCuenta}`
      );
      destino.registrarMovimiento(movimientoEntrada);
    } else {
      destino.saldo += valor;
      const movimientoEntrada = new Movimiento(
        destino.movimientos.length + 1,
        new Date(),
        TipoMovimiento.TRANSFERENCIA_IN,
        valor,
        destino.saldo,
        `Transferencia recibida de ${this.numeroCuenta}`
      );
      destino.registrarMovimiento(movimientoEntrada);
    }

    return { success: true, message: 'Transferencia realizada con éxito', data: { deuda: this.deuda } };
  }

  validarDestino(cuenta) {
    if (!cuenta || !cuenta.numeroCuenta) {
      return { success: false, message: 'Destino inválido para la transferencia' };
    }
    if (cuenta.numeroCuenta === this.numeroCuenta) {
      return { success: false, message: 'No se puede transferir a la misma tarjeta' };
    }
    if (!localStorageService.existeNumeroCuenta(cuenta.numeroCuenta)) {
      return { success: false, message: 'La cuenta destino no existe' };
    }
    return { success: true };
  }
}
