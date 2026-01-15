// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts



const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  // サブウィンドウで入力して、実行した実行結果をメインウインドウへ送信する処理
  sendingResultToMainWindow: function (result) {
    return ipcRenderer.invoke('sending-executed-result', result);
  },
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
  displayingExecutedResult: function (callback) {
    ipcRenderer.on("displaying-executed-result", function(event, result) {
      return callback(event, result);
    });
  },
})
