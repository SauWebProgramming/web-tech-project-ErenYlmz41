const mediaList = document.getElementById('media-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const favoritesBtn = document.getElementById('favorites-btn');
const sortSelect = document.getElementById('sort-select');

let allMovies = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let showFavoritesOnly = false;

// --- 1. VERİ ÇEKME ---
async function init() {
    try {
        const response = await fetch('./movies.json');
        
        if (!response.ok) throw new Error('Veri çekilemedi!');
        
        allMovies = await response.json();
        
        displayMovies(allMovies);
    } catch (error) {
        console.error("Hata:", error);
        mediaList.innerHTML = `<p style="color:red; text-align:center;">Veriler yüklenirken hata oluştu. Dosya yolunu veya Live Server'ı kontrol edin.</p>`;
    }
}

// --- 2. EKRANA BASMA ---
function displayMovies(movies) {
    mediaList.innerHTML = '';

    if (movies.length === 0) {
        mediaList.innerHTML = '<p>Aradığınız kriterlere uygun film bulunamadı.</p>';
        return;
    }

    movies.forEach(movie => {
        // Favori kontrolü
        const isFavorite = favorites.some(favId => favId === movie.id);
        
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

// --- 3. ARAMA, FİLTRELEME VE SIRALAMA ---
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    // Arama ve Kategori Filtresi
    let filtered = allMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || movie.category === selectedCategory;
        
        // Eğer "Sadece Favoriler" butonu aktifse
        const matchesFavorite = showFavoritesOnly ? favorites.includes(movie.id) : true;

        return matchesSearch && matchesCategory && matchesFavorite;
    });

    // Sıralama Mantığı
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

    displayMovies(filtered);
}

// Event Listener
sortSelect.addEventListener('change', filterMovies);
searchInput.addEventListener('input', filterMovies);
categoryFilter.addEventListener('change', filterMovies);

// --- 4. MODAL İŞLEMLERİ ---
function openModal(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) return;

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

// Kapatma butonu için dinleyici
const closeBtn = document.querySelector('.close-btn');
if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
};

// Modal dışına tıklayınca kapatma
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// ESC tuşuna basınca kapatma
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// --- 5. FAVORİ İŞLEMLERİ ---
function toggleFavorite(event, id) {
    event.stopPropagation();
    
    const index = favorites.indexOf(id);
    
    if (index === -1) {
        favorites.push(id); // Listede yoksa ekle
    } else {
        favorites.splice(index, 1); // Varsa çıkar
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Görünümü güncelle (Filtreleri koruyarak)
    filterMovies(); 
}

function toggleFavorites() {
    showFavoritesOnly = !showFavoritesOnly;
    const btn = document.getElementById('favorites-btn');

    if (showFavoritesOnly) {
        btn.textContent = "Tüm Filmleri Göster";
        btn.style.backgroundColor = "#27ae60"; 
    } else {
        btn.textContent = "⭐ Favorilerim";
        btn.style.backgroundColor = "#e74c3c";
    }
    
    filterMovies();
}

// Uygulamayı Başlat
init();