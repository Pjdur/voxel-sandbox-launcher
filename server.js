const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- 1. Parse Command Line Arguments ---
let port = 8080;
let worldName = 'default';

// Process args
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--port' && process.argv[i+1]) {
        port = parseInt(process.argv[i+1], 10);
    }
    if (process.argv[i] === '--world' && process.argv[i+1]) {
        worldName = process.argv[i+1];
    }
}

// Add extension if missing
if (!worldName.endsWith('.json')) {
    worldName += '.json';
}

// --- 2. Setup Worlds Directory ---
const WORLDS_DIR = path.join(os.homedir(), 'Worlds');
if (!fs.existsSync(WORLDS_DIR)) {
    fs.mkdirSync(WORLDS_DIR, { recursive: true });
    console.log(`Created Worlds directory at: ${WORLDS_DIR}`);
}

const WORLD_FILE = path.join(WORLDS_DIR, worldName);
console.log(`Using world file: ${WORLD_FILE}`);

// --- 3. Setup WebSocket Server ---
const wss = new WebSocket.Server({ port: port });
const clients = new Map();

let worldModifications = {}; 
let worldHasChanged = false;

if (fs.existsSync(WORLD_FILE)) {
    try {
        const data = fs.readFileSync(WORLD_FILE, 'utf8');
        worldModifications = JSON.parse(data);
        console.log(`Loaded ${Object.keys(worldModifications).length} block modifications from ${worldName}`);
    } catch (err) {
        console.error(`Error reading ${worldName}:`, err);
    }
} else {
    console.log(`No existing ${worldName} found. Starting fresh.`);
}

// Auto-Save Loop
setInterval(() => {
    if (worldHasChanged) {
        fs.writeFile(WORLD_FILE, JSON.stringify(worldModifications), (err) => {
            if (err) console.error("Failed to save world:", err);
        });
        worldHasChanged = false;
    }
}, 5000); 

wss.on('connection', (ws) => {
    const playerId = Date.now();
    clients.set(ws, { id: playerId });

    ws.send(JSON.stringify({ type: 'init', blocks: worldModifications }));
    broadcastPlayerCount();

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            broadcast(ws, { type: 'move', id: playerId, x: data.x, y: data.y, z: data.z, quaternion: data.quaternion });
        } else if (data.type === 'blockUpdate') {
            worldModifications[`${data.x},${data.y},${data.z}`] = data.blockType;
            worldHasChanged = true;
            broadcast(ws, { type: 'blockUpdate', x: data.x, y: data.y, z: data.z, blockType: data.blockType });
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        broadcast(null, { type: 'disconnect', id: playerId });
        broadcastPlayerCount(); 
    });
});

function broadcastPlayerCount() {
    broadcast(null, { type: 'playerCount', count: wss.clients.size });
}

function broadcast(sender, data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== sender) {
            client.send(JSON.stringify(data));
        }
    });
}

process.on('SIGINT', () => {
    if (worldHasChanged) {
        console.log("Saving world before shutdown...");
        fs.writeFileSync(WORLD_FILE, JSON.stringify(worldModifications));
    }
    process.exit();
});

console.log(`Multiplayer server running on ws://localhost:${port}`);
