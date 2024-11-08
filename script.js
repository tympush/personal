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
    if (task.completed) {
        li.classList.add("checked"); // Add the checked class for completed tasks
    }

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

    // Append the task item (it will start with opacity 0)
    ul.appendChild(li);

    // Trigger fade-in by adding the .fade-in class after a slight delay
    setTimeout(() => {
        li.classList.add("fade-in");
    }, 10); // Small timeout to ensure the element is rendered before starting the fade-in
}

function toggleTask(type, task, listItem) {
    task.completed = !task.completed;

    // If it's a one-time task and it's completed, remove it
    if (type === "oneTime" && task.completed) {
        listItem.remove();
        deleteTask(type, task);
    } else {
        updateTask(type, task);
    }

    // Update the styling of the task
    if (task.completed) {
        listItem.classList.add("checked");  // Add "checked" class for completed task

        listItem.style.color = "#8bde64";  // Set the green color for completed task
    } else {
        listItem.classList.remove("checked");  // Remove "checked" class for uncompleted task

        listItem.style.color = "#d3d3d3";  // Set the original color for uncompleted task
    }
}

function updateTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    const index = tasks.findIndex(t => t.text === task.text && t.day === task.day); // Match day too
    if (index !== -1) {
        tasks[index] = task; // Update the task
    } else {
        tasks.push(task); // In case it's a new task
    }
    localStorage.setItem(type, JSON.stringify(tasks));
}

function removeTask(type, task, listItem) {
    // Apply fade-out effect by adding the class
    listItem.classList.add("fade-out");

    // After the fade-out transition ends, remove the task from the DOM and localStorage
    setTimeout(() => {
        listItem.remove(); // Remove from DOM
        deleteTask(type, task); // Remove from localStorage
    }, 300); // Match this duration with the CSS transition time
}

function deleteTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks = tasks.filter(t => t.text !== task.text || (task.day && t.day !== task.day)); // Remove based on day as well
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
    listItem.remove(); // Remove the reminder from the list on the UI

    // Get current reminders from localStorage
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    // Filter out the reminder to be removed
    reminders = reminders.filter(r => r.text !== reminder.text);

    // Save the updated reminders back to localStorage
    localStorage.setItem("reminders", JSON.stringify(reminders));
}

function updateSpecificDayHeading(day) {
    document.getElementById("specific-day-heading").textContent = `Tasks for ${day}`;
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
