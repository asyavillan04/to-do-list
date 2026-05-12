import { settings } from './settings/settings.js';

class Todo {
    selectors ={
        root: `[data-js-todo]`,
        newTaskForm: `[data-js-todo-new-task-form]`,
        newTaskInput: `[data-js-todo-new-task-input]`,
        searchTaskForm: `[data-js-todo-search-task-form]`,
        searchTaskInput: `[data-js-todo-search-task-input]`,
        totalTasks: `[data-js-todo-total-tasks]`,
        deleteAllButton: `[data-js-todo-delete-all-button]`,
        list: `[data-js-todo-list]`,
        item: `[data-js-todo-item]`,
        itemCheckbox: `[data-js-todo-item-checkbox]`,
        itemLabel: `[data-js-todo-item-label]`,
        itemDeleteButton: `[data-js-todo-item-delete-button]`,
        emptyMessage: `[data-js-todo-empty-message]`
    }

    stateClasses = {
        isVisible: 'is-visible',
        isDisappearing: 'is-disappearing'
    }

    localStorageKey = 'todo-items'

    constructor(settings) {
        this.settings = settings;
        
        this.rootElement = document.querySelector(this.selectors.root)
        console.log('rootElement:', this.rootElement);
        
        this.newTaskFormElement = this.rootElement.querySelector(this.selectors.newTaskForm)
        this.newTaskInputElement = this.rootElement.querySelector(this.selectors.newTaskInput)
        this.searchTaskFormElement = this.rootElement.querySelector(this.selectors.searchTaskForm)
        this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.searchTaskInput)
        this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks)

        console.log('totalTasksElement:', this.totalTasksElement);
        
        

        this.deleteAllButtonElement = this.rootElement.querySelector(this.selectors.deleteAllButton)
        this.listElement = this.rootElement.querySelector(this.selectors.list)
        this.emptyMessageElement = this.rootElement.querySelector(this.selectors.emptyMessage)
        this.state = {
            items: this.getItemsFromLocalStorage(),
            filteredItems: null,
            searchQuery: '',
        }

        this.settings.onLanguageChange(() => this.render());

        this.render()
        this.bindEvents()
    }

    getItemsFromLocalStorage() {
        const rawData = localStorage.getItem(this.localStorageKey)

        if (!rawData) {
            return []
        }

        try {
            const parsedData = JSON.parse(rawData)

            return Array.isArray(parsedData) ? parsedData : []
        } catch {
            console.error('Todo items parse error')
            return []
        }
    }

    saveItemsToLocalStorage() {
        localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.state.items)
        )
    }

 render() {

    if (this.totalTasksElement) {
        this.totalTasksElement.textContent = this.settings.t('totalTasks', this.state.items.length);
    }

    if (this.deleteAllButtonElement) {
        this.deleteAllButtonElement.textContent = this.settings.t('deleteAll');
        this.deleteAllButtonElement.classList.toggle(
            this.stateClasses.isVisible,
            this.state.items.length > 0
        );
    }

    const items = this.state.filteredItems ?? this.state.items;

    if (this.listElement) {
        this.listElement.innerHTML = items.map(({id, title, isChecked}) => `
            <li class="todo_item todo-item" data-js-todo-item>
                <input class="todo-item_checkbox" id="${id}" type="checkbox" ${isChecked ? 'checked' : ''} data-js-todo-item-checkbox />
                <label class="todo-item_label" for="${id}" data-js-todo-item-label>${title}</label>
                <button class="todo-item_delete-button" type="button" aria-label="Delete" title="Delete" data-js-todo-item-delete-button>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 5L5 15M5 5L15 15" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </li>`).join('');
    }

    if (this.emptyMessageElement) {
        const isEmptyFilteredItems = this.state.filteredItems?.length === 0;
        const isEmptyItems = this.state.items.length === 0;
        this.emptyMessageElement.textContent = isEmptyFilteredItems
            ? this.settings.t('notFound')
            : isEmptyItems
                ? this.settings.t('emptyList')
                : '';
    }
}
    
    addItem(title) {
        this.state.items.push({
            id:crypto?.randomUUID() ?? Date.now().toString(),
            title,
            isChecked: false,
        })
        this.saveItemsToLocalStorage()
        this.render()
    }

    deleteItem(id) {
        this.state.items = this.state.items.filter((item) => item.id !== id)
        this.saveItemsToLocalStorage()
        
        if (this.state.searchQuery) {
            this.filter()   
        }

        this.render()
    }

    toggleCheckedState(id) {
        this.state.items = this.state.items.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    isChecked: !item.isChecked,
                }
            }

            return item

        })
        this.saveItemsToLocalStorage()

        if (this.state.searchQuery) {
        this.filter()
        }

        this.render()
    }

    filter() {
        const queryFormated = this.state.searchQuery.toLowerCase()
        this.state.filteredItems = this.state.items.filter(({ title }) => {const titleFormatted = title.toLowerCase()

            return titleFormatted.includes(queryFormated)
        })
        this.render()
    }

    resetFilter() {
        this.state.filteredItems = null
        this.state.searchQuery = ''
        this.render()
    }

    onNewTaskFormSubmit = (event) => {
        event.preventDefault()

        const newTodoItemTitle = this.newTaskInputElement.value

        if (newTodoItemTitle.trim().length > 0) {
            this.addItem(newTodoItemTitle)
            this.resetFilter()
            this.newTaskInputElement.value = ''
            this.newTaskInputElement.focus()
        }
    }

    onSearchTaskFormSubmit = (event) => {
        event.preventDefault()
    }

    onSearchTaskInputChange = ({ target }) => {
        const value = target.value.trim()

        if (value.length > 0) {
            this.state.searchQuery = value
            this.filter()
        } else {
            this.resetFilter()
        }
    }

    onDeleteAllButtonClick = () => {
        const isConfirmed = confirm('Are you sure you want to delete all?')

        if (isConfirmed) {
            this.state.items = []
            this.saveItemsToLocalStorage()
            this.render()
        }
    }
    onClick = ( { target }) => {
        if (target.matches(this.selectors.itemDeleteButton)) {
            const itemElement = target.closest(this.selectors.item)
            const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)

            itemElement.classList.add(this.stateClasses.isDisappearing)

            setTimeout( () => {
                this.deleteItem(itemCheckboxElement.id)
            }, 400)
        }
    }

    onChange = ({ target }) => {
        if (target.matches(this.selectors.itemCheckbox)) {
            this.toggleCheckedState(target.id)
        }

    }

    bindEvents() {
        this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit)
        this.searchTaskFormElement.addEventListener('submit', this.onSearchTaskFormSubmit)
        this.searchTaskInputElement.addEventListener('input', this.onSearchTaskInputChange)
        this.deleteAllButtonElement.addEventListener('click', this.onDeleteAllButtonClick)
        this.listElement.addEventListener('click', this.onClick)
        this.listElement.addEventListener('change', this.onChange)
    }
}


new Todo(settings)
