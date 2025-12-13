class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text === '') return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('ja-JP')
        };

        this.todos.push(todo);
        input.value = '';
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    editTodo(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo && newText.trim() !== '') {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            }
        });
    }

    updateStats() {
        const totalCount = this.todos.length;
        const completedCount = this.todos.filter(todo => todo.completed).length;
        
        document.getElementById('totalCount').textContent = `総タスク: ${totalCount}`;
        document.getElementById('completedCount').textContent = `完了: ${completedCount}`;
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = this.currentFilter === 'all' ? 
                'タスクがありません' : 
                `${this.currentFilter === 'active' ? '未完了の' : '完了済みの'}タスクがありません`;
            todoList.appendChild(emptyMessage);
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text" ${!todo.completed ? 'ondblclick="app.startEdit(' + todo.id + ')"' : ''}>${todo.text}</span>
                    <span class="todo-date">${todo.createdAt}</span>
                    <button class="delete-btn">削除</button>
                `;

                const checkbox = li.querySelector('.todo-checkbox');
                const deleteBtn = li.querySelector('.delete-btn');

                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

                todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    startEdit(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo || todo.completed) return;

        const todoText = document.querySelector(`.todo-item [data-id="${id}"] .todo-text`);
        if (!todoText) {
            const todoItems = document.querySelectorAll('.todo-item');
            const targetItem = Array.from(todoItems).find(item => {
                const checkbox = item.querySelector('.todo-checkbox');
                return checkbox && !checkbox.checked && 
                       item.querySelector('.todo-text').textContent === todo.text;
            });
            
            if (targetItem) {
                const textSpan = targetItem.querySelector('.todo-text');
                this.createEditInput(textSpan, todo);
            }
        }
    }

    createEditInput(textSpan, todo) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        
        const finishEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                this.editTodo(todo.id, newText);
            } else {
                this.render();
            }
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') finishEdit();
            if (e.key === 'Escape') this.render();
        });

        textSpan.replaceWith(input);
        input.focus();
        input.select();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

const app = new TodoApp();