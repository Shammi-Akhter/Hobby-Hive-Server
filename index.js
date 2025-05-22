const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

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
        app.get('/my-groups', async (req, res) => {
            const userEmail = req.query.email;
            console.log("Email received:", userEmail); 

            if (!userEmail) {
                return res.status(400).json({ message: "User email is required" });
            }

            try {
                const groups = await hobbyCollection.find({ userEmail }).toArray();
                res.status(200).send(groups);
            } catch (error) {
                console.error("Error fetching user groups:", error);
                res.status(500).json({ message: "Failed to fetch user groups" });
            }
        });

      app.get('/hobby-groups/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const group = await hobbyCollection.findOne({ _id: new ObjectId(id) });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ message: "Failed to fetch group" });
    }
});



        app.delete('/groups/:id', async (req, res) => {
            const id = req.params.id;

            try {
                const result = await hobbyCollection.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount === 1) {
                    res.send({ message: 'Group deleted' });
                } else {
                    res.status(404).send({ message: 'Group not found' });
                }
            } catch (error) {
                console.error('Delete error:', error);
                res.status(500).send({ message: 'Failed to delete group' });
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
