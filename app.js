// Constantes de la API de TMDB
const API_KEY = '808ffa6970e26994a9cf23bb4178fce6';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original'; 

// Elementos del DOM
const navbar = document.getElementById('navbar');
const rowsContainer = document.getElementById('rows-container');
const playerModal = document.getElementById('player-modal');
const playerContainer = document.getElementById('player-container');
const searchForm = document.getElementById('search-form');

// Cambiar fondo del navbar al hacer scroll (Efecto de transición como Netflix)
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('nav-black');
    } else {
        navbar.classList.remove('nav-black');
    }
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadHeroMovie();
    loadRows();
});

// 1. Cargar la película principal gigante (Hero Banner)
async function loadHeroMovie() {
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-MX`);
        const data = await res.json();
        
        // Elegimos una película aleatoria de las tendencias para el inicio
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        
        const heroBanner = document.getElementById('hero-banner');
        document.getElementById('hero-title').textContent = randomMovie.title || randomMovie.name;
        document.getElementById('hero-overview').textContent = randomMovie.overview;
        
        // Extraemos el año para los metadatos de la portada
        const releaseDate = randomMovie.release_date || randomMovie.first_air_date;
        if (releaseDate) {
            document.querySelector('.hero-metadata .year').textContent = releaseDate.split('-')[0];
        }
        
        // Imagen en alta calidad (backdrop) para el fondo
        heroBanner.style.backgroundImage = `url(${IMG_URL}${randomMovie.backdrop_path})`;

        // Botón reproducir del Hero
        document.getElementById('hero-play').onclick = () => abrirPlayer(randomMovie.id);

    } catch (error) {
        console.error("Error cargando el Hero Banner", error);
    }
}

// 2. Cargar las filas del catálogo por categorías
async function loadRows() {
    const endpoints = [
        { title: 'Nuevos Lanzamientos', url: `/movie/now_playing?api_key=${API_KEY}&language=es-MX` },
        { title: 'Tendencias Ahora', url: `/trending/movie/week?api_key=${API_KEY}&language=es-MX` },
        { title: 'Acción Pura', url: `/discover/movie?api_key=${API_KEY}&language=es-MX&with_genres=28` },
        { title: 'Comedias para reír', url: `/discover/movie?api_key=${API_KEY}&language=es-MX&with_genres=35` },
        { title: 'Terror y Suspenso', url: `/discover/movie?api_key=${API_KEY}&language=es-MX&with_genres=27` }
    ];

    for (const endpoint of endpoints) {
        await crearFila(endpoint.title, endpoint.url);
    }
}

// Función que crea el HTML de cada fila deslizable
async function crearFila(title, urlPath) {
    try {
        const res = await fetch(`${BASE_URL}${urlPath}`);
        const data = await res.json();

        // Creamos la fila y su título
        const row = document.createElement('div');
        row.className = 'movie-row';
        row.innerHTML = `<h2>${title}</h2>`;

        const postersContainer = document.createElement('div');
        postersContainer.className = 'row-posters';

        // Recorremos las películas devueltas por la API
        data.results.forEach((movie) => {
            if (!movie.backdrop_path) return; // Filtramos las que no tienen imagen ancha

            // Contenedor individual de cada póster
            const posterContainer = document.createElement('div');
            posterContainer.className = 'poster-container';
            posterContainer.onclick = () => abrirPlayer(movie.id);

            // Imagen del póster
            const img = document.createElement('img');
            img.className = 'row-poster';
            img.src = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`; // Usamos w500 para cargar rápido
            img.alt = movie.title || movie.name;
            
            posterContainer.appendChild(img);

            // Agregamos la etiqueta roja "Recién agregado" de forma aleatoria para darle realismo
            if (Math.random() > 0.6) {
                const badge = document.createElement('span');
                badge.className = 'badge-recent';
                badge.innerText = 'Recién agregado';
                posterContainer.appendChild(badge);
            }

            postersContainer.appendChild(posterContainer);
        });

        row.appendChild(postersContainer);
        rowsContainer.appendChild(row);

    } catch (error) {
        console.error(`Error cargando fila ${title}`, error);
    }
}

// 3. Sistema de Búsqueda
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    // Limpiamos las filas actuales y agregamos la de resultados de búsqueda
    rowsContainer.innerHTML = ''; 
    await crearFila(`Resultados para: ${query}`, `/search/movie?api_key=${API_KEY}&language=es-MX&query=${query}`);
    
    // Ocultamos el hero suavemente para enfocarnos en los resultados
    document.getElementById('hero-banner').style.height = '150px';
});

// Restaurar inicio al hacer clic en el botón "Inicio" o en el logo
document.getElementById('btn-inicio').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('search-input').value = '';
    document.getElementById('hero-banner').style.height = '95vh'; // Volvemos a mostrar el Hero grande
    rowsContainer.innerHTML = '';
    loadHeroMovie();
    loadRows();
});

document.querySelector('.logo').addEventListener('click', () => {
    document.getElementById('btn-inicio').click();
});

// 4. Lógica de reproducción de FramexTV (Blindada contra Pop-ups)
function abrirPlayer(tmdbId) {
    playerContainer.innerHTML = `
        <iframe
            src="https://framextv.xyz/embed/${tmdbId}?autoplay=1"
            style="width: 100%; height: 100%; border: none;"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowfullscreen
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            title="Reproductor de Película"
        ></iframe>
    `;
    playerModal.classList.remove('hidden'); 
    document.body.style.overflow = 'hidden'; 
}