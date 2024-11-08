// Initialization and loading tasks from local storage
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    loadReminders();
    selectTodayInDropdown();
    updateSpecificDayTasks();
    checkDailyReset();
    checkWeeklyReset();
  });
  
  // Select today's day in the dropdown and update heading
  function selectTodayInDropdown() {
    const today = getToday();
    document.getElementById("day-selector").value = today;  // Set dropdown to today
    updateSpecificDayHeading(today);
  }
  
  // Get the current day of the week (e.g., 'Monday', 'Tuesday')
  function getToday() {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[today.getDay()]; // Get the current day (0-6), map it to a name
  }
  
  function addTask(type) {
    const taskText = prompt("Enter a task:");
    if (!taskText) return;
  
    let task = { text: taskText, completed: false };
  
    if (type === "specific") {
      const selectedDay = document.getElementById("day-selector").value;
      task.day = selectedDay;  // Save task with specific day
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
    // Load tasks from localStorage for all types
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
    if (type === "specific" && task.day !== selectedDay) return; // Filter tasks for the selected day
  
    const li = document.createElement("li");
    if (task.completed) li.classList.add("checked");
  
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
  
    // Update the styling of the task
    listItem.style.textDecoration = task.completed ? "line-through" : "none";
    listItem.style.color = task.completed ? "#8bde64" : "#d3d3d3"; // Green for completed tasks
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
  
  function addReminder() {
    const reminderText = prompt("Enter a reminder:");
    if (!reminderText) return;
  
    let reminder = { text: reminderText };
  
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    reminders.push(reminder);
    localStorage.setItem("reminders", JSON.stringify(reminders));
  
    displayReminder(reminder);
  }
  
  function loadReminders() {
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    reminders.forEach(reminder => displayReminder(reminder));
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
  
  function removeReminder(reminder, listItem) {
    listItem.remove();
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    reminders = reminders.filter(r => r !== reminder);
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }
  
  function updateSpecificDayHeading(day) {
    document.getElementById("specific-day-heading").textContent = `Tasks for ${day}`;
  }
  