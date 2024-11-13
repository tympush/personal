document.addEventListener("DOMContentLoaded", () => {
    resetTaskCompletionStatus();
    selectTodayInDropdown();
    loadTasks();
});

function selectTodayInDropdown() {
    const today = getToday();
    document.getElementById("daily-specific-day-selector").value = today;
}

function getToday() {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[today.getDay()];
}

function resetTaskCompletionStatus() {
    ["daily", "weekly"].forEach(type => {
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        tasks = tasks.map(task => {
            if (task.completed && task.completedDate) {
                const taskDate = new Date(task.completedDate);
                const currentDate = new Date();
                const dayOfWeek = currentDate.getDay();

                if (type === "daily" && task.day === null && !isSameDay(taskDate, currentDate)) {
                    task.completed = false;
                    task.completedDate = null;
                } else if (type === "daily" && task.day !== null && task.day !== getToday()) {
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

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

function isSameWeek(date1, date2) {
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(date2.getDate() - date2.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return date1 >= startOfWeek && date1 <= endOfWeek;
}

function addTask(type, specificDayCkeck) {
    const taskText = prompt("Enter a task:");
    if (!taskText) return;

    let task = { text: taskText, completed: false, completedDate: null, day: null};

    if (specificDayCkeck === true) {
        const selectedDay = document.getElementById("daily-specific-day-selector").value;
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
    ["daily", "weekly", "oneTime"].forEach(type => {
        const tasks = JSON.parse(localStorage.getItem(type)) || [];
        tasks.forEach(task => displayTask(type, task));
    });
}

function displayTask(type, task) {
    const listId = {
        daily: "daily-specific-tasks-list",
        weekly: "weekly-tasks-list",
        oneTime: "one-time-tasks-list",
    }[type];

    const ul = document.getElementById(listId);
    const selectedDay = document.getElementById("daily-specific-day-selector").value;

    if (type === "daily" && task.day !== null){
        if (task.day !== selectedDay) return;
    };

    const li = document.createElement("li");
    li.draggable = true;
    li.classList.add("draggable-task");
    li.dataset.taskText = task.text;

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

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", (e) => handleDrop(e, type));
    li.addEventListener("dragend", handleDragEnd);

    setTimeout(() => li.classList.add("fade-in"), 10);
}

function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.taskText);
    e.target.classList.add("dragging");
}

function handleDragOver(e) {
    e.preventDefault();  // Necessary to allow drop
    const draggingItem = document.querySelector(".dragging");
    if (e.target.classList.contains("draggable-task") && e.target !== draggingItem) {
        const ul = e.target.closest("ul");
        ul.insertBefore(draggingItem, e.target.nextSibling); // Insert above or below
    }
}

function handleDrop(e, type) {
    e.preventDefault();
    const droppedTaskText = e.dataTransfer.getData("text/plain");
    reorderTasksInLocalStorage(type, droppedTaskText);
}

function handleDragEnd(e) {
    e.target.classList.remove("dragging");
}

function reorderTasksInLocalStorage(type, draggedTaskText) {
    const ul = document.getElementById({
        daily: "daily-specific-day-tasks-lis",
        weekly: "weekly-tasks-list",
        oneTime: "one-time-tasks-list",
    }[type]);

    const reorderedTasks = Array.from(ul.children).map(li => ({
        text: li.querySelector(".task-text").textContent,
        completed: li.classList.contains("checked"),
        day: li.dataset.day
    }));

    localStorage.setItem(type, JSON.stringify(reorderedTasks));
}

function moveTask(type, task, listItem, direction) {
    const ul = listItem.parentNode;
    const tasks = JSON.parse(localStorage.getItem(type)) || [];
    const index = Array.from(ul.children).indexOf(listItem);
    
    if (direction === "up" && index > 0) {
        ul.insertBefore(listItem, ul.children[index - 1]);
        [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
    } else if (direction === "down" && index < ul.children.length - 1) {
        ul.insertBefore(listItem, ul.children[index + 2] || null);
        [tasks[index + 1], tasks[index]] = [tasks[index], tasks[index + 1]];
    }
    
    localStorage.setItem(type, JSON.stringify(tasks));
}

function removeTask(type, task, listItem) {
    listItem.classList.add("fade-out");
    setTimeout(() => {
        listItem.remove();
        deleteTask(type, task);
    }, 300);
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

function updateDailySpecificTasks() {
    const selectedDay = document.getElementById("daily-specific-day-selector").value;

    document.getElementById("daily-specific-tasks-list").innerHTML = "";

    const specificTasks = JSON.parse(localStorage.getItem("daily")) || [];
    specificTasks.forEach(task => {
        if (task.day === selectedDay || task.day === null) {
            displayTask("daily", task);
        }
    });
}