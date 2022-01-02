const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a4cc9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)
async function run() {
    try {
        await client.connect();
        const database = client.db('7ecom');
        const productCollection = database.collection('products');
        const usersCollection = database.collection('users');

        //get API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })

        // get single item by GENRE
        app.get('/products/category/:category', async (req, res) => {
            const productCategory = req.params.category;
            // console.log(productCategory);
            const query = { category: productCategory };
            // console.log(query);

            // const options = { projection: { _id: 0, title: 1 } };
            const options = {};
            // console.log(options)

            const cursor = productCollection.find(query, options);
            const result = await cursor.toArray();
            res.json(result);
        })


        // get single item by ID
        app.get('/products/:id', async (req, res) => {
            const itemId = req.params.id;
            console.log(itemId)
            const query = { _id: ObjectId(itemId) };
            const singleProduct = await productCollection.findOne(query);
            res.json(singleProduct);
        })


        // POST API
        app.post('/products', async (req, res) => {
            const addProduct = req.body;
            console.log(addProduct);
            const result = await productCollection.insertOne(addProduct);
            res.json(result);
        })

        // Delete API 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })

        // Add Product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // users data post to mongodb
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log('user result', result);
            res.json(result);
        })


        // check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


    }
    finally {
        // await client.close();
    }
}


run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Server Status: Up & Running')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})