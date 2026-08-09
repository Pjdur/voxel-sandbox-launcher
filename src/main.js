const { invoke } = window.__TAURI__.core;
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

const singleplayerBtn = document.getElementById('btn-singleplayer');
const multiplayerBtn = document.getElementById('btn-multiplayer');

// Launch game in singleplayer mode
singleplayerBtn.addEventListener('click', () => {
  launchGame('singleplayer');
});

// Launch game in multiplayer mode
multiplayerBtn.addEventListener('click', () => {
  launchGame('multiplayer');
});

function launchGame(mode) {
  // Pass the mode as a query parameter in the URL
  const gameWindow = new WebviewWindow('game-window', {
    url: `game/index.html?mode=${mode}`,
    title: `Voxel Sandbox (${mode})`,
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