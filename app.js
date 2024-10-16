//server.js


//jshint esversion:6


const defaultServerPort = process.env.PORT || 3000;

const currentMongoDBPort = 27017;


const express = require("express");

const bodyParser = require("body-parser");

const ejs = require("ejs");

const mongoose = require("mongoose");


//create express app

const app = express();


app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


//Setting up data base

mongoose.connect(`mongodb://localhost:${currentMongoDBPort}/notes`);


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

        res.send(notes);

      } else {

        res.send(err);

      }

    })

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


  .get((req, res) => {

      Note.findOne({ title: req.params.noteTitle }, (err, foundNote) => {

          if (foundNote) {

            res.send(foundNote);

          } else {

            res.send(err);

          }

        })
      })


    //Update an article with put method


    .put((req, res) => {

      Note.update(

        { title: req.params.noteTitle },

        { title: req.body.title, content: req.body.content },

        { overwrite: true },

        (err) => {

          if (!err) {

            res.send("Note updated successfully");

          } else {

            res.send(err);

          }

        }

      );

    })


    //Update an article with patch method. The

    .patch((req, res) => {

      Note.update(

        { title: req.params.noteTitle },

        { $set: req.body },

        (err) => {

          if (!err) {

            res.send("Note updated successfully");

          } else {

            res.send(err);

          }

        }

      );

    })


    .delete((req, res) => {

      Note.deleteOne(

        { title: req.params.noteTitle },

        (err) => {

          if (!err) {

            res.send("Note deleted successfully");

          } else {

            res.send(err);

          }

        }

      );

    });
    // Setting up server

    app.listen(currentPort, function() {

      console.log("Server started on port" + defaultServerPort);

    });