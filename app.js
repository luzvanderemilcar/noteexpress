//server.js


//jshint esversion:6


const defaultServerPort = process.env.PORT || 3000;

const currentMongoDBPort  = 27017;


const express = require("express");

const bodyParser = require("body-parser");

const ejs = require("ejs");

const mongoose = require("mongoose");


//create express app

const app = express();


app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


//Setting up data base

mongoose.connect(`mongodb://localhost:${currentMongoDBPort}/notes`);


const noteSchema = {

  title: String,

  content: String

};


const Note = mongoose.model("Note", noteSchema);


app.get("/notes", function(req, res) {

  Note.find((err, notes) => {

    if (!err) {

      res.send(notes);

    } else {

      res.send(err);

    }

  })

});

//Add a note. We can use postman to make the request without building clientside form


app.post("/notes", (req, res) => {

  

  const newNote = new Note({

    title : req.body.title,

    content : req.body.content

  });


//Save the note inside the database

  newNote.save(err => {

    if (!err) {

      res.send("Note added successfully");

    } else {

     res.send(err);

    }   

});

});

//Delete all the note


app.delete("/notes", (req, res) => {

  Note.deleteMany(() => {

    if (!err) {

      res.send("All the article were deleted successfully");

    } else {

      res.send(err);

    }

  });

});

// Setting up server

app.listen(currentPort, function () {

  console.log("Server started on port" + defaultServerPort);

});