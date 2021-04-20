const express = require('express')
const cors = require("cors")
const fileUpload = require('express-fileupload')
const bodyParser = require("body-parser")

require("dotenv").config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qd8gm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(express.static('services'));
app.use(fileUpload());
app.use(cors());


const port = 5000

app.get('/', (req, res) => {
    res.send('Hello World!')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const reviewCollection = client.db("babyCare").collection("review");
    app.post('/addReview', (req, res) => {

        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;

        reviewCollection.insertOne({ name, email, message })
            .then(result => {
                res.send(result)
            })
    })
});


client.connect(err => {
    const adminsCollection = client.db("babyCare").collection("admins");
    app.post('/addAdmin', (req, res) => {

        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email);

        adminsCollection.insertOne({ name, email })
            .then(result => {
                res.send(result);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })
});



client.connect(err => {
    const serviceCollection = client.db("babyCare").collection("services");
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;



        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
});




app.listen(process.env.PORT || port)