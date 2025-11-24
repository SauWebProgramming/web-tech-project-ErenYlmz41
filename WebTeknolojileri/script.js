const mediaList = document.getElementById('media-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const favoritesBtn = document.getElementById('favorites-btn');
const sortSelect = document.getElementById('sort-select');

let allMovies = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// VERİ ÇEKME
async function init() {
    try {
        const response = await fetch('./movies.json');
        if (!response.ok) throw new Error('Veri çekilemedi!');
        
        allMovies = await response.json();
        
        displayMovies(allMovies);
    } catch (error) {
        console.error("Hata:", error);
        mediaList.innerHTML = `<p style="color:red; text-align:center;">Veriler yüklenirken bir hata oluştu. Lütfen "Live Server" kullandığınızdan emin olun.</p>`;
    }
}

// EKRANA BASMA
function displayMovies(movies) {
    mediaList.innerHTML = '';

    if (movies.length === 0) {
        mediaList.innerHTML = '<p>Aradığınız kriterlere uygun film bulunamadı.</p>';
        return;
    }

    movies.forEach(movie => {
        // Favori durumunu kontrol etme
        const isFavorite = favorites.some(favId => favId === movie.id);
        
        // Kart
        const movieCard = document.createElement('article');
        movieCard.classList.add('movie-card');
        
        movieCard.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}" onclick="openModal(${movie.id})">
            <div class="movie-info">
                <h3 onclick="openModal(${movie.id})">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span class="rating">★ ${movie.rating}</span>
                </div>
                <div class="movie-meta">
                    <span>${movie.category}</span>
                    <button class="fav-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(event, ${movie.id})">
                        ${isFavorite ? '♥' : '♡'}
                    </button>
                </div>
            </div>
        `;
        mediaList.appendChild(movieCard);
    });
}

// ARAMA, FİLTRELEME VE SIRALAMA
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    let filtered = allMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || movie.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });


    if (sortValue === 'year-asc') {
        filtered.sort((a, b) => a.year - b.year);
    }
    else if (sortValue === 'year-desc') {
        filtered.sort((a, b) => b.year - a.year);
    }
    else if (sortValue === 'rating-asc') {
        filtered.sort((a, b) => a.rating - b.rating);
    }
    else if (sortValue === 'rating-desc') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    // 3. Adım: Sonuçları ekrana bas
    displayMovies(filtered);
}


// Event Listener
sortSelect.addEventListener('change', filterMovies);
searchInput.addEventListener('input', filterMovies);
categoryFilter.addEventListener('change', filterMovies);

// MODAL
function openModal(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) return;

    // Inline stilleri kaldırdık, yerine 'modal-detail-view' class'ı ekledik
    modalBody.innerHTML = `
        <div class="modal-detail-view">
            <img src="${movie.image}" alt="${movie.title}" class="modal-poster">
            <div class="modal-info">
                <h2>${movie.title} (${movie.year})</h2>
                <p class="modal-category"><strong>Kategori:</strong> ${movie.category}</p>
                <p class="modal-rating"><strong>IMDB Puanı:</strong> ${movie.rating} / 10</p>
                <p class="modal-desc">${movie.description}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

    function closeModal() {
        modal.classList.remove('active');
    }

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    };

// FAVORİLER
function toggleFavorite(event, id) {
    
    const index = favorites.indexOf(id);
    
    if (index === -1) {
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    filterMovies(); 
}


let showFavoritesOnly = false;

function toggleFavorites() {
    showFavoritesOnly = !showFavoritesOnly;
    const btn = document.getElementById('favorites-btn');

    if (showFavoritesOnly) {
        btn.textContent = "Tüm Filmleri Göster";
        btn.style.backgroundColor = "#27ae60"; 
        
        const favoriteMovies = allMovies.filter(movie => favorites.includes(movie.id));
        displayMovies(favoriteMovies);
    } else {
        btn.textContent = "⭐ Favorilerim";
        btn.style.backgroundColor = "#e74c3c";
        filterMovies();
    }
}
init();