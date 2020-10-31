const { ipcRenderer } = require("electron");

const taskForm = document.querySelector("#taskForm");
const taskName = document.querySelector("#taskName");
const taskJob = document.querySelector("#taskJob");
const taskAddress = document.querySelector("#taskAddress");
const taskList = document.querySelector("#taskList");

let updateStatus = false;
let idTaskToUpdate = "";

function deleteTask(id) {
  const response = confirm("are you sure you want to delete it?");
  if (response) {
    ipcRenderer.send("delete-task", id);
  }
  return;
}

function editTask(id) {
  updateStatus = true;
  idTaskToUpdate = id;
  const task = tasks.find(task => task._id === id);
  taskName.value = task.name;
  taskJob.value = task.job;
  taskAddress.value = task.address;
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  console.log(tasks);
  tasks.map(t => {
    taskList.innerHTML += `
          <li class="card">
            <h4>
              Task id: ${t._id}
            </h4>
            <p>
              Task Name: ${t.name}
            </p>
            <p>
              Task Job: ${t.job}
            </p>
            <p>
              Task Address: ${t.address}
            </p>
            <button class="btn btn-danger" onclick="deleteTask('${t._id}')">
              🗑 Delete
            </button>
            <button class="btn btn-secondary" onclick="editTask('${t._id}')">
              ✎ Edit
            </button>
          </li>
        `;
  });
}

let tasks = [];

ipcRenderer.send("get-tasks");

taskForm.addEventListener("submit", async e => {
  e.preventDefault();

  const task = {
    name: taskName.value,
    job: taskJob.value,
    address: taskAddress.value
  };

  console.log(updateStatus);

  if (!updateStatus) {
    ipcRenderer.send("new-task", task);
  } else {
    ipcRenderer.send("update-task", { ...task, idTaskToUpdate });
  }

  taskForm.reset();
});

ipcRenderer.on("new-task-created", (e, arg) => {
  console.log(arg);
  const taskSaved = JSON.parse(arg);
  tasks.push(taskSaved);
  console.log(tasks);
  renderTasks(tasks);
  alert("Task Created Successfully");
  taskName.focus();
});

ipcRenderer.on("get-tasks", (e, args) => {
  const receivedTasks = JSON.parse(args);
  tasks = receivedTasks;
  renderTasks(tasks);
});

ipcRenderer.on("delete-task-success", (e, args) => {
  const deletedTask = JSON.parse(args);
  const newTasks = tasks.filter(t => {
    return t._id !== deletedTask._id;
  });
  tasks = newTasks;
  renderTasks(tasks);
});

ipcRenderer.on("update-task-success", (e, args) => {
  updateStatus = false;
  const updatedTask = JSON.parse(args);
  tasks = tasks.map((t, i) => {
    if (t._id === updatedTask._id) {
      t.name = updatedTask.name;
      t.job = updatedTask.job;
      t.address = updatedTask.address
    }
    return t;
  });
  renderTasks(tasks);
});
