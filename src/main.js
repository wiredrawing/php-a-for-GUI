const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron');
const path = require('node:path');
const exec = require('child_process').exec;
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

function handleSetTitle(event, title) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

function toMainProcess(event, message) {
  console.log("From Renderer Process: " + message)
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  webContents.send("to-renderer-process", message)
}



let phpPath = null;
let cwd = process.cwd();
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    title: "PHPインタラクティブシェル"
  });


  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })


  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // PHP実行ファイルが指定された場合の処理
  function selectPhpExecutable(event) {
    return dialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: 'ファイルを選択する',
      filters: [
        {
          name: 'PHP実行ファイルパス',
          extensions: ["exe"],
        },
      ],
    })
    .then((result) => {
      console.log("select php executable result: ==>", result);
      if (result.canceled) return;
      // ここでPHP実行ファイルのパスを取得する
      phpPath = result.filePaths[0];
    })
    .catch((err) => console.log(`Error: ${err}`));
  }
  ipcMain.handle("select-php-executable", selectPhpExecutable);

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {




  ipcMain.on('set-title', handleSetTitle)
  ipcMain.handle("to-main-process", function (event, message) {
    return "The message that you sent is: " + message;
  });
  ipcMain.handle("select-cwd", function (event) {
    // 現在操作中のブラウザobjectを取得する
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    return dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'ディレクトリを選択する',
    }).then((result) => {
      if (result.canceled) return;
      // ここでディレクトリのパスを取得する
      cwd = result.filePaths[0];
      console.log("cwd => ", cwd)
      return result.filePaths[0];
    }).catch((err) =>  {
      console.log(`Error: ${err}`)
    })
  });
  ipcMain.handle("execute-php", function (event, message) {
    const promise =  new Promise((resolve, reject) => {
      const fileNameExecuted = path.join(cwd, ".executed.php");
      message = "<?php " + message + " ?>";
      if (fs.existsSync(fileNameExecuted)) {
        fs.truncateSync(fileNameExecuted, 0)
        fs.writeFileSync(fileNameExecuted, message);
      } else {
        fs.writeFileSync(fileNameExecuted, message);
      }

      const outputResult = {}
      let selectedPHPPath = "";
      if (phpPath === null) {
        // 環境変数が設定されていることを前提に<php>コマンドを実行する
        selectedPHPPath = "php"
      } else {
        if (selectedPHPPath !== phpPath) {
          selectedPHPPath = phpPath
        }
      }
      console.log("selectedPHPPath => ", selectedPHPPath)
      console.log("cwd => ", cwd)
      return exec(selectedPHPPath + " " + fileNameExecuted, {
        // 実行ディレクトリを指定する
        cwd: cwd,
      },function (error, stdout, stderr) {
        if (error) {
          console.log("error.code ==> ", error.code)
          console.log("=============");
          console.log(error);
          console.log("##############")
          console.log("stderr", stderr, "=====")
          console.log("-------------");
          outputResult["stderr"] = formatResponseAsHtml(stderr)
          return resolve(outputResult)
          // return reject(new Error(stderr))
        } else {
          if (stderr) {
            outputResult["stderr"] = formatResponseAsHtml(stderr)
            return resolve(outputResult)
          }
          outputResult["stdout"] = formatResponseAsHtml(stdout)
          return resolve(outputResult)
        }
      });
    });
    return promise;
  });
  const mainWindow = createWindow();

  // GUI上のメニューバーを設定する
  const template = [
    {
      label: '設定',
      submenu: [
        {
          label: 'PHP実行ファイルを選択する',
          click: function () {
            return dialog
            .showOpenDialog(mainWindow, {
              properties: ['openFile'],
              title: 'ファイルを選択する',
              filters: [
                {
                  name: 'PHP実行ファイルパス',
                  extensions: ["exe"],
                },
              ],
            })
            .then((result) => {
              console.log("select php executable result: ==>", result);
              if (result.canceled) return;
              // ここでPHP実行ファイルのパスを取得する
              phpPath = result.filePaths[0];
              return phpPath
            }).then(function(data) {
              return mainWindow.webContents.send("completed-selecting-php-executable", data);
            })
            .catch((err) => console.log(`Error: ${err}`));
          }
        },
        {
          label: 'PHPの実行ディレクトリを選択する',
          click: function() {
            // 現在操作中のブラウザobjectを取得する
            return dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory'],
              title: 'ディレクトリを選択する',
            }).then((result) => {
              if (result.canceled) return;
              // ここでディレクトリのパスを取得する
              cwd = result.filePaths[0];
              console.log("cwd => ", cwd)
              return result.filePaths[0];
            }).then(function(data) {
              return mainWindow.webContents.send("completed-selecting-cwd", data);
            }).catch((err) =>  {
              console.log(`Error: ${err}`)
            })
          }
        },
        {
          label: 'Codeingter',
          click () { mainWindow.loadURL('https://www.kabanoki.net/category/codeingter'); }
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu:[
        {
          label: "検証ツール",
          click: function () {
            // Open the DevTools.
            mainWindow.webContents.openDevTools();
          }
        }
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// 指定した 引数の内容をHTMLとして表示したさい
// 平文と同じ見え方になるようにフォーマットする
function formatResponseAsHtml(message) {
  let temp = message
    .replace(/ /g, "&nbsp;")
    .replace(/　/g, "&emsp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  return temp.replace(/\r\n|\n/g, "<br>")
}
