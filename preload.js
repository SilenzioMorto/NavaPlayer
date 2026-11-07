'use strict';
/* Nava Player — Copyright (c) 2026 Silenzio Morto. All rights reserved. */
const { contextBridge, ipcRenderer, webUtils } = require('electron');
const on = ch => cb => { const f = (e, d) => cb(d); ipcRenderer.on(ch, f); return () => ipcRenderer.removeListener(ch, f); };
const inv = (ch, ...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('nava', {
  app: {
    info: () => inv('app:info'), ready: () => ipcRenderer.send('app:ready'), status: s => ipcRenderer.send('splash:status', s),
    closeAction: (a, remember) => inv('app:closeAction', a, remember), quitNow: () => inv('app:quitNow'),
    getCfg: () => inv('app:getCfg'), setCfg: (k, v) => inv('app:setCfg', k, v), autostart: v => inv('app:autostart', v),
    tray: labels => inv('app:tray', labels), open: url => inv('app:open', url), openPath: p => inv('app:openPath', p),
    onCloseRequest: on('app:close-request'), onCmd: on('cmd')
  },
  lib: {
    get: () => inv('lib:get'), scan: () => inv('lib:scan'), addFolder: t => inv('lib:addFolder', t), removeFolder: f => inv('lib:removeFolder', f),
    setAllDrives: v => inv('lib:setAllDrives', v), openFiles: () => inv('lib:openFiles'), addPaths: p => inv('lib:addPaths', p),
    reveal: p => inv('lib:reveal', p), setMeta: (p, m) => inv('lib:setMeta', p, m),
    onLibrary: on('library'), onScan: on('scan:progress'), onOpen: on('open:tracks')
  },
  win: { overlay: o => inv('win:overlay', o), fullscreen: () => inv('win:fullscreen'), onFs: on('win:fs') },
  ai: { status: () => inv('ai:status'), setup: w => inv('ai:setup', w), onProgress: on('ai:progress') },
  lyrics: {
    get: t => inv('lyrics:get', t), del: t => inv('lyrics:delete', t), clearAll: () => inv('lyrics:clearAll'),
    transcribe: job => inv('lyrics:transcribe', job), chooseDir: t => inv('lyrics:chooseDir', t), setDefaultDir: () => inv('lyrics:setDefaultDir'),
    openDir: () => inv('lyrics:openDir'), onProgress: on('lyrics:progress')
  },
  link: { probe: u => inv('link:probe', u) },
  pathOf: file => { try { return webUtils.getPathForFile(file); } catch (e) { return ''; } }
});
