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

        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment)
            console.log(result)
            res.json(result)

        })
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query)
            const cursor = appointmentsCollection.find(query)
            const appointments = await cursor.toArray()
            res.json(appointments)
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