const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()

// middleWare

app.use(cors())
app.use(express.json())

// port 
const port = process.env.PORT || 5000;


// jwt token


function verifyJWT (req , res , next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message : "unauthorized"})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token , process.env.ACCESS_TOKEN_SECRET, function(err , decoded){
        if(err){
            res.status(401).send({message : "unauthorized"})
        }
        req.decoded= decoded;
        next();
    })
}

// DateBase mongo DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wkops72.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const serviceCollection = client.db("review").collection("services");
        const reviewCollection = client.db("review").collection("reviews")



        // allServices
        app.get('/allServices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        // limited 3 service 

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })


        // find one item


        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })


        // find review by email

        app.get('/reviews' ,verifyJWT, async (req , res ) => {
            
            const decoded = req.decoded;
            console.log(decoded);
            if(decoded.email !== req.query.email){
                return res.status(403).send({message : "unauthorized"})
            }
            
            let query = {};
            if(req.query.email) {
                query = {
                    email : req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        // jwt post 
        app.post('/jwt' , (req , res) => {
            const user = req.body;
            const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {expiresIn : "1d"})
            res.send({token})
        })

        // find review by services id 

        app.get('/review' , async(req , res) => {
            let query = {};
            // console.log(query);
            if(req.query.service_id){
             query = {
                 service_id: req.query.service_id
             }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            // console.log(reviews);
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