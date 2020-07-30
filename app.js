require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()
//const LocalStrategy = require('passport-local').Strategy
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))


app.use(session({
  secret: "thisisatest",
  resave: false,
  saveUninitialized: false
  //saveUninitialized: true

}))

app.use(passport.initialize());
app.use(passport.session())

mongoose.connect('mongodb://localhost/auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const personSchema = new mongoose.Schema({
  // username: {
  //   type: String,
  //   required: [true, "missing username"]
  // },
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

const User = mongoose.model('User', personSchema);

//passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy())


passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/important", (req, res) => {
  console.log(req);
  if (req.isAuthenticated()) {
    console.log("Did authenticate");
    res.render("important")
  } else {
    res.redirect("/login")
  }

})

app.get("/login", (req, res) => {
  res.render('login', {
    title: "Login"
  })
})

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register"
  })

})

app.post("/register", function(req, res, next){
  console.log(req.body);
  const email = req.body.username
  const password = req.body.password

  console.log("before User.register");
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/important");
      });

    }
  });


})

app.post("/login", function(req, res, next){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {

      passport.authenticate("local")(req, res, function(){
        res.redirect("/important");
      });
    }
  });

});



app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(port, (err) => {
  console.log("Server is running on port " + port);
})
