// Initialization and loading tasks from local storage
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    selectTodayInDropdown();
    updateSpecificDayTasks();
    checkDailyReset();
    checkWeeklyReset();
  });
  
  // Select today's day in the dropdown and update heading
  function selectTodayInDropdown() {
    const today = getToday();
    document.getElementById("day-selector").value = today;
    updateSpecificDayHeading(today);
  }
  
  function addTask(type) {
    const taskText = prompt("Enter a task:");
    if (!taskText) return;
  
    let task = { text: taskText, completed: false };
  
    if (type === "specific") {
      const selectedDay = document.getElementById("day-selector").value;
      task.day = selectedDay;
    }
  
    saveTask(type, task);
    displayTask(type, task);
  }
  
  function saveTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks.push(task);
    localStorage.setItem(type, JSON.stringify(tasks));
  }
  
  function loadTasks() {
    ["daily", "specific", "weekly", "oneTime"].forEach(type => {
      const tasks = JSON.parse(localStorage.getItem(type)) || [];
      tasks.forEach(task => displayTask(type, task));
    });
  }
  
  function displayTask(type, task) {
    const listId = {
      daily: "daily-tasks-list",
      specific: "specific-day-tasks-list",
      weekly: "weekly-tasks-list",
      oneTime: "one-time-tasks-list"
    }[type];
  
    const ul = document.getElementById(listId);
  
    // For specific day tasks, only display if it matches the selected day
    const selectedDay = document.getElementById("day-selector").value;
    if (type === "specific" && task.day !== selectedDay) return;
  
    const li = document.createElement("li");
  
    const taskText = document.createElement("span");
    taskText.classList.add("task-text");
    taskText.textContent = task.text;
  
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(type, task, li));
  
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => removeTask(type, task, li));
  
    li.appendChild(taskText);
    li.appendChild(checkbox);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  }
  
  function toggleTask(type, task, listItem) {
    task.completed = !task.completed;
  
    if (type === "oneTime" && task.completed) {
      listItem.remove();
      deleteTask(type, task);
    } else {
      updateTask(type, task);
    }
  
    listItem.style.textDecoration = task.completed ? "line-through" : "none";
    listItem.style.color = task.completed ? "green" : "black";
  }
  
  function updateTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    const index = tasks.findIndex(t => t.text === task.text);
    tasks[index] = task;
    localStorage.setItem(type, JSON.stringify(tasks));
  }
  
  function removeTask(type, task, listItem) {
    listItem.remove();
    deleteTask(type, task);
  }
  
  function deleteTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks = tasks.filter(t => t.text !== task.text);
    localStorage.setItem(type, JSON.stringify(tasks));
  }
  
  function getToday() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
  }
  
  function updateSpecificDayHeading(selectedDay) {
    document.getElementById("specific-day-heading").textContent = `${selectedDay} Tasks`;
  }
  
  // Updates tasks and heading when a new day is selected in the dropdown
  function updateSpecificDayTasks() {
    const selectedDay = document.getElementById("day-selector").value;
    updateSpecificDayHeading(selectedDay);
  
    // Clear the current specific day tasks list
    document.getElementById("specific-day-tasks-list").innerHTML = "";
  
    // Reload specific day tasks based on the new selection
    const specificTasks = JSON.parse(localStorage.getItem("specific")) || [];
    specificTasks.forEach(task => {
      if (task.day === selectedDay) {
        displayTask("specific", task);
      }
    });
  }
  
  function checkDailyReset() {
    const lastDailyReset = localStorage.getItem("lastDailyReset");
    const today = new Date().toDateString();
    if (lastDailyReset !== today) {
      localStorage.setItem("lastDailyReset", today);
      localStorage.setItem("daily", JSON.stringify([]));
      document.getElementById("daily-tasks-list").innerHTML = "";
    }
  }
  
  function checkWeeklyReset() {
    const lastWeeklyReset = localStorage.getItem("lastWeeklyReset");
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toDateString();
  
    if (lastWeeklyReset !== firstDayOfWeek) {
      localStorage.setItem("lastWeeklyReset", firstDayOfWeek);
      localStorage.setItem("weekly", JSON.stringify([]));
      document.getElementById("weekly-tasks-list").innerHTML = "";
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    selectTodayInDropdown();
    updateSpecificDayTasks();
    checkDailyReset();
    checkWeeklyReset();
  });
  
  // Add a new function for adding reminders
  function addReminder() {
    const reminderText = prompt("Enter a reminder:");
    if (!reminderText) return;
  
    const reminder = { text: reminderText };
    saveReminder(reminder);
    displayReminder(reminder);
  }
  
  function saveReminder(reminder) {
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    reminders.push(reminder);
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }
  
  function displayReminder(reminder) {
    const ul = document.getElementById("reminders-list");
    const li = document.createElement("li");
  
    const reminderText = document.createElement("span");
    reminderText.classList.add("task-text");
    reminderText.textContent = reminder.text;
  
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => removeReminder(reminder, li));
  
    li.appendChild(reminderText);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  }
  
  function loadTasks() {
    ["daily", "specific", "weekly", "oneTime", "reminders"].forEach(type => {
      const tasks = JSON.parse(localStorage.getItem(type)) || [];
      tasks.forEach(task => {
        if (type === "reminders") {
          displayReminder(task);
        } else {
          displayTask(type, task);
        }
      });
    });
  }
  
  // Removes reminder from DOM and localStorage
  function removeReminder(reminder, listItem) {
    listItem.remove();
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    reminders = reminders.filter(r => r.text !== reminder.text);
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }
  
  // Rest of the code for tasks...
  // (no changes needed here, just keep the task-related functions)
  