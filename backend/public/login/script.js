const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const bottomText = document.getElementById('bottom-text');
const bottomLink = document.getElementById('bottom-link');

const RENDER_BACKEND_URL = "https://recipe-search-with-favoritrs.onrender.com";
const API_URL = '/api/auth';

// user is already logged in
(function checkLoggedIn() {
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = '../home/home.html';
    }
})();

//login to singup function
function toggleForm(type) {
    
    if (type === 'login') {
        signupTab.classList.remove('active');
        loginTab.classList.add('active');
        signupForm.classList.add('hidden-form');
        loginForm.classList.remove('hidden-form');
        bottomText.innerHTML = 'Don\'t have an account? <a href="#" id="bottom-link">Sign Up</a>';
        document.getElementById('bottom-link').addEventListener('click', () => toggleForm('signup'));
    } 
   else  if (type === 'signup') {  
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
        loginForm.classList.add('hidden-form');
        signupForm.classList.remove('hidden-form');
        bottomText.innerHTML = 'Already have an account? <a href="#" id="bottom-link">Log In</a>';
        document.getElementById('bottom-link').addEventListener('click', () => toggleForm('login'));
    }
}

loginTab.classList.add('active');
signupForm.classList.add('hidden-form');
document.getElementById('bottom-link').addEventListener('click', () => toggleForm('signup')); 

loginTab.addEventListener('click', () => toggleForm('login'));
signupTab.addEventListener('click', () => toggleForm('signup'));

function navigateToHome(token, email,name) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    window.location.href = '../home/home.html'; 
}

// Login Form Submit 

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    
    try {
        const response = await fetch(`${RENDER_BACKEND_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
        //Error for  400, 401 
        const errorData = await response.json().catch(() => ({ message: 'Login failed: Invalid credentials or empty response.' }));
        alert(errorData.message || 'Login failed.');
        return;
    }

        const data = await response.json();
        
        if (response.ok) {
            alert('Login Successful! Redirecting...');
            navigateToHome(data.token, data.email,data.name); 
        } else {
            alert(data.message || 'Login Failed. Check credentials.');
        }

    } catch (error) {
        alert('Server connection error. Check your Backend (Port 5000)');
        console.error('Login Error:', error);
    }
});

// Sign Up Form Submit 

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = signupForm.name.value;   
    const email = signupForm.email.value;
    const password = signupForm.password.value;
    
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name,email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(`Sign Up Successful for ${data.email}! Please log in.`);
            toggleForm('login'); 
        } else {
            alert(data.message || 'Sign Up Failed. Try a different email.');
        }

    } catch (error) {
        alert('Server connection error. Check your Backend (Port 5000)');
        console.error('Signup Error:', error);
    }
});