// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts



const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  sendEmail: (packet) => ipcRenderer.send('send-email', packet),
  toMainProcess: (message) => ipcRenderer.invoke('to-main-process', message),
  executePHP: (message) => ipcRenderer.invoke('execute-php', message),
  selectPHPExecutable: () => ipcRenderer.invoke('select-php-executable'),
  selectCwd: () => ipcRenderer.invoke('select-cwd'),
})

ipcRenderer.on("receive-email", (event, message) => {
  console.log(message);
});
