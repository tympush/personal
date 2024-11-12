document.addEventListener("DOMContentLoaded", () => {
    resetTaskCompletionStatus(); loadTasks(); loadReminders(); selectTodayInDropdown(); updateSpecificDayTasks();
});

function selectTodayInDropdown() {
    const today = getToday();
    document.getElementById("day-selector").value = today;
    updateSpecificDayHeading(today);
}

function getToday() {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

function resetTaskCompletionStatus() {
    ["daily", "specific", "weekly"].forEach(type => {
        let tasks = JSON.parse(localStorage.getItem(type)) || [];
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay();

        tasks = tasks.map(task => {
            if (task.completed && task.completedDate) {
                const taskDate = new Date(task.completedDate);
                if (type === "daily" && !isSameDay(taskDate, currentDate)) {
                    task.completed = task.completedDate = null;
                } else if (type === "specific" && task.day !== getToday()) {
                    task.completed = task.completedDate = null;
                } else if (type === "weekly" && dayOfWeek === 1 && !isSameWeek(taskDate, currentDate)) {
                    task.completed = task.completedDate = null;
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

function addTask(type) {
    const taskText = prompt("Enter a task:");
    if (!taskText) return;
    const task = { text: taskText, completed: false, completedDate: null };
    if (type === "specific") task.day = document.getElementById("day-selector").value;
    saveTask(type, task); displayTask(type, task);
}

function saveTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks.push(task);
    localStorage.setItem(type, JSON.stringify(tasks));
}

function loadTasks() {
    ["daily", "specific", "weekly", "oneTime", "longTerm"].forEach(type => {
        (JSON.parse(localStorage.getItem(type)) || []).forEach(task => displayTask(type, task));
    });
}

function displayTask(type, task) {
    const listId = { daily: "daily-tasks-list", specific: "specific-day-tasks-list", weekly: "weekly-tasks-list", oneTime: "one-time-tasks-list", longTerm: "long-term-goals-list" }[type];
    const ul = document.getElementById(listId), selectedDay = document.getElementById("day-selector").value;
    if (type === "specific" && task.day !== selectedDay) return;

    const li = document.createElement("li");
    li.draggable = true;
    li.classList.add("draggable-task");
    li.dataset.taskText = task.text;
    if (task.completed) li.classList.add("checked");

    const taskText = document.createElement("span"), checkbox = document.createElement("input"), removeBtn = document.createElement("button");
    taskText.classList.add("task-text"); taskText.textContent = task.text;
    checkbox.type = "checkbox"; checkbox.checked = task.completed; checkbox.addEventListener("change", () => toggleTask(type, task, li));
    removeBtn.textContent = "X"; removeBtn.classList.add("remove-btn"); removeBtn.addEventListener("click", () => removeTask(type, task, li));
    li.append(taskText, checkbox, removeBtn);
    ul.appendChild(li);

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", e => handleDrop(e, type));
    li.addEventListener("dragend", handleDragEnd);

    setTimeout(() => li.classList.add("fade-in"), 10);
}

function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.taskText);
    e.target.classList.add("dragging");
}

function handleDragOver(e) {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    if (e.target.classList.contains("draggable-task") && e.target !== draggingItem) {
        e.target.closest("ul").insertBefore(draggingItem, e.target.nextSibling);
    }
}

function handleDrop(e, type) {
    e.preventDefault();
    reorderTasksInLocalStorage(type, e.dataTransfer.getData("text/plain"));
}

function handleDragEnd(e) {
    e.target.classList.remove("dragging");
}

function reorderTasksInLocalStorage(type, draggedTaskText) {
    const ul = document.getElementById({ daily: "daily-tasks-list", specific: "specific-day-tasks-list", weekly: "weekly-tasks-list", oneTime: "one-time-tasks-list", longTerm: "long-term-goals-list" }[type]);
    const reorderedTasks = Array.from(ul.children).map(li => ({ text: li.querySelector(".task-text").textContent, completed: li.classList.contains("checked"), day: li.dataset.day }));
    localStorage.setItem(type, JSON.stringify(reorderedTasks));
}

function removeTask(type, task, listItem) {
    if (type === "longTerm") {
        showDeleteConfirmation(() => {
            listItem.classList.add("fade-out");
            setTimeout(() => { listItem.remove(); deleteTask(type, task); }, 300);
        });
    } else {
        listItem.classList.add("fade-out");
        setTimeout(() => { listItem.remove(); deleteTask(type, task); }, 300);
    }
}

function showDeleteConfirmation(confirmCallback) {
    const popupOverlay = document.createElement("div"), popupBox = document.createElement("div"), message = document.createElement("p"), yesButton = document.createElement("button"), noButton = document.createElement("button");
    popupOverlay.classList.add("delete-confirmation-overlay");
    popupBox.classList.add("delete-confirmation-box");
    message.innerHTML = "Are you sure you want to remove<br>Long Term Goal?";
    message.classList.add("delete-confirmation-message");

    yesButton.textContent = "Yes"; yesButton.classList.add("delete-confirmation-yes"); yesButton.addEventListener("click", () => { document.body.removeChild(popupOverlay); confirmCallback(); });
    noButton.textContent = "No"; noButton.classList.add("delete-confirmation-no"); noButton.addEventListener("click", () => { document.body.removeChild(popupOverlay); });
    popupBox.append(message, yesButton, noButton);
    popupOverlay.appendChild(popupBox);
    document.body.appendChild(popupOverlay);
}

function toggleTask(type, task, listItem) {
    task.completed = !task.completed;
    task.completedDate = task.completed ? new Date().toISOString() : null;

    if (type === "oneTime" && task.completed) {
        listItem.classList.add("fade-out");
        setTimeout(() => { listItem.remove(); deleteTask(type, task); }, 1500);
    } else {
        updateTask(type, task);
    }
    listItem.classList.toggle("checked", task.completed);
    listItem.style.color = task.completed ? "#8bde64" : "#d3d3d3";
}

function updateTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    const index = tasks.findIndex(t => t.text === task.text && t.day === task.day);
    if (index !== -1) tasks[index] = task; else tasks.push(task);
    localStorage.setItem(type, JSON.stringify(tasks));
}

function deleteTask(type, task) {
    let tasks = JSON.parse(localStorage.getItem(type)) || [];
    tasks = tasks.filter(t => t.text !== task.text || (task.day && t.day !== task.day));
    localStorage.setItem(type, JSON.stringify(tasks));
}

function addReminder() {
    const reminderText = prompt("Enter a reminder:");
    if (!reminderText) return;
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    reminders.push({ text: reminderText });
    localStorage.setItem("reminders", JSON.stringify(reminders));
    displayReminder({ text: reminderText });
}

function loadReminders() {
    (JSON.parse(localStorage.getItem("reminders")) || []).forEach(reminder => displayReminder(reminder));
}

function displayReminder(reminder) {
    const ul = document.getElementById("reminders-list"), li = document.createElement("li"), reminderText = document.createElement("span"), removeBtn = document.createElement("button");
    reminderText.classList.add("task-text"); reminderText.textContent = reminder.text;
    removeBtn.textContent = "X"; removeBtn.classList.add("remove-btn"); removeBtn.addEventListener("click", () => removeReminder(reminder, li));
    li.append(reminderText, removeBtn);
    ul.appendChild(li);
}

function removeReminder(reminder, listItem) {
    listItem.classList.add("fade-out");
    setTimeout(() => { listItem.remove(); let reminders = JSON.parse(localStorage.getItem("reminders")) || []; reminders = reminders.filter(r => r.text !== reminder.text); localStorage.setItem("reminders", JSON.stringify(reminders)); }, 300);
}

function updateSpecificDayTasks() {
    const selectedDay = document.getElementById("day-selector").value;
    updateSpecificDayHeading(selectedDay);
    const ul = document.getElementById("specific-day-tasks-list");
    Array.from(ul.children).forEach(li => li.style.display = li.dataset.day === selectedDay ? "block" : "none");
}

function updateSpecificDayHeading(selectedDay) {
    document.getElementById("specific-day-tasks-heading").textContent = `Tasks for ${selectedDay}`;
}