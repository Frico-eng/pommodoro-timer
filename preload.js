const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  timerFinished: (mode) => ipcRenderer.send('timer-finished', mode),
  updateTrayTitle: (title) => ipcRenderer.send('update-tray-title', title),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});