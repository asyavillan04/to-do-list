console.log('settings.js загружен');

import { Dropdown } from './dropdown.js';   
import { languages } from './languages.js';
import { themes } from './themes.js';

class Settings {
  constructor() {
    console.log('Settings constructor started');

    this.lang = localStorage.getItem('app-lang') || 'en';
    this.theme = localStorage.getItem('app-theme') || 'auto';

    this.initDropdowns();

    this.applyLanguage();
    this.applyTheme();

    this.onLanguageChangeCallbacks = [];

    console.log('Settings constructor finished');
  }

  initDropdowns() {
    const langContainer = document.querySelector('[data-dropdown="lang"]');
    const themeContainer = document.querySelector('[data-dropdown="theme"]');

    if (langContainer) {
      new Dropdown(langContainer, (lang) => this.setLang(lang));
    }
    if (themeContainer) {
      new Dropdown(themeContainer, (theme) => this.setTheme(theme));
    }
  }

  onLanguageChange(callback) {
    this.onLanguageChangeCallbacks.push(callback);
}

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem('app-lang', lang);
    this.applyLanguage();

    this.onLanguageChangeCallbacks.forEach(cb => cb());
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('app-theme', theme);
    this.applyTheme();
  }

applyLanguage() {
  console.log('Язык установлен:', this.lang);
  document.querySelectorAll('[data-locale]').forEach(el => {
    const key = el.dataset.locale;
    const translated = this.t(key);
    if (translated !== undefined) {
      el.textContent = translated;
    }
  });
}
applyTheme() {
    const root = document.documentElement;
    let themeVars;
 
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (this.theme === 'auto') {
        themeVars = prefersDark ? themes.dark : themes.light;
    } else {
        themeVars = themes[this.theme] || themes.light;
    }

    Object.entries(themeVars).forEach(([prop, val]) => {
        root.style.setProperty(prop, val);
    });

    root.setAttribute('data-theme', this.theme === 'auto' ? (prefersDark ? 'dark' : 'light') : this.theme);

    console.log('Тема установлена:', this.theme, '-> переменные:', themeVars);
}

  t(key, ...args) {
    const pack = languages[this.lang] || languages.en;
    const value = pack?.[key];
    return typeof value === 'function' ? value(...args) : value;
}

}



export const settings = new Settings();