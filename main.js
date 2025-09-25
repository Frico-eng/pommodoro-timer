const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  // Calculate window size based on screen size
  const windowWidth = Math.min(1000, screenWidth * 0.9);
  const windowHeight = Math.min(700, screenHeight * 0.85);
  
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    resizable: true,
    maximizable: true,
    center: true
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Center the window
    mainWindow.center();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Handle window resize
  mainWindow.on('resize', () => {
    // You can add resize handling logic here if needed
  });

  createTray();
}

// ... rest of main.js remains the same

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  
  if (trayIcon.isEmpty()) {
    // Fallback: create a simple icon programmatically
    const canvas = require('electron').nativeImage.createEmpty();
    // You'd want to create a proper icon here
  }

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Pomodoro Timer');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

// IPC handlers for timer notifications
ipcMain.on('timer-finished', (event, mode) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    
    // Flash the taskbar icon (Windows)
    mainWindow.flashFrame(true);
    setTimeout(() => mainWindow.flashFrame(false), 3000);
  }
  
  // Show notification
  if (process.platform === 'darwin') {
    // macOS notification
    require('electron').Notification.showNotification({
      title: 'Pomodoro Timer',
      subtitle: `${mode} session completed`,
      body: mode === 'work' ? 'Time for a break!' : 'Back to work!'
    });
  }
});

ipcMain.on('update-tray-title', (event, title) => {
  if (tray) {
    tray.setToolTip(title);
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', (event) => {
  event.preventDefault(); // Prevent app from quitting when window is closed
});

app.on('before-quit', () => {
  isQuitting = true;
});

