'use strict'

function getRandomInt(min, max) {

    
    return Math.floor(Math.random() * (max - min)) + min;
}

function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', isDark);
  document.getElementById('theme-toggle').innerText = isDark ? '☀️' : '🌙';
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.getElementById('theme-toggle').innerText = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
}




