import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

let constants = {
  pi: 3.1416,
  e: 2.7183
}

let history = []
let nextId = 1

app.use(express.json())


function validateNumbers(req, res) {
  const a = Number(req.query.a)
  const b = Number(req.query.b)

  if (isNaN(a) || isNaN(b)) {
    res.status(400).json({
      error: 'Debes enviar a y b como números'
    })
    return null
  }

  return { a, b }
}

app.get('/api/sumar', (req, res) => {
  const values = validateNumbers(req, res)
  if (!values) return

  res.json({
    message: 'Suma de dos números',
    result: values.a + values.b
  })
})

app.get('/api/restar', (req, res) => {
  const values = validateNumbers(req, res)
  if (!values) return

  res.json({
    message: 'Resta de dos números',
    result: values.a - values.b
  })
})

app.get('/api/multiplicar', (req, res) => {
  const values = validateNumbers(req, res)
  if (!values) return

  res.json({
    message: 'Multiplicación de dos números',
    result: values.a * values.b
  })
})

app.get('/api/dividir', (req, res) => {
  const values = validateNumbers(req, res)
  if (!values) return

  if (values.b === 0) {
    return res.status(400).json({
      error: 'No se puede dividir entre 0'
    })
  }

  res.json({
    message: 'División de dos números',
    result: values.a / values.b
  })
})

app.get('/api/constantes', (req, res) => {
  res.json(constants)
})

app.get('/api/historial', (req, res) => {
  res.json({
    total_registros: history.length,
    historial: history
  })
})


app.post('/api/constantes', (req, res) => {
  const { nombre, valor } = req.body

  if (!nombre || valor === undefined) {
    return res.status(400).json({
      error: 'Debes enviar nombre y valor'
    })
  }

  if (constants[nombre]) {
    return res.status(400).json({
      error: 'La constante ya existe'
    })
  }

  constants[nombre] = valor

  res.status(201).json({
    mensaje: `Constante ${nombre} creada`,
    constantes: constants
  })
})


app.post('/api/constantes/reset', (req, res) => {
  constants = {
    pi: 3.1416,
    e: 2.7183
  }

  res.status(201).json({
    mensaje: 'Constantes reiniciadas a valores originales',
    constantes: constants
  })
})

app.post('/api/calcular-lotes', (req, res) => {
  const { operacion, numeros } = req.body

  if (!Array.isArray(numeros) || numeros.length === 0) {
    return res.status(400).json({ 
      error: 'Debes enviar un arreglo de números en el campo "numeros"' 
    })
  }

  if (!numeros.every(num => typeof num === 'number')) {
    return res.status(400).json({ error: 'Todos los elementos deben ser números' })
  }

  let result
  switch (operacion) {
    case 'sumar':
      result = numeros.reduce((acc, curr) => acc + curr, 0)
      break
    case 'multiplicar':
      result = numeros.reduce((acc, curr) => acc * curr, 1)
      break
    default:
      return res.status(400).json({ error: 'Operación no soportada. Usa "sumar" o "multiplicar"' })
  }

  const newRecord = {
    id: nextId++,
    operacion,
    numeros,
    resultado: result,
    etiqueta: 'Sin etiqueta'
  }
  
  history.push(newRecord)

  res.status(201).json({
    message: 'Cálculo por lotes realizado y guardado',
    record: newRecord
  })
})


app.put('/api/constantes/:nombre', (req, res) => {
  const { nombre } = req.params
  const { valor } = req.body

  if (valor === undefined) {
    return res.status(400).json({
      error: 'Debes enviar el nuevo valor'
    })
  }

  if (!constants[nombre]) {
    return res.status(404).json({
      error: 'La constante no existe'
    })
  }

  constants[nombre] = valor

  res.json({
    mensaje: `Constante ${nombre} actualizada`,
    constantes: constants
  })
})


