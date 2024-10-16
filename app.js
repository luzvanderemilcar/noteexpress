//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const currentPort = process.env.PORT || 3000;

//create express app

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create new Data Base : userDB
mongoose.connect(`mongodb://localhost:${process.env.MONGODB_PORT || 27017}/userDB`);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

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

//Post requests

// Register
app.post("/register", (req, res) => {
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (error, hash) => {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
    
    // Check the success of the operation
    if (error) {
      console.error("Error registering: ", error);
    } else {
      newUser.save(err => {
        if (err) {
          console.error("Error saving instance: ", err);
        } else {
          res.render("notes");
        }
      });
    }
  });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.error(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, (error, result) => {
          if (error) {
            console.error("Error authenticating user", error);
          }
          if (result === true) {
            res.render("notes");
          } else {
            // The password don't match the username one's.
            console.log("Wrong Password or wrong username");
            res.redirect("/login");
          }
        });

      } else {
        // No User Were found
        res.send("Wrong username. Please Enter a valid username");
      }
    }
  });
});

// Create a new collection for notes
const noteSchema = {
  title: String,
  content: String
};

const Note = mongoose.model("Note", noteSchema);

//Create a route to all notes and chaining request methods

app.route("/notes")

  //Get all notes
  .get(function(req, res) {
    Note.find((err, notes) => {
      if (!err) {
        res.send("notes");
      } else {
        res.send(err);
      }
    });
  })

  //Add a note. We can use postman to make the request without building clientside form
  .post((req, res) => {
    const newNote = new Note({
      title: req.body.title,
      content: req.body.content
    });

    //Save the note inside the database
    newNote.save(err => {
      if (!err) {
        res.send("Note added successfully");
      } else {
        res.send(err);
      }
    });
  })


  //Delete all the note
  .delete((req, res) => {
    Note.deleteMany((err) => {
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
    Note.findOne({ title: req.params.noteTitle }, (err, foundNote) => {
      if (foundNote) {
        res.send(foundNote);
      } else {
        res.send(err);
      }
    });
  })

  //Update an article with put method. The body of the request (req.body) or the object provided will override or replace the whole document
  .put((req, res) => {
    Note.update({ title: req.params.noteTitle }, { title: req.body.title, content: req.body.content }, { overwrite: true },
      (err) => {
        if (!err) {
          console.log("Note updated successfully");
          res.redirect("/notes/:noteTitle");
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
          res.send("Note updated successfully");
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
          res.send("Note deleted successfully");
        } else {
          res.send("Error deleting note", err);
        }
      });
  });

// Setting up server

app.listen(currentPort, () => {
  console.log("Server started on port" + currentPort);
});