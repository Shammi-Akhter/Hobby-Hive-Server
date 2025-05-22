const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hobbyhive.axzu7a1.mongodb.net/?retryWrites=true&w=majority&appName=HobbyHive`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {

    try {
        await client.connect();

        console.log("Connected to MongoDB");

        const database = client.db("HobbyHive");
        const hobbyCollection = database.collection("all_hobby_group");


        app.get('/hobby-groups', async (req, res) => {
            try {
                const result = await hobbyCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Failed to fetch hobby groups" });
            }

        });

        
        app.post('/create-group', async (req, res) => {
            try {
                const group = req.body;
                const result = await hobbyCollection.insertOne(group);
                res.status(201).send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Failed to create hobby group" });
            }
        });


    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

run();

app.get('/', (req, res) => {
    res.send("Server Connected");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
