// Globale Variablen
window.taskApp = {
    tasks: {
        haus: [
            { id: 1, title: "Heizung warten lassen", priority: "hoch", completed: false, category: "haus" },
            { id: 2, title: "Dachrinne reinigen", priority: "mittel", completed: false, category: "haus" },
            { id: 3, title: "Fenster putzen", priority: "niedrig", completed: false, category: "haus" },
            { id: 4, title: "Keller aufräumen", priority: "mittel", completed: false, category: "haus" },
            { id: 5, title: "Badezimmer neu verfugen", priority: "hoch", completed: false, category: "haus" }
        ],
        garten: [
            { id: 6, title: "Rasen vertikutieren", priority: "hoch", completed: false, category: "garten" },
            { id: 7, title: "Hecke schneiden", priority: "mittel", completed: false, category: "garten" },
            { id: 8, title: "Blumenbeete umgraben", priority: "niedrig", completed: false, category: "garten" },
            { id: 9, title: "Gartenschuppen aufräumen", priority: "mittel", completed: false, category: "garten" },
            { id: 10, title: "Terrassenmöbel streichen", priority: "niedrig", completed: false, category: "garten" }
        ]
    },
    currentTab: 'haus',
    showCompleted: true,
    nextTaskId: 11,
    taskToDelete: null,
    currentCategory: null
};

// Hilfsfunktionen
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function findTaskById(id) {
    const app = window.taskApp;
    for (const category in app.tasks) {
        const task = app.tasks[category].find(t => t.id === id);
        if (task) return task;
    }
    return null;
}

// Tab-Management
function switchTab(tab) {
    const app = window.taskApp;
    app.currentTab = tab;
    
    // Tab-Buttons aktualisieren
    document.querySelectorAll('.tab-btn').forEach(button => {
        if (button.dataset.tab === tab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Tab-Inhalte aktualisieren
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === `${tab}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Aufgaben-Rendering
function createTaskHTML(task) {
    return `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
            <div class="task-content">
                <h4 class="task-title">${escapeHtml(task.title)}</h4>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <div class="task-actions">
                <button class="task-delete" data-task-id="${task.id}" title="Aufgabe löschen">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

function renderTasksForCategory(category) {
    const app = window.taskApp;
    const container = document.getElementById(`${category}-tasks`);
    if (!container) return;
    
    const categoryTasks = app.tasks[category];
    const filteredTasks = app.showCompleted ? 
        categoryTasks : 
        categoryTasks.filter(task => !task.completed);
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Keine Aufgaben</h3>
                <p>${app.showCompleted ? 'Keine Aufgaben vorhanden.' : 'Keine offenen Aufgaben.'}</p>
            </div>
        `;
        return;
    }

    // Nach Priorität sortieren
    const sortedTasks = filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        const priorityOrder = { 'hoch': 0, 'mittel': 1, 'niedrig': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    container.innerHTML = sortedTasks.map(task => createTaskHTML(task)).join('');
    attachTaskEventListeners(container);
}

function renderTasks() {
    renderTasksForCategory('haus');
    renderTasksForCategory('garten');
}

// Event Listeners für Aufgaben
function attachTaskEventListeners(container) {
    // Checkboxes
    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.onclick = function(e) {
            const taskId = parseInt(this.dataset.taskId);
            const task = findTaskById(taskId);
            if (task) {
                task.completed = this.checked;
                renderTasks();
            }
        };
    });

    // Delete buttons
    container.querySelectorAll('.task-delete').forEach(button => {
        button.onclick = function(e) {
            e.preventDefault();
            const taskId = parseInt(this.dataset.taskId);
            window.taskApp.taskToDelete = taskId;
            document.getElementById('confirmModal').classList.remove('hidden');
        };
    });
}

// Modal-Management
function openTaskModal(category) {
    const app = window.taskApp;
    app.currentCategory = category;
    
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('modalTitle');
    const input = document.getElementById('taskTitle');
    const priority = document.getElementById('taskPriority');
    
    title.textContent = `Neue ${category === 'haus' ? 'Hausarbeit' : 'Gartenarbeit'} hinzufügen`;
    input.value = '';
    priority.value = 'mittel';
    modal.classList.remove('hidden');
    
    setTimeout(() => input.focus(), 100);
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
    window.taskApp.currentCategory = null;
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    window.taskApp.taskToDelete = null;
}

// Task-Operationen
function handleTaskSubmit(e) {
    e.preventDefault();
    const app = window.taskApp;
    
    const title = document.getElementById('taskTitle').value.trim();
    const priority = document.getElementById('taskPriority').value;
    
    if (!title || !app.currentCategory) return;

    const newTask = {
        id: app.nextTaskId++,
        title: title,
        priority: priority,
        completed: false,
        category: app.currentCategory
    };

    app.tasks[app.currentCategory].push(newTask);
    renderTasks();
    closeTaskModal();
}

function handleTaskDelete() {
    const app = window.taskApp;
    if (app.taskToDelete) {
        const task = findTaskById(app.taskToDelete);
        if (task) {
            const category = task.category;
            app.tasks[category] = app.tasks[category].filter(t => t.id !== app.taskToDelete);
            renderTasks();
        }
    }
    closeConfirmModal();
}

function toggleCompletedTasks() {
    const app = window.taskApp;
    app.showCompleted = !app.showCompleted;
    
    const toggleText = document.getElementById('toggleText');
    toggleText.textContent = app.showCompleted ? 'Erledigte ausblenden' : 'Erledigte anzeigen';
    
    renderTasks();
}

// Initialisierung
function initApp() {
    // Tab-Navigation
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.onclick = function() {
            switchTab(this.dataset.tab);
        };
    });

    // Add Task Buttons
    document.getElementById('addHausTask').onclick = function() {
        openTaskModal('haus');
    };
    
    document.getElementById('addGartenTask').onclick = function() {
        openTaskModal('garten');
    };

    // Toggle Completed
    document.getElementById('toggleCompleted').onclick = toggleCompletedTasks;

    // Modal Controls
    document.getElementById('closeModal').onclick = closeTaskModal;
    document.getElementById('cancelTask').onclick = closeTaskModal;
    document.getElementById('taskForm').onsubmit = handleTaskSubmit;

    // Confirm Modal
    document.getElementById('cancelDelete').onclick = closeConfirmModal;
    document.getElementById('confirmDelete').onclick = handleTaskDelete;

    // Modal backdrop clicks
    document.getElementById('taskModal').onclick = function(e) {
        if (e.target === this) closeTaskModal();
    };
    
    document.getElementById('confirmModal').onclick = function(e) {
        if (e.target === this) closeConfirmModal();
    };

    // Keyboard shortcuts
    document.onkeydown = function(e) {
        if (e.key === 'Escape') {
            if (!document.getElementById('taskModal').classList.contains('hidden')) {
                closeTaskModal();
            } else if (!document.getElementById('confirmModal').classList.contains('hidden')) {
                closeConfirmModal();
            }
        }
    };

    // Initial render
    renderTasks();
}

// App starten wenn DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}