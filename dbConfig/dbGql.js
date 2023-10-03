import env from '../dotenv.config.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = `mongodb+srv://${env.DB_USER}:${env.DB_PASS}@craftawesome.bgwffom.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let reactBootcampDB;
let userCollection;
let todoCollection;
let songsCollection;
let postCollection;
let likeCollection;
let commentCollection;
let savedPostCollection;
let notificationCollection;
let followCollection;
let reportCollection;

async function connectToDB() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        if (!reactBootcampDB) {
            await client.connect();
            reactBootcampDB = client.db('reactBootcampDB');
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        }
        if (!userCollection) {
            userCollection = reactBootcampDB.collection('users');
        }
        if (!todoCollection) {
            todoCollection = reactBootcampDB.collection('todos');
        }
        if (!songsCollection) {
            songsCollection = reactBootcampDB.collection('songs');
        }
        if (!postCollection) {
            postCollection = reactBootcampDB.collection('posts');
        }
        if (!likeCollection) {
            likeCollection = reactBootcampDB.collection('likes');
        }
        if (!commentCollection) {
            commentCollection = reactBootcampDB.collection('comments');
        }
        if (!savedPostCollection) {
            savedPostCollection = reactBootcampDB.collection('save_posts');
        }
        if(!notificationCollection) {
            notificationCollection = reactBootcampDB.collection('notifications');
        }
        if(!followCollection) {
            followCollection = reactBootcampDB.collection('follows');
        }
        if(!reportCollection) {
            reportCollection = reactBootcampDB.collection('reports');
        }

        return {
            userCollection,
            todoCollection,
            songsCollection,
            postCollection,
            likeCollection,
            commentCollection,
            savedPostCollection,
            notificationCollection,
            followCollection,
            reportCollection,
        }
    }

    catch (error) {
        console.error(error);
        throw error;
    }

    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}


export default connectToDB;
