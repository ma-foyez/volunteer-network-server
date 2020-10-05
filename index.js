const express = require('express');
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5000;
const ObjectId = require('mongodb').ObjectId;

// import database
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8tplb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json())
app.use(cors());

// connect database
client.connect(err => {
    //event database
    const EventCollection = client.db("VolunteeerNetworkDB").collection("events");
    console.log('database connected')

    // post event data to database server
    app.post('/addEvent', (req, res) => {
        const event = req.body;
        EventCollection.insertOne(event)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // load all event data from database
    app.get('/AllEvent', (req, res) => {
        EventCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // load single event
    app.get('/singleEvent/:id', (req, res) => {
        EventCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    // add new volunteer for event
    const RegisterVolunteer = client.db("VolunteeerNetworkDB").collection("volunteer");
    app.post('/registerVolunteer', (req, res) => {
        const newVolunteer = req.body;
        RegisterVolunteer.insertOne(newVolunteer)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // load single volunteer activities
    app.get('/volunteerActivities', (req, res) => {
        RegisterVolunteer.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // delete volunteer from database
    app.delete('/deleteVolunteer', (req, res) => {
        RegisterVolunteer.deleteOne({ _id: ObjectId(req.query.id) })
            .then(result => {
                res.send(result)
            })
    })

    // delete single event from database
    app.delete('/deleteEvent', (req, res) => {
        EventCollection.deleteOne({ _id: ObjectId(req.query.id) })
            .then(result => {
                res.send(result)
            })
    })

    //========================
    // load all volunteers
    app.get('/AllVolunteer', (req, res) => {
        RegisterVolunteer.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // load single event & update

    // load single event
    app.get('/LoadSingleEvent', (req, res) => {
        EventCollection.find({ _id: ObjectId(req.query.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })
    //update single event
    app.patch('/updateEvent/', (req, res) => {
        EventCollection.updateOne({ _id: ObjectId(req.query.id) }, {
          
            $set: { eventTitle: req.body.eventTitle, eventDate: req.body.eventDate, description: req.body.description }
        })
            .then(result => {
               res.send(result)
            })
    })

      //update single volunteer information
      app.patch('/updateVolunteerInfo/', (req, res) => {
        RegisterVolunteer.updateOne({ _id: ObjectId(req.query.id) }, {
          
            $set: { name: req.body.name, email: req.body.email, eventTitle: req.body.eventTitle, eventDate: req.body.eventDate }
        })
            .then(result => {
               res.send(result)
          
            })
    })
    // close connection
});

app.get('/', function (req, res) {
    res.send('Hlw, dear! I am wokring properly')
})

app.listen(process.env.PORT || port);