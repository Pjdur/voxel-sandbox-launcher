const { invoke } = window.__TAURI__.core;
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Command } from '@tauri-apps/plugin-shell'; // Assumes Tauri v2 (use @tauri-apps/api/shell for v1)

const singleplayerBtn = document.getElementById('btn-singleplayer');
const multiplayerBtn = document.getElementById('btn-multiplayer');
const mainMenu = document.getElementById('main-menu');
const worldMenu = document.getElementById('world-menu');
const backBtn = document.getElementById('btn-back');
const createWorldBtn = document.getElementById('btn-create-world');
const newWorldInput = document.getElementById('new-world-input');
const worldMenuTitle = document.getElementById('world-menu-title');

let selectedMode = '';

// Switch to World Menu for Singleplayer
singleplayerBtn.addEventListener('click', () => {
  selectedMode = 'singleplayer';
  worldMenuTitle.innerText = 'Singleplayer Worlds';
  mainMenu.style.display = 'none';
  worldMenu.style.display = 'block';
});

// Switch to World Menu for Multiplayer
multiplayerBtn.addEventListener('click', () => {
  selectedMode = 'multiplayer';
  worldMenuTitle.innerText = 'Multiplayer Worlds (Server)';
  mainMenu.style.display = 'none';
  worldMenu.style.display = 'block';
});

// Go Back
backBtn.addEventListener('click', () => {
  worldMenu.style.display = 'none';
  mainMenu.style.display = 'block';
});

// Launch Game / Server
createWorldBtn.addEventListener('click', async () => {
  let worldName = newWorldInput.value.trim();
  if (!worldName) worldName = 'default';
  
  const port = 8080; // Default port, could be dynamic in the future

  if (selectedMode === 'multiplayer') {
    try {
      // Spawn the bun sidecar executable
      // Note: The sidecar name must match tauri.conf.json exactly, e.g., 'voxel-server'
      const command = Command.sidecar('bin/voxel-server', [
        '--port', port.toString(),
        '--world', worldName
      ]);
      await command.spawn();
      console.log(`Server sidecar spawned on port ${port} for world ${worldName}`);
    } catch (e) {
      console.error('Failed to start the multiplayer server:', e);
    }
  }

  launchGame(selectedMode, worldName, port);
});

function launchGame(mode, worldName, port) {
  // Pass all data as query parameters so the game file can detect it
  const gameWindow = new WebviewWindow('game-window', {
    url: `game/index.html?mode=${mode}&world=${encodeURIComponent(worldName)}&port=${port}`,
    title: `Voxel Sandbox (${mode}) - ${worldName}`,
    width: 1280,
    height: 720,
    center: true,
    fullscreen: false,
  });

  gameWindow.once('tauri://created', () => {
    console.log(`Game window launched in ${mode} mode!`);
  });

  gameWindow.once('tauri://error', (e) => {
    console.error('Error opening game window:', e);
  });
}
