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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})