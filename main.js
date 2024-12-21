const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let dictionary = [];
let tags = [];

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  readInDictionary();
  readInTags();
  ipcMain.handle('getDictionary', () => dictionary);
  ipcMain.handle('getTags', () => tags);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function readInDictionary() {

}

function readInTags() {
  
}