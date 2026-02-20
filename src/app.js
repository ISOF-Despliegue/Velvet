import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/api/sumar', (req, res) => {
  const result = {
    message: 'Este endpoint suma dos números',
    sum: Number(req.query.a) + Number(req.query.b)
  }
  res.json(result)
})

app.get('/api/restar', (req, res) => {
    const result = {
        message: 'Este endpoint resta dos números',
        rest: Number(req.query.a) - Number(req.query.b)
    }
    res.json(result)
})

app.get('/api/multiplicar', (req, res) => {
    const result = {
        message: 'Este endpoint multiplica dos números',
        rest: Number(req.query.a) * Number(req.query.b)
    }
    res.json(result)
})

app.get('/api/dividir', (req, res) => {
    const result = {
        message: 'Este endpoint divide dos números',
        rest: Number(req.query.a) / Number(req.query.b)
    }
    res.json(result)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})