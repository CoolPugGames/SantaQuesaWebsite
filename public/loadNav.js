// loadNav.js

// const { response } = require("express");

// Waits for page to load, then inserts 'nav.html' into the 'navigation-container' element.

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and insert the navigation content
    fetch('/nav.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navigation-container').innerHTML = html;
        })
        .catch(error => console.error('Error fetching navigation:', error));

});

