class Dropdown {
  constructor(containerElement) {
    this.container = containerElement;
    this.trigger = this.container.querySelector('.settings-dropdown__trigger');
    this.menu = this.container.querySelector('.settings-dropdown__menu');
    this.options = this.container.querySelectorAll('.settings-dropdown__option');

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });


    this.options.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.lang || option.dataset.theme;
       
        console.log('Выбрано:', value);
        this.close();
      });
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.menu.hidden) {
        this.close();
      }
    });

    this.trigger.setAttribute('aria-expanded', 'false');
  }

  toggle() {
    if (this.menu.hidden) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    this.menu.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.menu.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
  }
}