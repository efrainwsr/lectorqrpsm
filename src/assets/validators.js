export function validateFields(obj, fields) {
    for (const field of fields) {
        if (!obj[field]) {
            return obj[field];
        }
    }
    return true;
}


function validarArrayDeObjetos(arrayDatos, reglas) {
  const resultadosValidacion = [];

  for (let i = 0; i < arrayDatos.length; i++) {
    const datos = arrayDatos[i];
    const errores = {};

    for (let propiedad in reglas) {
      if (reglas.hasOwnProperty(propiedad)) {
        const regla = reglas[propiedad];

        if (regla.required && (datos[propiedad] === undefined || datos[propiedad] === null)) {
          errores[propiedad] = `Error: ${propiedad} es obligatorio.`;
        } else if (regla.tipo === 'string' && typeof datos[propiedad] !== 'string') {
          errores[propiedad] = `Error: ${propiedad} debe ser una cadena de texto.`;
        } else if (regla.tipo === 'number' && typeof datos[propiedad] !== 'number') {
          errores[propiedad] = `Error: ${propiedad} debe ser un número.`;
        } else if (regla.pattern && !regla.pattern.test(datos[propiedad])) {
          errores[propiedad] = `Error: ${propiedad} no cumple con el patrón establecido.`;
        }
      }
    }

    const validacionesExitosas = Object.keys(reglas).filter(propiedad => !(propiedad in errores));

    resultadosValidacion.push({ errores, validacionesExitosas });
  }

  return resultadosValidacion;
}



// Ejemplo de uso con un array de objetos:
const arrayDatosUsuarios = [
  { nombre: 'John Doe', cedula: '123456789' },
  { nombre: 'Jane Smith', cedula: 'ABC123' },
];

const reglasValidacion = {
  nombre: { required: true, tipo: 'string' },
  cedula: { required: true, tipo: 'number', pattern: /^\d+$/ },
};

const resultados = validarArrayDeObjetos(arrayDatosUsuarios, reglasValidacion);
console.log(resultados);
