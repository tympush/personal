document.addEventListener('DOMContentLoaded', () => {
    // Load tasks from localStorage on page load
    loadTasks();

    // Event listeners for adding tasks
    document.getElementById('add-daily').addEventListener('click', () => addTask('daily'));
    document.getElementById('add-weekly').addEventListener('click', () => addTask('weekly'));
    document.getElementById('add-one-time').addEventListener('click', () => addTask('one-time'));
    document.getElementById('add-reminder').addEventListener('click', () => addTask('reminders'));
    document.getElementById('add-specific-day').addEventListener('click', () => addSpecificDayTask());
});

// Function to load tasks from localStorage
function loadTasks() {
    clearTasks();
    loadTaskList('daily');
    loadTaskList('weekly');
    loadTaskList('one-time');
    loadTaskList('reminders');
    loadSpecificDayTasks();
}

// Function to load a specific list of tasks
function loadTaskList(taskType) {
    const tasks = JSON.parse(localStorage.getItem(taskType)) || [];
    const ul = document.getElementById(`${taskType}-list`);

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add(task.completed ? 'checked' : '');
        li.dataset.id = task.id;

        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        taskText.textContent = task.text;
        li.appendChild(taskText);

        // Create the checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(li, taskType, task.id));
        li.appendChild(checkbox);

        // Create the remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-btn');
        removeButton.addEventListener('click', () => removeTask(li, taskType, task.id));
        li.appendChild(removeButton);

        ul.appendChild(li);
    });
}

// Function to load tasks for a specific day (e.g., Tuesday Tasks)
function loadSpecificDayTasks() {
    const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const specificDayTasks = JSON.parse(localStorage.getItem(currentDay)) || [];
    const ul = document.getElementById('specific-day-list');
    specificDayTasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add(task.completed ? 'checked' : '');
        li.dataset.id = task.id;

        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        taskText.textContent = task.text;
        li.appendChild(taskText);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(li, currentDay, task.id));
        li.appendChild(checkbox);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-btn');
        removeButton.addEventListener('click', () => removeTask(li, currentDay, task.id));
        li.appendChild(removeButton);

        ul.appendChild(li);
    });
}

// Add a task (Daily, Weekly, One-Time, Reminders)
function addTask(taskType) {
    const input = document.getElementById(`${taskType}-input`);
    const taskText = input.value.trim();

    if (taskText === '') {
        alert('Please enter a task.');
        return;
    }

    const taskId = Date.now();
    const task = {
        id: taskId,
        text: taskText,
        completed: false
    };

    const tasks = JSON.parse(localStorage.getItem(taskType)) || [];
    tasks.push(task);
    localStorage.setItem(taskType, JSON.stringify(tasks));

    input.value = ''; // Clear the input field

    loadTasks(); // Reload tasks to reflect the new one
}

// Add a specific day task (Tasks for a specific day of the week)
function addSpecificDayTask() {
    const input = document.getElementById('specific-day-input');
    const taskText = input.value.trim();
    const selectedDay = document.getElementById('specific-day-dropdown').value;

    if (taskText === '') {
        alert('Please enter a task.');
        return;
    }

    const taskId = Date.now();
    const task = {
        id: taskId,
        text: taskText,
        completed: false
    };

    const tasks = JSON.parse(localStorage.getItem(selectedDay)) || [];
    tasks.push(task);
    localStorage.setItem(selectedDay, JSON.stringify(tasks));

    input.value = ''; // Clear the input field

    loadTasks(); // Reload tasks to reflect the new one
}

// Toggle task completion
function toggleTaskCompletion(taskElement, taskType, taskId) {
    taskElement.classList.toggle('checked');
    const tasks = JSON.parse(localStorage.getItem(taskType)) || [];
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem(taskType, JSON.stringify(tasks));
    }
}

// Remove task from the list
function removeTask(taskElement, taskType, taskId) {
    taskElement.remove();
    const tasks = JSON.parse(localStorage.getItem(taskType)) || [];
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem(taskType, JSON.stringify(updatedTasks));
}

// Clear all tasks from task list (before loading from localStorage)
function clearTasks() {
    document.querySelectorAll('.task-box ul').forEach(ul => ul.innerHTML = '');
}
  