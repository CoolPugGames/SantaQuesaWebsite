// // login.js
// async function authenticateUser() {
//     document.getElementById('login-form').addEventListener('submit', async (event) => {
//         event.preventDefault();
//         console.log('attempting login...');
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;

//         // Make a request to the server for authentication
//         const response = await fetch('/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password }),
//         });
//         const result = await response.json();
//         console.log(result)
//         if (response.ok) {
//             window.location.href = '../protected/mysantaquesa.html';  // Redirect on successful login
//         } else {
//             alert('Invalid username or password');
//         }
//     })
// }

async function authenticateUser() {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('attempting login...');
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Make a request to the server for authentication
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const result = await response.json();
        console.log(result)
        if (response.ok) {
            // Check authentication status
            const authResponse = await fetch('/check-auth', {
                method: 'GET',
            });
            const authResult = await authResponse.json();
            if (authResult.authenticated) {
                window.location.href = '../protected/mysantaquesa.html';  // Redirect on successful login and authentication
            } else {
                alert('Authentication failed');
            }
        } else {
            alert('Invalid username or password');
        }
    })
}

