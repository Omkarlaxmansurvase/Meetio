import express from 'express';
import {createServer} from 'node:http';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectToSocket } from './controllers/socketManager.js';
import userRoutes from './routes/users.routes.js'; 


const app = express();
const server = createServer(app);
const io = connectToSocket(server); 
const DATABASE_URL = process.env.DATABASE_URL;

app.set("port",process.env.PORT || 4000);
app.use(cors());
app.use(express.json({limit: '504kb'}));
app.use(express.urlencoded({ extended: true, limit: '504kb' }));

app.use("/api/v1/users", userRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(DATABASE_URL || "mongodb+srv://meetio:meetiopassword@cluster0.x9ijkzp.mongodb.net/?appName=Cluster0");
        console.log('Connected to database:', connectionDb.connection.name);
        
        server.listen(app.get("port"), () => {
            console.log('Server is running on http://localhost:' + app.get("port"));
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();