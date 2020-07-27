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
const session = require('express-session')
const passportLocalMongoose = require('passport-local-mongoose')
const passport = require('passport')
//const LocalStrategy = require('passport-local').LocalStrategy


app.use(session({
  secret: "thisisatest",
  resave: false,
  saveUninitialized: false
  //saveUninitialized: true

}))

app.use(passport.initialize());
app.use(passport.session())

mongoose.connect('mongodb://localhost/auth', {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true})
// create Schema
// const personSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: [true, "missing username"]
//   },
//   email: {
//     type: String,
//     required: [true, "missing email"]
//   },
//   password: {
//     type: String,
//     required: [true, "missing password"]
//   }
//
// })

const personSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "missing username"]
  },
  email: {
    type: String
    //required: [true, "missing email"]
  },
  password: {
    type: String
    //required: [true, "missing password"]
  }

})

personSchema.plugin(passportLocalMongoose)


//personSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']})
// create model

const Person = mongoose.model('Person', personSchema);

passport.use(Person.createStrategy())

passport.serializeUser(Person.serializeUser())
passport.deserializeUser(Person.deserializeUser())

app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  console.log(req);
  if (req.isAuthenticated()) {
    res.render("index")
  } else {
    res.redirect("/login")
  }

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

  console.log("before Person.register");
  Person.register({username: email, email: email, active: false}, password, (err, user) => {
    console.log("inside Person.register");
    if (err) {
      console.log(err);
      console.log("Cannot register");
    } else {
      console.log("Registerd successful");
      // let local cookies know you are alreading authenticated
      // passport.authenticate('local'), function(req, res) {
      //   res.redirect('/')
      // }
      var authenticate = Person.authenticate()
      authenticate(email, password, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          if (result) {
            res.redirect("/")
          }
        }
      })

    }



  })

  // Person.findOne({email: email}, (err, foundUser) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (!foundUser) {
  //
  //       bcrypt.genSalt(saltRounds, (err, salt) => {
  //         bcrypt.hash(password, salt, (err, hash) => {
  //           if (err) {
  //             console.log(err);
  //           } else if (hash) {
  //             console.log(hash);
  //             const newUser = new Person({email: email, password: hash})
  //             newUser.save((err) => {
  //               if (err) {
  //                 console.log(err);
  //               } else {
  //                 console.log("Added successful");
  //                 res.send("Registered successful")
  //               }
  //             })
  //           }
  //         })
  //       })
  //
  //
  //     } else {
  //       res.send("email is existed. Please choose a different one")
  //     }
  //   }
  // })
  console.log("end of register");
})

app.post("/login", (req, res) => {
  //console.log(req.body);
  const email = req.body.email
  console.log(email);
  const password = req.body.password
  console.log(password);

  const user = new Person({username: email, password: password})

  //passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'})
  req.login(user, (err) => {
    if (err) {
      console.log(err);
      console.log("Something wrong");
    } else {
      // request authentication, so can save cookie infor
      // passport.authenticate('local')(req, res, function(){
      //   res.redirect("/")
      // })
      passport.authenticate('local'), function(req, res) {
        res.redirect("/")
      }
      // passport.authenticate('local')(req, res, function(){
      //   res.redirect("/")
      // })

      //passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'})

    }
  })

  console.log("end of login");
  // Person.findOne({email: email}, (err, foundUser) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       bcrypt.compare(password, foundUser.password, (err, result) => {
  //         console.log(foundUser.password);
  //         if (result) {
  //           res.render('index')
  //         } else {
  //           res.send("User is not found")
  //         }
  //       })
  //
  //     }
  //   }
  // })
})

app.listen(port, (err) => {
  console.log("Server is running on port " + port);
})
