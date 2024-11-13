//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passportLocalMongoose");

const currentPort = process.env.PORT || 3000;

//create express app

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Use session with a set of options
app.use(session({
  secrets: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());

// Use passport to authenticate session
app.use(passport.session());

// Create new Data Base : userDB
mongoose.connect(`mongodb://localhost:${process.env.MONGODB_PORT || 27017}/userDB`);
//after Connection to prevent deprecation warning?
mongoose.set({ useCreateIndex: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
//plugin passportLocalMongoose 
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// create a user Strategies 
app.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Get requests
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");

});

//Get all notes
app.get("/notes", function(req, res) {
  if (req.isAuthenticated()) {
    Note.find({ userId: req.user.id }, (err, notes) => {
      if (err) {
        console.error(error);
      } else {
        res.render("notes", { allNotes: notes });
      }
    });
  } else {
    res.redirect("/login");
  }
})

//Post requests

// Register
app.post("/register", (req, res) => {
  User.register({ username: req.body.username }, req.body.password, (err, user) => {
    if (err) {
      console.error("Error registering user", err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/notes");
      });
    }
  });
});

// Login
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      console.error("Error login user ", err)
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/notes");
      });
    }
  })
});

//Logout 
app.get("/logout", () => {
  req.logout();
  res.redirect("/");
});

// Submit
app.route("/submit")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    if (req.isAuthenticated()) {

    }
  });

// Create a new collection for notes
const noteSchema = mongoose.Schema({
  title: String,
  content: String,
  userId: String,
  created: String,
  modified: String
});

const Note = mongoose.model("Note", noteSchema);

//Create a route to all notes and chain request methods

app.route("/notes")

  //Add a note. We can use postman to make the request without building clientside form
  .post((req, res) => {
    if (req.isAuthenticated()) {
    const newNote = new Note({
      title: req.body.title,
      content: req.body.content,
      userId: req.user.id,
      created: new Date()
    });

    //Save the note inside the database
    newNote.save(err => {
      if (!err) {
        console.log("Note added successfully");
        res.reload();
      } else {
        res.send(err);
      }
    });
    } else {
      res.redirect("/login");
    }
  })


  //Delete all the note
  .delete((req, res) => {
    Note.deleteMany({userId : req.user.id}, (err) => {
      if (!err) {
        res.send("All the notes were deleted successfully");
      } else {
        res.send(err);
      }
    });
  });

//Method on a specific note

//Using a custom parameter noteTitle
app.route("/notes/:noteTitle")

  // Get one article with route parameter :noteTitle
  .get((req, res) => {
    if (req.isAuthenticated()) {
    Note.findOne({userId: req.user.id, title: req.params.noteTitle }, (err, foundNote) => {
      if (foundNote) {
        res.send(foundNote);
      } else {
        res.send(err);
      }
    });
    } else {
      res.redirect("/login")
    }
  })

  //Update an article with put method. The body of the request (req.body) or the object provided will override or replace the whole document
  .put((req, res) => {
    Note.update({ title: req.params.noteTitle }, { title: req.body.title, content: req.body.content }, { overwrite: true },
      (err) => {
        if (!err) {
          console.log("Note updated successfully");
          res.relaod();
        } else {
          res.send(err);
        }
      }
    );
  })

  //Update an article with patch method. The $set property specify the key-value pairs we want to update

  .patch((req, res) => {
    Note.update({ title: req.params.noteTitle }, { $set: req.body },
      (err) => {
        if (!err) {
          console.log("Note updated successfully");
          res.relaod();
        } else {
          res.send(err);
        }
      }
    );
  })


  //Delete a specific article 
  .delete((req, res) => {
    Note.deleteOne({ title: req.params.noteTitle },
      (err) => {
        if (!err) {
          console.log("Note deleted successfully");
          res.redirect("/notes");
        } else {
          console.error("Error deleting note", err);
          res.reload();
        }
      });
  });

//

// Setting up server

app.listen(currentPort, () => {
  console.log("Server started on port" + currentPort);
});