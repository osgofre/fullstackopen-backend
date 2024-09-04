const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3] || null
const phone = process.argv[4] || null

const url =
    `mongodb+srv://osgofre13:${password}@cluster0.oub7j.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  phone: String
})

const Person = mongoose.model('Person', personSchema)

if (name === null && phone === null) {
  Person.find({})
    .then(result => {
      console.log('phonebook:')
      result.forEach(person => {
        console.log(`${person.name} ${person.phone}`)
      })
      mongoose.connection.close()
    })
  return
}
else {

  const person = new Person({ name,phone })

  person.save()
    .then(result => {
      console.log(`added ${result.name} number ${result.phone} to phonebook`)
      mongoose.connection.close()
    })
}