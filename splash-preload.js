'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('splash', {
  onStatus: cb => ipcRenderer.on('splash:status', (e, s) => cb(s)),
  onDone: cb => ipcRenderer.on('splash:done', () => cb())
});
