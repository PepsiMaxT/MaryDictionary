const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

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

app.whenReady().then(async () => {
  await readInDictionary();
  await readInTags();
  ipcMain.handle('getDictionary', () => {return dictionary;});
  ipcMain.handle('getTags', () => {return tags;});
  ipcMain.handle('updateDictionary', (event, newDictionary) => {updateDictionary(newDictionary) }); 

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  writeDictionary();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function readInDictionary() { 
  const data = await fs.readFile(path.join(__dirname, "dictionary.txt"), 'utf8');
  fileLines = data.split('\n');

  fileLines.forEach((line) => {
    elements = line.split('|');

    originWords = elements[0].split(',');
    foreignWords = elements[1].split(',');
    definitionTags = (elements[3].length > 0) ? elements[3].split(',') : [];

    dictionary.push({origin: originWords, foreign: foreignWords, gender: elements[2], tags: definitionTags});
  });
}

async function readInTags() {
  const data = await fs.readFile(path.join(__dirname, "tags.txt"), 'utf8');
  tags = data.split('\n');
}

function updateDictionary(newDictionary) {
  dictionary = newDictionary;
}

async function writeDictionary() {
  let data = "";
  dictionary.forEach((entry) => {
    data += entry.origin.join(',') + '|' + entry.foreign.join(',') + '|' + entry.gender + '|' + entry.tags.join(',') + '\n';
  });
  data = data.slice(0, -1);
  await fs.writeFile(path.join(__dirname, "dictionary.txt"), data);
}