app.put('/api/constantes', (req, res) => {
  const newConstants = req.body

  if (typeof newConstants !== 'object') {
    return res.status(400).json({
      error: 'Debes enviar un objeto con constantes'
    })
  }

  constants = newConstants

  res.json({
    mensaje: 'Todas las constantes fueron reemplazadas',
    constantes: constants
  })
})

app.put('/api/historial/:id', (req, res) => {
  const idParam = Number(req.params.id)
  const { etiqueta } = req.body

  if (!etiqueta) {
    return res.status(400).json({ error: 'Debes enviar el campo "etiqueta" en el body' })
  }

  const index = history.findIndex(record => record.id === idParam)

  if (index === -1) {
    return res.status(404).json({ error: `No se encontró ningún registro con el ID ${idParam}` })
  }

  history[index].etiqueta = etiqueta

  res.json({
    message: 'Etiqueta del historial actualizada correctamente',
    record: history[index]
  })
})

const OPERACIONES_DOS_NUMEROS = new Set(['sumar', 'restar', 'multiplicar', 'dividir'])
const OPERACIONES_LOTE = new Set(['sumar', 'multiplicar'])

function normalizarOperacion(operacion) {
  return String(operacion ?? '').trim().toLowerCase()
}

function esNumeroValido(valor) {
  return Number.isFinite(valor)
}

function convertirNumero(valor) {
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function calcularDosNumeros(operacion, a, b) {
  switch (operacion) {
    case 'sumar':
      return { ok: true, resultado: a + b }
    case 'restar':
      return { ok: true, resultado: a - b }
    case 'multiplicar':
      return { ok: true, resultado: a * b }
    case 'dividir':
      if (b === 0) {
        return { ok: false, status: 400, error: 'No se puede dividir entre 0' }
      }
      return { ok: true, resultado: a / b }
    default:
      return {
        ok: false,
        status: 400,
        error: 'Operación no válida. Usa: sumar, restar, multiplicar o dividir'
      }
  }
}

function normalizarArregloNumeros(numeros) {
  if (!Array.isArray(numeros) || numeros.length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'Debes enviar un arreglo no vacío en "numeros"'
    }
  }

  const convertidos = numeros.map(n => Number(n))

  if (!convertidos.every(Number.isFinite)) {
    return {
      ok: false,
      status: 400,
      error: 'Todos los elementos de "numeros" deben ser números válidos'
    }
  }

  return { ok: true, numeros: convertidos }
}

function calcularLote(operacion, numeros) {
  if (operacion === 'sumar') {
    return numeros.reduce((acc, curr) => acc + curr, 0)
  }

  if (operacion === 'multiplicar') {
    return numeros.reduce((acc, curr) => acc * curr, 1)
  }

  return null
}

