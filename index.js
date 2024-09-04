require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// GET
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
app.get('/api/persons', (request, response) => {
  console.log('GET /api/persons');
  
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => {
      console.log(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(persons => {
      response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
    })
})


// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// POST
app.post('/api/persons', (request, response, next) => {
  const body = request.body

	if (!(body.name && body.number)) {
		return response.status(400).json({ 
			error: 'content missing' 
		})
    }

	if (body.name) {
    Person.findOne({name: body.name})
      .then(existingPerson => {
        if (existingPerson) {
          return response.status(409).json({ 
            error: 'person already exists' 
          });
        }

        const person = new Person({
          name: body.name,
          number: body.number
        })
    
        person.save()
          .then(savedPerson => {
            response.json(savedPerson)
          })
          .catch(error => next(error))
      })
  }
})

// PUT
app.put('/api/persons/:id', (request, response) => {
  const {name, number} = request.body
  const person = { name, number }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => {
      console.log(error)
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})