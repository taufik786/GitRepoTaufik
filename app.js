const { BrowserWindow, ipcMain } = require("electron");
const { app } = require('electron')

require('./database');

const Task = require("./models/Task");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile("index.html");
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

module.exports = { createWindow };


app.whenReady().then(createWindow);
app.allowRendererProcessReuse = false 