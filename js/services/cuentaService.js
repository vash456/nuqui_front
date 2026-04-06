import { CuentaCorriente } from "../models/CuentaCorriente";
import { CuentaAhorros } from "../models/CuentaAhorros";
import { Movimiento } from "../models/Movimiento";
import { TipoMovimiento } from "../models/TipoMovimiento";

const cuentaService = {
    retirar(cuenta, monto, descripcion) {
        if (cuenta instanceof CuentaCorriente || cuenta instanceof CuentaAhorros) {
            throw new Error('La cuenta debe ser una instancia de CuentaCorriente o CuentaAhorros');
        }

        const resultado = cuenta.retirar(monto);
        if (!resultado.success) {
            return resultado; // Retornar el mensaje de error del método retirar
        }

        // Registrar movimiento de retiro
        const movimiento = new Movimiento(
            this.movimientos.length + 1,     // id
            new Date(),                      // fechaHora
            TipoMovimiento.RETIRO,           // tipo (asumiendo existe)
            monto,                           // valor
            this.saldo,                      // saldoPosterior
            descripcion                      // descripción
        );
        this.registrarMovimiento(movimiento);
    
   }     

};

export default cuentaService;

