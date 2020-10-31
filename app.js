const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
require('./database');
const Task = require("./models/Task");


let win;
function createWindow() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            
        }
    });

    win.loadFile('index.html');

    // winOne.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    })
}

ipcMain.on("new-task", async (e, arg) => {
  const newTask = new Task(arg);
  const taskSaved = await newTask.save();
  console.log(taskSaved);
  e.reply("new-task-created", JSON.stringify(taskSaved));
});

ipcMain.on("get-tasks", async (e, arg) => {
  const tasks = await Task.find();
  e.reply("get-tasks", JSON.stringify(tasks));
});

ipcMain.on("delete-task", async (e, args) => {
  const taskDeleted = await Task.findByIdAndDelete(args);
  e.reply("delete-task-success", JSON.stringify(taskDeleted));
});

ipcMain.on("update-task", async (e, args) => {
  console.log(args);
  const updatedTask = await Task.findByIdAndUpdate(
    args.idTaskToUpdate,
    { name: args.name, job: args.job, address: args.address },
    { new: true }
  );
  e.reply("update-task-success", JSON.stringify(updatedTask));
});

app.on('ready', createWindow);

app.on('window-all-closed', ()=> {
    if(process.platform !== 'darwin'){
        app.quit()
    }    
});



// app.whenReady().then(createWindow);
// app.allowRendererProcessReuse = false 