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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})