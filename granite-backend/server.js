// This will contain the Node.js + WebSocket + IBM API logic.
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Allow React dev server to connect
});

app.get('/', (req, res) => {
    res.send('Granite 3.3 Node.js backend is running');
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('generate', async (data) => {
        try {
            const response = await fetch(process.env.IBM_MODEL_URL, {   // replace process.env.IBM_MODEL_URL with  IBM Granite endpoint
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.IBM_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: data.prompt,
                    max_tokens: 200
                })
            });

            const result = await response.json();

            // Send result back to the client
            socket.emit('result', result);
        } catch (error) {
            console.error('Error:', error);
            socket.emit('error', 'Failed to get response from Granite model');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Backend running on http://localhost:3000');
});
