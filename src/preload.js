// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts



const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  executePHP: (message) => ipcRenderer.invoke('execute-php', message),
  // 一時ソース保存コマンド
  saveTempSource: function(soruceData) {
    return ipcRenderer.invoke("save-temp-source", soruceData);
  },
  showNotificationMessage: function(message) {
    return ipcRenderer.invoke("show-notification-message", message);
  },
  selectPHPExecutable: () => ipcRenderer.invoke('select-php-executable'),
  selectCwd: () => ipcRenderer.invoke('select-cwd'),
  completedSelectingPHPExecutable: (callback) => ipcRenderer.on('completed-selecting-php-executable', function (event, path) {
    console.log("completedSelectingPHPExecutable: ", path);
    return callback(event, path);
  }),
  completedSelectingCwd: (callback) => ipcRenderer.on('completed-selecting-cwd', function (event, path) {
    console.log("completedSelectingCwd: ", path);
    return callback(event, path);
  }),
  // ---------------------------------------------------------------------
  // バックグラウンドで実行されたPHPコマンドの実行結果を適当なサイズのパケットとして
  // main.jsから取得してくる
  // ---------------------------------------------------------------------
  fetchPacketsExecutedResult: (callback) => ipcRenderer.on('fetch-packets-executed-result', function (event, packet) {
    console.log("event named fetch-packets-executed-result ===> ", packet);
    return callback(event, packet);
  }),
  fetchErrorPacketsExecutedResult: (callback) => ipcRenderer.on('fetch-error-packets-executed-result', function (event, packet) {
    console.log("event named fetch-error-packets-executed-result ===> ", packet);
    return callback(event, packet);
  }),
})
