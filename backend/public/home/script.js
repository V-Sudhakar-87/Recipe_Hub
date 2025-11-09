const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const recipeContainer = document.getElementById('recipe-container');
const recipeHeading = document.getElementById('recipe-heading');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');

const SEARCH_API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
const DEFAULT_API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=chicken'; 

const API_URL = 'http://your-app-name.onrender.com/api/favorites';

const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');

const displayNameElement = document.getElementById('settings-display-name');
const displayEmailElement = document.getElementById('settings-display-email');

// show the username&Email in settings

if (userName && displayNameElement) {
    displayNameElement.textContent = userName;
}

if (userEmail && displayEmailElement) {
    displayEmailElement.textContent = userEmail;
}
//  Settings Dropdown Logic

settingsBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    settingsMenu.classList.toggle('show');
});

window.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('show');
    }
});

// API Fetching and Display Logic

document.addEventListener('DOMContentLoaded', () => {
    getRecipes(DEFAULT_API_URL);//default recipes API
    getFavoritesFromServer();
});

// Search 
searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const searchTerm = searchInput.value.trim(); 
    if (searchTerm) {
        recipeHeading.innerText = `Search results for: "${searchTerm}"`;
        getRecipes(SEARCH_API_URL + searchTerm); // Search API
        searchInput.value = ''; 
    }
});

async function getRecipes(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayRecipes(data.meals); 

    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipeContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    }
}

// Display recipe 
function displayRecipes(meals) {
    recipeContainer.innerHTML = '';

    if (!meals) {
        recipeContainer.innerHTML = '<p>No recipes found. Please try a different search!</p>';
        return;
    }

    meals.forEach(meal => {
        const isCurrentlyFavorite = isFavorite(meal.idMeal);
        const heartClass = isCurrentlyFavorite ? 'fas favorited' : 'far'; 
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        recipeCard.innerHTML = `
            <div class="favorite-toggle" data-id="${meal.idMeal}">
                <i class="${heartClass} fa-heart" data-id="${meal.idMeal}"></i> 
            </div>
            
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="recipe-card-content">
                <h3>${meal.strMeal}</h3>
                <a href="${meal.strSource}" target="_blank" class="view-btn">View Recipe</a>
            </div>
        `;
        
        const heartElement = recipeCard.querySelector('.favorite-toggle');
        heartElement.addEventListener('click', (e) => {
            e.stopPropagation(); 
            e.preventDefault();
            const iconToUpdate = heartElement.querySelector('.fa-heart');
            toggleFavorite(meal,iconToUpdate); 
        });
        
        recipeContainer.appendChild(recipeCard);
    });
}
//logout
const logoutBtn = document.querySelector('.logout-btn');

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    alert('Logged out successfully! Redirecting to Login Page...');
    window.location.href = '../login/index.html';
});
// Favorites 

function getFavoritesFromStorage() {
    const favoritesJson = localStorage.getItem('userFavorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
}

function isFavorite(mealId) {
    const favorites = getFavoritesFromStorage();
    return favorites.includes(mealId); 
}
//get favorites from server
async function getFavoritesFromServer() {
    
    const token = localStorage.getItem('authToken');
    if (!token) {
        localStorage.removeItem('userFavorites');
        window.location.href = '../login/index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userFavorites', JSON.stringify(data.favorites));
        } 
        else {
            console.error('Failed to fetch user favorites from server:', response.status);
            localStorage.removeItem('userFavorites');
        }
    } 
    catch (error) {
        console.error('Network Error while fetching favorites:', error);
        localStorage.removeItem('userFavorites');
    }
}

// Favorite add and remove

async function toggleFavorite(meal) {
    const token = localStorage.getItem('authToken');
      if (!token) {
    alert('Please log in to manage your favorites.'); 
    return;
}
    const isCurrentlyFavorite = isFavorite(meal.idMeal); 
    const action = isCurrentlyFavorite ? 'remove' : 'add';
    const recipeId = meal.idMeal;

    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ recipeId, action })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error saving favorite');
        }
        if (response.status === 401) {
    alert('Session expired or user deleted. Please log in again.');
    localStorage.clear(); 
    window.location.href = '../login/index.html'; 
    return;
}

        const data = await response.json();
        console.log(`Backend Response: ${data.message}`);
        localStorage.setItem('userFavorites', JSON.stringify(data.favorites)); 
        updateFavoriteIcon(meal.idMeal, action);
    }
     catch (error) {
        alert(`Error!! saving favorite...\nFor Reason: ${error.message}`);
        console.error("Error toggling favorite:", error);
    }
}

function updateFavoriteIcon(mealId, action) {
    const heartIconElement = document.querySelector(`.favorite-toggle i[data-id="${mealId}"]`);

    if (heartIconElement) {
        if (action === 'remove') {
            heartIconElement.classList.remove('fas', 'favorited');
            heartIconElement.classList.add('far');
        }
         else{ // action === 'add'
            heartIconElement.classList.remove('far');
            heartIconElement.classList.add('fas', 'favorited');
        }
    }
}
const themeToggle = document.getElementById('dark-theme-toggle');

// local storage theme
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.checked = false;
    }
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
});
applyTheme();