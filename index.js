const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()


// middleWare

app.use(cors())
app.use(express.json())

// port 
const port = process.env.PORT || 5000;

// DateBase mongo DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wkops72.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const serviceCollection = client.db("review").collection("services");
        const reviewCollection = client.db("review").collection("reviews")

        app.get('/allServices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })



        app.get('/reviews' , async(req , res) => {
           let query = {};
           if(req.query.service_id){
            query = {
                service_id: req.query.service_id
            }
           }
           const cursor = reviewCollection.find(query);
           const reviews = await cursor.toArray();
           res.send(reviews)
        })

        // post 

        app.post('/reviews' , async(req , res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)

        })
    }
    finally {

    }
}
run().catch(e => console.error(e))




app.get('/', (req, res) => {
    res.send("Review server is running");
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})