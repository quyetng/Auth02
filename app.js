require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const secret = process.env.SECRET
const md5 = require('md5')
const bcrypt = require('bcrypt')
const saltRounds = 10



mongoose.connect('mongodb://localhost/auth', {useNewUrlParser: true})


// create Schema
const personSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "missing email"]
  },
  password: {
    type: String,
    required: [true, "missing password"]
  }

})

//personSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']})
// create model

const Person = mongoose.model('Person', personSchema);


app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/login", (req, res) => {
  res.render('login', {title: "Login"})
})

app.get("/register", (req, res) => {
  res.render("register", {title: "Register"})

})

app.post("/register", (req, res) => {
  console.log(req.body);
  const email = req.body.email
  const password = req.body.password


  Person.findOne({email: email}, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundUser) {

        bcrypt.genSalt(saltRounds, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              console.log(err);
            } else if (hash) {
              console.log(hash);
              const newUser = new Person({email: email, password: hash})
              newUser.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Added successful");
                  res.send("Registered successful")
                }
              })
            }
          })
        })


      } else {
        res.send("email is existed. Please choose a different one")
      }
    }
  })

})

app.post("/login", (req, res) => {
  console.log(req.body);
  const email = req.body.email
  const password = req.body.password

  Person.findOne({email: email}, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, (err, result) => {
          console.log(foundUser.password);
          if (result) {
            res.render('index')
          } else {
            res.send("User is not found")
          }
        })

      }
    }
  })
})

app.listen(port, (err) => {
  console.log("Server is running on port " + port);
})
