# Voxel Sandbox

A block-building sandbox game with a custom launcher and multiplayer support.

## What is this?

Voxel Sandbox is a 3D block game (like Minecraft) built from scratch using JavaScript and Three.js. It comes with a launcher app made with Tauri, and a fast background server powered by Bun so you can play with friends.

## Features

- **Singleplayer:** Play offline and build on your own.
- **Multiplayer:** Automatically starts a local server to sync blocks and player positions.
- **Play on Wi-Fi (LAN):** Other people on your home Wi-Fi can join your world using a browser like Chrome or Edge—no installation needed for them!
- **World Saves:** World changes are saved automatically so you don't lose your builds.

## Setup & Running

### 1. Requirements

Make sure you have these installed on your PC:

- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/)

### 2. Install

Clone the project and install dependencies:

```bash
git clone https://github.com/Pjdur/voxel-sandbox-launcher
cd voxel-sandbox-launcher
npm install
```

### 3. Build the Server Binary

Open the `server` folder and compile the server executable:

```bash
cd server
bun build ./server.js --compile --outfile voxel-server
cd ..
```

Move the compiled binary into `src-tauri/bin/` and rename it to:
`voxel-server-x86_64-pc-windows-msvc.exe`

### 4. Start the Game

Run the launcher:

```bash
npm run tauri dev
```

## How to Play with Friends on Wi-Fi

1. Start the launcher with network sharing enabled:

```bash
npm run tauri dev -- --host
```

2. Start a multiplayer world in your app.
3. Find your PC's local IP address (using `ipconfig` in terminal).
4. Have your friend open Chrome/Edge (or any browser) on their device and go to:
   `http://<YOUR_IP>:5173/game/index.html?mode=multiplayer&world=WorldName&port=8080&host=<YOUR_IP>`