function obtenerIdPositivo(paramId) {
  const id = Number(paramId)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

app.post('/api/calcular', (req, res) => {
  const { operacion, a, b, guardarEnHistorial = false } = req.body

  if (operacion === undefined || a === undefined || b === undefined) {
    return res.status(400).json({
      error: 'Debes enviar "operacion", "a" y "b" en el body'
    })
  }

  if (req.body.guardarEnHistorial !== undefined && typeof guardarEnHistorial !== 'boolean') {
    return res.status(400).json({
      error: '"guardarEnHistorial" debe ser true o false'
    })
  }

  const operacionNormalizada = normalizarOperacion(operacion)

  if (!OPERACIONES_DOS_NUMEROS.has(operacionNormalizada)) {
    return res.status(400).json({
      error: 'Operación no válida. Usa: sumar, restar, multiplicar o dividir'
    })
  }

  const numA = convertirNumero(a)
  const numB = convertirNumero(b)

  if (!esNumeroValido(numA) || !esNumeroValido(numB)) {
    return res.status(400).json({
      error: '"a" y "b" deben ser números válidos'
    })
  }

  const calculo = calcularDosNumeros(operacionNormalizada, numA, numB)

  if (!calculo.ok) {
    return res.status(calculo.status).json({ error: calculo.error })
  }

  let recordGuardado = null

  if (guardarEnHistorial) {
    recordGuardado = {
      id: nextId++,
      operacion: operacionNormalizada,
      numeros: [numA, numB],
      resultado: calculo.resultado,
      etiqueta: 'Creado desde POST /api/calcular'
    }

    history.push(recordGuardado)
  }

  const statusCode = guardarEnHistorial ? 201 : 200

  return res.status(statusCode).json({
    message: 'Cálculo realizado correctamente',
    operacion: operacionNormalizada,
    a: numA,
    b: numB,
    resultado: calculo.resultado,
    guardadoEnHistorial: guardarEnHistorial,
    record: recordGuardado
  })
})

app.put('/api/historial/:id/recalcular', (req, res) => {
  const idParam = obtenerIdPositivo(req.params.id)

  if (idParam === null) {
    return res.status(400).json({
      error: 'El ID debe ser un entero positivo'
    })
  }

  const { operacion, numeros, etiqueta } = req.body
  const index = history.findIndex(record => record.id === idParam)

  if (index === -1) {
    return res.status(404).json({
      error: `No se encontró ningún registro con el ID ${idParam}`
    })
  }

  if (operacion === undefined || numeros === undefined || etiqueta === undefined) {
    return res.status(400).json({
      error: 'Con PUT debes enviar "operacion", "numeros" y "etiqueta" para reemplazar el recurso completo'
    })
  }

  if (typeof etiqueta !== 'string') {
    return res.status(400).json({
      error: '"etiqueta" debe ser texto'
    })
  }

  const nuevaOperacion = normalizarOperacion(operacion)

  if (!OPERACIONES_LOTE.has(nuevaOperacion)) {
    return res.status(400).json({
      error: 'Operación no soportada para recalcular historial. Usa "sumar" o "multiplicar"'
    })
  }

  const normalizacion = normalizarArregloNumeros(numeros)
  if (!normalizacion.ok) {
    return res.status(normalizacion.status).json({
      error: normalizacion.error
    })
  }

  const numerosFinales = normalizacion.numeros
  const nuevoResultado = calcularLote(nuevaOperacion, numerosFinales)

  const registroActualizado = {
    id: idParam,
    operacion: nuevaOperacion,
    numeros: numerosFinales,
    resultado: nuevoResultado,
    etiqueta
  }

  history[index] = registroActualizado

  return res.json({
    message: 'Registro del historial reemplazado y recalculado correctamente (PUT completo)',
    record: registroActualizado
  })
})

app.patch('/api/historial/:id', (req, res) => {
  const idParam = obtenerIdPositivo(req.params.id)

  if (idParam === null) {
    return res.status(400).json({ error: 'El ID debe ser un entero positivo' })
  }

  const index = history.findIndex(record => record.id === idParam)

  if (index === -1) {
    return res.status(404).json({ error: `No se encontró ningún registro con el ID ${idParam}` })
  }

  const { etiqueta } = req.body

  if (etiqueta === undefined) {
    return res.status(400).json({ error: 'Para usar PATCH, debes enviar el campo "etiqueta"' })
  }

  if (typeof etiqueta !== 'string') {
    return res.status(400).json({ error: '"etiqueta" debe ser texto' })
  }

  history[index].etiqueta = etiqueta

  return res.json({
    message: 'Etiqueta actualizada correctamente (PATCH)',
    record: history[index]
  })
})

app.delete('/api/historial/:id', (req, res) => {
  const idParam = obtenerIdPositivo(req.params.id)

  if (idParam === null) {
    return res.status(400).json({ error: 'El ID debe ser un entero positivo' })
  }

  const index = history.findIndex(record => record.id === idParam)

  if (index === -1) {
    return res.status(404).json({ error: `No se encontró ningún registro con el ID ${idParam}` })
  }

  const registroEliminado = history.splice(index, 1)[0]

  return res.json({
    message: 'Registro eliminado correctamente',
    recordEliminado: registroEliminado
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})