'use strict';


window.onload = () => {
  // DOM ELEMENTS

  const rootElement = document.documentElement;
  const themeBtn = document.querySelector('.theme-btn');
  const form = document.querySelector('.form');
  const checkbox = document.querySelector('#form__checkbox');
  const input = document.querySelector('.form__input');
  const todoList = document.querySelector('.todo__list');
  const todoCount = document.querySelector('.todo__count > span');
  const todoFilter = document.querySelector('.todo__filter');
  const todoFilterMobile = document.querySelector('.todo__filter--mobile');
  const todoClear = document.querySelector('.todo__clear-btn');



  // VARIABLES

  let todos = [];
  let activeCategory = 'all';
  const data = localStorage.getItem('todos');
  const theme = localStorage.getItem('app-theme');



  // INITIALIZATION

  if (data) todos = JSON.parse(data);

  if (theme) {
    rootElement.classList.add(theme);
    [...themeBtn.children].forEach(icon => icon.classList.toggle('hidden'));
  }

  updateUI();



  // EVENT LISTENERS

  themeBtn.addEventListener('click', toggleTheme);
  form.addEventListener('submit', submitNewTodo);
  checkbox.addEventListener('change', inputFocus);
  todoList.addEventListener('click', editTodo);
  todoFilter.addEventListener('click', filterTodo);
  todoFilterMobile.addEventListener('click', filterTodo);
  todoClear.addEventListener('click', clearTodo);



  // FUNCTIONS

  function toggleTheme() {
    const elements = document.querySelectorAll('label.custom-checkbox, svg.remove-icon, button.todo__filter-btn, button.todo__clear-btn');

    // Preventing transition while shifting the theme
    elements.forEach(e => e.style.transition = 'none');

    rootElement.classList.toggle('dark');
    [...this.children].forEach(icon => icon.classList.toggle('hidden'));
    
    setTimeout(() => {
      // Re-adding transition
      elements.forEach(e => e.style.transition = 'all .2s');
    }, 0);
  }

  function inputFocus() {
    input.focus();
  }

  function addTodo() {
    const userInput = input.value;

    if (userInput.trim() === '' || userInput.length > 30
          || todos.find(todo => todo.title === userInput.trim())) return;
  
    todos.push({
      id: `todo${Math.random().toFixed(5)}`,
      title: input.value.trim(),
      completed: checkbox.checked
    });

    checkbox.checked = false;
    input.value = '';
  }

  function submitNewTodo(e) {
    e.preventDefault();
    addTodo();
    updateApp();
  }

  function renderTodos() {
    if (todos.length === 0) {
      todoList.innerHTML = `<p class='no-todos'>No todos.</p>`;
      return;
    }

    todoList.innerHTML = '';

    let filteredTodos = todos;

    if (activeCategory === 'active')
    filteredTodos = todos.filter(todo => !todo.completed);
    else if (activeCategory === 'completed')
    filteredTodos = todos.filter(todo => todo.completed);

    if (filteredTodos.length === 0) {
      todoList.innerHTML = `<p class='no-todos'>No ${activeCategory} todos.</p>`;
      return;
    }

    filteredTodos.forEach(todo => {
      const html = `
        <li class="todo__row" data-id='${todo.id}' draggable>
          <input ${todo.completed ? 'checked' : ''} type="checkbox" class="hidden-checkbox">
          <label class="custom-checkbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9"><path fill="none" stroke="#FFF" stroke-width="2" d="M1 4.304L3.696 7l6-6"/></svg>
          </label>
          <span class="todo__title">${todo.title}</span>
          <button class="todo__remove">
           <svg class="remove-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/></svg>
          </button>
        </li>
      `;

      todoList.insertAdjacentHTML('afterbegin', html);
    });
  }

  function editTodo(e) {
    const remove = e.target.closest('.todo__remove');
    const check = e.target.closest('.custom-checkbox');

    if (!remove && !check) return;

    reorderTodos();

    const id = e.target.closest('.todo__row').dataset.id;
    const index = todos.findIndex(todo => todo.id === id);

    if (check)
    todos[index].completed = !todos[index].completed;
    else if (remove)
    todos.splice(index, 1);

    updateApp();
  }

  function calcActiveTodos() {
    const todosLeft = todos.filter(todo => !todo.completed);
    todoCount.textContent = todosLeft.length;
  }

  function filterTodo(e) {
    const tab = e.target;

    if (!tab.classList.contains('todo__filter-btn')) return;
    if (tab.classList.contains('todo__filter-btn--active')) return;

    [...this.children].forEach(btn => btn.classList.remove('todo__filter-btn--active'));
    tab.classList.add('todo__filter-btn--active');
    
    reorderTodos();
    updateStorage();

    activeCategory = tab.dataset.tab;
    renderTodos();
  }

  function clearTodo() {
    if (todos.some(todo => todo.completed)) {
      todos = todos.filter(todo => !todo.completed);
      updateApp();
    }
  }

  function reorderTodos() {
    if (activeCategory !== 'all') return;

    const todoIds = todos.map(todo => todo.id);
    const uiIds = Array.from(document.querySelectorAll('li.todo__row'), todo => todo.dataset.id);
    uiIds.reverse();

    if (JSON.stringify(todoIds) !== JSON.stringify(uiIds)) {
      const updatedTodos = [];

      uiIds.forEach(id => {
        const targetTodo = todos.find(todo => todo.id === id);
        updatedTodos.push(targetTodo);
      });

      todos = updatedTodos;
    }
  }

  function updateUI() {
    renderTodos();
    calcActiveTodos();
  }

  function updateStorage() {
    if (todos.length > 0)
    localStorage.setItem('todos', JSON.stringify(todos));
    else
    localStorage.removeItem('todos');
  }

  function updateApp() {
    updateUI();
    updateStorage();
  }
}


window.onbeforeunload = () => {
  if (document.documentElement.classList.contains('dark'))
  localStorage.setItem('app-theme', 'dark');
  else
  localStorage.removeItem('app-theme');

  const todos = JSON.parse(localStorage.getItem('todos'));
  const uiTodos = document.querySelectorAll('li.todo__row');

  if (todos?.length !== uiTodos.length) return;

  const todoIds = todos.map(todo => todo.id);
  const uiIds = Array.from(uiTodos, todo => todo.dataset.id);
  uiIds.reverse();

  if (JSON.stringify(todoIds) !== JSON.stringify(uiIds)) {
    const updatedStorage = [];

    uiIds.forEach(id => {
      const targetTodo = todos.find(todo => todo.id === id);
      updatedStorage.push(targetTodo);
    });

    localStorage.setItem('todos', JSON.stringify(updatedStorage));
  }
}