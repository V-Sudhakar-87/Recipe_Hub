const favoritesContainer = document.getElementById('favorites-container');
const emptyMessage = document.getElementById('empty-message');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const logoutBtn = document.querySelector('.logout-btn');

const API_URL = '/api/favorites';

const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');

const displayNameElement = document.getElementById('settings-display-name');
const displayEmailElement = document.getElementById('settings-display-email');

// settings username &Email
if (userName && displayNameElement) {
    displayNameElement.textContent = userName;
}
if (userEmail && displayEmailElement) {
    displayEmailElement.textContent = userEmail;
}

// 1. Settings 
settingsBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    settingsMenu.classList.toggle('show');
});

window.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('show');
    }
});

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    alert('Logged out successfully! Redirecting to Login Page...');
    window.location.href = '../login/index.html';
});

//  Favorites 
document.addEventListener('DOMContentLoaded', loadFavorites);

async function fetchUserFavoriteIds() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        favoritesContainer.innerHTML = '<p>Please log in to view your favorites.</p>';
        return null; 
    }
    
    try {
        
        const response = await fetch(`${API_URL}`, {
            method: 'GET', 
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch favorite IDs from server.');
        }

        const data = await response.json();
        return data.favorites; 
        
    } catch (error) {
        console.error('Error fetching favorite IDs:', error);
        favoritesContainer.innerHTML = `<p>Error loading favorites: ${error.message}</p>`;
        return null;
    }
}

async function loadFavorites() {
    favoritesContainer.innerHTML = ''; 
    const favoriteIds = await fetchUserFavoriteIds();

    if (favoriteIds === null) {
        emptyMessage.style.display = 'block'; 
        return;
    }
    
    if (favoriteIds.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none'; 

    for (const id of favoriteIds) {
        try {
            //  TheMealDB API 
            const recipeResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const recipeData = await recipeResponse.json();
            
            if (recipeData.meals && recipeData.meals.length > 0) {
                const meal = recipeData.meals[0];

                const favoriteCard = document.createElement('div');
                favoriteCard.classList.add('favorite-card');
                favoriteCard.innerHTML = `
                  <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="card-details">
                 <h3>${meal.strMeal}</h3>
                </div>
                <div class="card-actions">
                  <a href="${meal.strSource}" target="_blank" class="view-btn">View Recipe</a>
                  <button class="remove-btn" data-id="${meal.idMeal}">Remove</button>
                </div>
                `;
                
                favoritesContainer.appendChild(favoriteCard);
            }
        } catch (error) {
            console.error(`Error fetching recipe ${id}:`, error);
        }
    }
    

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', removeFavorite);
    });
}

// Remove favorites

async function removeFavorite(e) {
    const mealIdToRemove = e.target.dataset.id;
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Please log in to manage your favorites.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipeId: mealIdToRemove, action: 'remove' }) 
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove favorite from server.');
        }
        
        loadFavorites(); 
    } catch (error) {
        console.error("Error removing favorite:", error);
        alert(`Failed to remove from favorites,\n For Reason: ${error.message}`);
    }
}
const themeToggle = document.getElementById('dark-theme-toggle');

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