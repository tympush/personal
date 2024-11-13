// Initialization and loading tasks from local storage
document.addEventListener("DOMContentLoaded", () => {
    resetTaskCompletionStatus();
    loadTasks();
    loadReminders();
    selectTodayInDropdown();
    updateSpecificDayTasks();
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

// Reset task completion statuses based on date and type
function resetTaskCompletionStatus() {
    // Check each type of tasks and reset completion if needed
    ["daily", "specific", "weekly"].forEach(type => {
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        tasks = tasks.map(task => {
            if (task.completed && task.completedDate) {
                const taskDate = new Date(task.completedDate);
                const currentDate = new Date();
                const dayOfWeek = currentDate.getDay(); // 0-6 where 0 is Sunday

                if (type === "daily" && !isSameDay(taskDate, currentDate)) {
                    task.completed = false;
                    task.completedDate = null;
                } else if (type === "specific" && task.day !== getToday()) {
                    task.completed = false;
                    task.completedDate = null;
                } else if (type === "weekly" && dayOfWeek === 1 && !isSameWeek(taskDate, currentDate)) {
                    task.completed = false;
                    task.completedDate = null;
                }
            }
            return task;
        });
        localStorage.setItem(type, JSON.stringify(tasks));
    });
}

// Helper to check if two dates are the same calendar day
function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

// Helper to check if two dates are in the same week (from Sunday to Saturday)
function isSameWeek(date1, date2) {
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(date2.getDate() - date2.getDay()); // Start of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // End of the week (Saturday)
    return date1 >= startOfWeek && date1 <= endOfWeek;
}

function addTask(type) {
    const taskText = prompt("Enter a task:");
    if (!taskText) return;

    let task = { text: taskText, completed: false, completedDate: null };

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
    ["daily", "specific", "weekly", "oneTime", "longTerm"].forEach(type => {
        const tasks = JSON.parse(localStorage.getItem(type)) || [];
        tasks.forEach(task => displayTask(type, task));
    });
}

function displayTask(type, task) {
    const listId = {
        daily: "daily-tasks-list",
        specific: "specific-day-tasks-list",
        weekly: "weekly-tasks-list",
        oneTime: "one-time-tasks-list",
        longTerm: "long-term-goals-list"
    }[type];

    const ul = document.getElementById(listId);
    const selectedDay = document.getElementById("day-selector").value;
    if (type === "specific" && task.day !== selectedDay) return;

    const li = document.createElement("li");
    li.draggable = true;  // Make list item draggable
    li.classList.add("draggable-task");
    li.dataset.taskText = task.text;  // Store task text for drag identification

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

    // Append elements in the new order: task text, checkbox, remove button
    li.appendChild(taskText);
    li.appendChild(checkbox);
    li.appendChild(removeBtn);
    ul.appendChild(li);

    // Event listeners for drag-and-drop
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", (e) => handleDrop(e, type));
    li.addEventListener("dragend", handleDragEnd);

    setTimeout(() => li.classList.add("fade-in"), 10);
}

// Handle drag start event
function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.taskText);
    e.target.classList.add("dragging");
}

// Handle drag over event
function handleDragOver(e) {
    e.preventDefault();  // Necessary to allow drop
    const draggingItem = document.querySelector(".dragging");
    if (e.target.classList.contains("draggable-task") && e.target !== draggingItem) {
        const ul = e.target.closest("ul");
        ul.insertBefore(draggingItem, e.target.nextSibling); // Insert above or below
    }
}

// Handle drop event to reorder tasks
function handleDrop(e, type) {
    e.preventDefault();
    const droppedTaskText = e.dataTransfer.getData("text/plain");
    reorderTasksInLocalStorage(type, droppedTaskText);
}

// Handle drag end to remove styling
function handleDragEnd(e) {
    e.target.classList.remove("dragging");
}

// Reorder tasks in local storage after drag-and-drop
function reorderTasksInLocalStorage(type, draggedTaskText) {
    const ul = document.getElementById({
        daily: "daily-tasks-list",
        specific: "specific-day-tasks-list",
        weekly: "weekly-tasks-list",
        oneTime: "one-time-tasks-list",
        longTerm: "long-term-goals-list"
    }[type]);

    const reorderedTasks = Array.from(ul.children).map(li => ({
        text: li.querySelector(".task-text").textContent,
        completed: li.classList.contains("checked"),
        day: li.dataset.day
    }));

    localStorage.setItem(type, JSON.stringify(reorderedTasks));
}




// Function to move a task up or down in the list
function moveTask(type, task, listItem, direction) {
    const ul = listItem.parentNode;
    const tasks = JSON.parse(localStorage.getItem(type)) || [];
    const index = Array.from(ul.children).indexOf(listItem);
    
    if (direction === "up" && index > 0) {
        ul.insertBefore(listItem, ul.children[index - 1]);
        [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]]; // Swap in tasks array
    } else if (direction === "down" && index < ul.children.length - 1) {
        ul.insertBefore(listItem, ul.children[index + 2] || null);
        [tasks[index + 1], tasks[index]] = [tasks[index], tasks[index + 1]]; // Swap in tasks array
    }
    
    // Update the task order in localStorage
    localStorage.setItem(type, JSON.stringify(tasks));
}



function removeTask(type, task, listItem) {
    // Show confirmation popup only for "longTerm" goals
    if (type === "longTerm") {
        showDeleteConfirmation(() => {
            listItem.classList.add("fade-out");
            setTimeout(() => {
                listItem.remove(); // Remove from DOM
                deleteTask(type, task); // Remove from localStorage
            }, 300); // Match duration with CSS transition time
        });
    } else {
        // Normal delete for other task types without confirmation
        listItem.classList.add("fade-out");
        setTimeout(() => {
            listItem.remove();
            deleteTask(type, task);
        }, 300);
    }
}

function toggleTask(type, task, listItem) {
    task.completed = !task.completed;
    task.completedDate = task.completed ? new Date().toISOString() : null;

    if (type === "oneTime" && task.completed) {
        listItem.classList.add("fade-out");
        setTimeout(() => {
            listItem.remove();
            deleteTask(type, task);
        }, 1500);
    } else if (type === "longTerm") {
        updateTask(type, task);
    } else {
        updateTask(type, task);
    }

    if (task.completed) {
        listItem.classList.add("checked");
        listItem.style.color = "#8bde64";
    } else {
        listItem.classList.remove("checked");
        listItem.style.color = "#d3d3d3";
    }
}

function updateTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    const index = tasks.findIndex(t => t.text === task.text && t.day === task.day);
    if (index !== -1) {
        tasks[index] = task;
    } else {
        tasks.push(task);
    }
    localStorage.setItem(type, JSON.stringify(tasks));
}

function deleteTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks = tasks.filter(t => t.text !== task.text || (task.day && t.day !== task.day));
    localStorage.setItem(type, JSON.stringify(tasks));
}

function updateSpecificDayHeading(day) {
    document.getElementById("specific-day-heading").textContent = `Tasks for ${day}`;
}

// Updates tasks and heading when a new day is selected in the dropdown
function updateSpecificDayTasks() {
    const selectedDay = document.getElementById("day-selector").value;
    updateSpecificDayHeading(selectedDay);

    document.getElementById("specific-day-tasks-list").innerHTML = "";

    const specificTasks = JSON.parse(localStorage.getItem("specific")) || [];
    specificTasks.forEach(task => {
        if (task.day === selectedDay) {
            displayTask("specific", task);
        }
    });
}