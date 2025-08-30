document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app with GSAP animations
    function init() {
        // Animate container entrance
        gsap.from('.container', {
            duration: 0.8,
            scale: 0.9,
            opacity: 0,
            ease: 'back.out(1.7)',
            delay: 0.2
        });
        
        renderTasks();
        updateStats();
        
        // Event listeners
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Animate filter button change
                gsap.to(filterBtns, {
                    duration: 0.3,
                    scale: 0.95,
                    opacity: 0.8,
                    onComplete: () => {
                        filterBtns.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        currentFilter = this.getAttribute('data-filter');
                        
                        gsap.to(filterBtns, {
                            duration: 0.3,
                            scale: 1,
                            opacity: 1
                        });
                        
                        renderTasks();
                    }
                });
            });
        });
    }
    
    // Add a new task with animation
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            // Shake animation for empty input
            gsap.to(taskInput, {
                duration: 0.15,
                x: -10,
                repeat: 5,
                yoyo: true,
                ease: 'power1.inOut'
            });
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        
        // Animate task addition
        taskInput.value = '';
        renderTasks();
        updateStats();
        
        // Pulse animation on add button
        gsap.to(addBtn, {
            duration: 0.2,
            scale: 1.1,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut'
        });
    }
    
    // Render tasks based on current filter with animations
    function renderTasks() {
        // Filter tasks based on current selection
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-${currentFilter === 'completed' ? 'check-circle' : 'smile-beam'}"></i>
                    <p>${currentFilter === 'completed' ? 'No completed tasks yet!' : 'Your list is empty. Add a task to get started!'}</p>
                </div>
            `;
            
            // Animate empty state
            gsap.from('.empty-state', {
                duration: 0.5,
                y: 20,
                opacity: 0,
                stagger: 0.1
            });
            
            return;
        }
        
        // Render tasks
        taskList.innerHTML = '';
        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-date">${formatDate(task.timestamp)}</div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Add event listeners to the task
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTask(task.id));
            
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => editTask(task.id));
            
            taskList.appendChild(li);
            
            // Animate task entry with stagger effect
            gsap.from(li, {
                duration: 0.4,
                x: -50,
                opacity: 0,
                delay: index * 0.05,
                ease: 'power2.out'
            });
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    // Toggle task completion status with animation
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                const updatedTask = { ...task, completed: !task.completed };
                
                // Animate completion
                const taskElement = document.querySelector(`.task-item input[class="task-checkbox"][data-id="${id}"]`)?.closest('.task-item');
                if (taskElement) {
                    if (updatedTask.completed) {
                        gsap.to(taskElement, {
                            duration: 0.3,
                            backgroundColor: '#f0f9ff',
                            scale: 1.02,
                            yoyo: true,
                            repeat: 1,
                            ease: 'power1.inOut'
                        });
                    }
                }
                
                return updatedTask;
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
        updateStats();
        
        // Celebration animation when all tasks are completed
        const completedCount = tasks.filter(task => task.completed).length;
        if (completedCount === tasks.length && tasks.length > 0) {
            celebrate();
        }
    }
    
    // Delete a task with animation
    function deleteTask(id) {
        const taskElement = document.querySelector(`.task-item input[class="task-checkbox"]`)?.closest('.task-item');
        
        // Animate deletion
        if (taskElement) {
            gsap.to(taskElement, {
                duration: 0.3,
                x: 300,
                opacity: 0,
                onComplete: () => {
                    tasks = tasks.filter(task => task.id !== id);
                    saveTasks();
                    renderTasks();
                    updateStats();
                }
            });
        } else {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
        }
    }
    
    // Edit a task
    function editTask(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            
            // Animate edit
            const taskElement = document.querySelector(`.task-item input[class="task-checkbox"]`)?.closest('.task-item');
            if (taskElement) {
                gsap.to(taskElement, {
                    duration: 0.3,
                    backgroundColor: '#fff3cd',
                    scale: 1.03,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power1.inOut',
                    onComplete: () => {
                        renderTasks();
                    }
                });
            } else {
                renderTasks();
            }
        }
    }
    
    // Update task statistics with animation
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        
        // Animate counter changes
        gsap.to(totalTasksSpan, {
            duration: 0.3,
            scale: 1.1,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut',
            onComplete: () => {
                totalTasksSpan.textContent = `Total: ${totalTasks} tasks`;
            }
        });
        
        gsap.to(completedTasksSpan, {
            duration: 0.3,
            scale: 1.1,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut',
            onComplete: () => {
                completedTasksSpan.textContent = `Completed: ${completedTasks} tasks`;
            }
        });
    }
    
    // Celebration animation when all tasks are completed
    function celebrate() {
        // Create celebration elements
        const celebrateDiv = document.createElement('div');
        celebrateDiv.className = 'celebrate';
        document.body.appendChild(celebrateDiv);
        
        // Add confetti animation
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.innerHTML = '<i class="fas fa-star"></i>';
            confetti.style.position = 'absolute';
            confetti.style.fontSize = Math.random() * 20 + 10 + 'px';
            confetti.style.color = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)];
            celebrateDiv.appendChild(confetti);
            
            // Animate confetti
            gsap.to(confetti, {
                duration: Math.random() * 2 + 1,
                x: Math.random() * 1000 - 500,
                y: Math.random() * 1000 - 500,
                opacity: 0,
                rotation: Math.random() * 720 - 360,
                ease: 'power1.out',
                onComplete: () => {
                    confetti.remove();
                }
            });
        }
        
        // Remove celebration div after animation
        setTimeout(() => {
            celebrateDiv.remove();
        }, 3000);
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the application
    init();
});