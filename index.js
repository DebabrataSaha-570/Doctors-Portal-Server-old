const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

const cors = require('cors')
app.use(cors())
app.use(express.json())


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.imkxn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('database connected successfully')
        const database = client.db("doctors_portal");
        const appointmentsCollection = database.collection("appointments");
        const usersCollection = database.collection("users");

        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString()


            const query = { email: email, date: date }
            console.log((query))

            const cursor = appointmentsCollection.find(query)
            const appointments = await cursor.toArray()
            res.json(appointments)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true;

            }
            res.json({ admin: isAdmin })
        })

        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment)
            console.log(result)
            res.json(result)

        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            console.log(result)
            res.json(result)

        })
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email, }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)


        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello Doctors Portal!')
})

app.listen(port, () => {
    console.log(`Doctors portal server listening at :${port}`)
})