// Constantes de la API de TMDB
const API_KEY = '808ffa6970e26994a9cf23bb4178fce6';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original'; 

// Elementos del DOM
const navbar = document.getElementById('navbar');
const heroBanner = document.getElementById('hero-banner');
const rowsContainer = document.getElementById('rows-container');
const playerModal = document.getElementById('player-modal');
const playerContainer = document.getElementById('player-container');
const closePlayerBtn = document.getElementById('close-player');
const searchForm = document.getElementById('search-form');
const btnInicio = document.getElementById('btn-inicio');
const btnMiLista = document.getElementById('btn-mi-lista');

// =========================================================================
// SISTEMA DE CARPETAS DE "MI LISTA" E HISTORIAL (LocalStorage)
// =========================================================================
const STORAGE_FOLDERS_KEY = 'setflix_folders_v2';

// Solo las 4 carpetas universales por defecto para todos los usuarios
const DEFAULT_FOLDERS = [
    { id: 'queres_ver', name: '📌 Querés ver', system: true, movies: [] },
    { id: 'ya_viste', name: '✅ Ya viste', system: true, movies: [] },
    { id: 'volveria_a_ver', name: '🔁 Volvería a ver', system: true, movies: [] },
    { id: 'no_me_gusta', name: '👎 No me gusta', system: true, movies: [] }
];

let activeFolderId = 'queres_ver';

function getFolders() {
    // Limpiamos la versión anterior si existía en el navegador
    localStorage.removeItem('setflix_folders_v1');

    const saved = localStorage.getItem(STORAGE_FOLDERS_KEY);
    if (!saved) {
        localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(DEFAULT_FOLDERS));
        return DEFAULT_FOLDERS;
    }
    return JSON.parse(saved);
}

function saveFolders(folders) {
    localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(folders));
}

function isMovieInAnyFolder(movieId) {
    const folders = getFolders();
    return folders.some(f => f.movies.some(m => m.id === movieId));
}

function isMovieInFolder(folderId, movieId) {
    const folders = getFolders();
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.movies.some(m => m.id === movieId) : false;
}

function toggleMovieInFolder(folderId, movie) {
    const folders = getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const exists = folder.movies.some(m => m.id === movie.id);
    if (exists) {
        folder.movies = folder.movies.filter(m => m.id !== movie.id);
    } else {
        folder.movies.unshift(movie);
    }
    saveFolders(folders);
}

function createCustomFolder(name) {
    const cleanName = name.trim();
    if (!cleanName) return null;
    const folders = getFolders();
    const newFolder = {
        id: 'folder_' + Date.now(),
        name: cleanName,
        system: false,
        movies: []
    };
    folders.push(newFolder);
    saveFolders(folders);
    return newFolder;
}

function renameFolder(folderId, newName) {
    const cleanName = newName.trim();
    if (!cleanName) return;
    const folders = getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
        folder.name = cleanName;
        saveFolders(folders);
    }
}

function deleteCustomFolder(folderId) {
    let folders = getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (!folder || folder.system) return;
    folders = folders.filter(f => f.id !== folderId);
    saveFolders(folders);
    if (activeFolderId === folderId) {
        activeFolderId = folders[0].id;
    }
}

// Historial "Continuar viendo"
function getContinueWatching() {
    return JSON.parse(localStorage.getItem('setflix_continue')) || [];
}

function saveToContinueWatching(movie) {
    let list = getContinueWatching();
    list = list.filter(item => item.id !== movie.id);
    const progress = movie.progress || Math.floor(Math.random() * 65) + 20;
    list.unshift({ ...movie, progress });
    if (list.length > 12) list.pop();
    localStorage.setItem('setflix_continue', JSON.stringify(list));
}

// =========================================================================
// INICIALIZACIÓN Y EVENTOS PRINCIPALES
// =========================================================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('nav-black');
    } else {
        navbar.classList.remove('nav-black');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    ensureFolderPickerModal();
    loadHeroMovie();
    loadRows();
});

// 1. Cargar Hero Banner
async function loadHeroMovie() {
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-MX`);
        const data = await res.json();
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        
        document.getElementById('hero-title').textContent = randomMovie.title || randomMovie.name;
        document.getElementById('hero-overview').textContent = randomMovie.overview;
        
        const releaseDate = randomMovie.release_date || randomMovie.first_air_date;
        if (releaseDate) {
            document.querySelector('.hero-metadata .year').textContent = releaseDate.split('-')[0];
        }
        
        heroBanner.style.backgroundImage = `url(${IMG_URL}${randomMovie.backdrop_path})`;
        document.getElementById('hero-play').onclick = () => abrirPlayer(randomMovie);
    } catch (error) {
        console.error("Error cargando el Hero Banner", error);
    }
}

// 2. Cargar las filas del catálogo por categorías
async function loadRows() {
    heroBanner.classList.remove('hidden');
    rowsContainer.classList.remove('clean-view');
    rowsContainer.innerHTML = '';

    renderContinueWatchingRow();

    const endpoints = [
        { title: 'Nuevos Lanzamientos', url: `/movie/now_playing?api_key=${API_KEY}&language=es-MX`, isTop10: false },
        { title: 'Tendencias Ahora', url: `/trending/movie/week?api_key=${API_KEY}&language=es-MX`, isTop10: true },
        { title: 'Acción Pura', url: `/discover/movie?api_key=${API_KEY}&language=es-MX&with_genres=28`, isTop10: false },
        { title: 'Comedias para reír', url: `/discover/movie?api_key=${API_KEY}&language=es-MX&with_genres=35`, isTop10: false },
        { title: 'Terror y Suspenso', url: `/discover/movie?api_key=${API_KEY}&language=es-MX&with_genres=27`, isTop10: false }
    ];

    for (const endpoint of endpoints) {
        await crearFila(endpoint.title, endpoint.url, { isTop10: endpoint.isTop10 });
    }
}

function renderContinueWatchingRow() {
    const existingRow = document.getElementById('continue-watching-row');
    if (existingRow) existingRow.remove();

    const history = getContinueWatching();
    if (history.length === 0) return;

    const row = construirElementoFila('Continuar viendo contenido de Seba', history, {
        isContinueWatching: true
    });
    row.id = 'continue-watching-row';
    rowsContainer.prepend(row);
}

async function crearFila(title, urlPath, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${urlPath}`);
        const data = await res.json();
        const row = construirElementoFila(title, data.results, options);
        rowsContainer.appendChild(row);
    } catch (error) {
        console.error(`Error cargando fila ${title}`, error);
    }
}

// Crear tarjeta individual de película
function crearTarjetaPelicula(movie, index, options = {}) {
    const { isTop10 = false, isContinueWatching = false, onUpdate = null } = options;

    const posterContainer = document.createElement('div');
    posterContainer.className = 'poster-container';
    posterContainer.onclick = () => abrirPlayer(movie);

    const posterMedia = document.createElement('div');
    posterMedia.className = 'poster-media';

    const img = document.createElement('img');
    img.className = 'row-poster';
    img.src = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
    img.alt = movie.title || movie.name;
    posterMedia.appendChild(img);

    if (isTop10 && index < 10) {
        const topBadge = document.createElement('div');
        topBadge.className = 'badge-top10';
        topBadge.innerHTML = `TOP<br>10`;
        posterMedia.appendChild(topBadge);
    }

    const favBtn = document.createElement('button');
    favBtn.className = 'btn-fav';
    favBtn.title = 'Guardar en carpeta de Mi Lista';
    favBtn.innerHTML = isMovieInAnyFolder(movie.id)
        ? '<i class="fa-solid fa-check"></i>'
        : '<i class="fa-solid fa-plus"></i>';

    favBtn.onclick = (e) => {
        e.stopPropagation();
        openFolderPicker(movie, () => {
            favBtn.innerHTML = isMovieInAnyFolder(movie.id)
                ? '<i class="fa-solid fa-check"></i>'
                : '<i class="fa-solid fa-plus"></i>';
            if (onUpdate) onUpdate();
        });
    };
    posterMedia.appendChild(favBtn);

    if (isContinueWatching) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar-container';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-bar-fill';
        progressFill.style.width = `${movie.progress || 45}%`;
        progressContainer.appendChild(progressFill);
        posterMedia.appendChild(progressContainer);
    } else if (Math.random() > 0.6) {
        const badge = document.createElement('span');
        badge.className = 'badge-recent';
        badge.innerText = 'Recién agregado';
        posterMedia.appendChild(badge);
    }

    posterContainer.appendChild(posterMedia);

    const movieTitle = document.createElement('p');
    movieTitle.className = 'movie-card-title';
    movieTitle.textContent = movie.title || movie.name;
    posterContainer.appendChild(movieTitle);

    return posterContainer;
}

function construirElementoFila(title, movies, options = {}) {
    const row = document.createElement('div');
    row.className = 'movie-row';
    row.innerHTML = `<h2>${title}</h2>`;

    const postersContainer = document.createElement('div');
    postersContainer.className = 'row-posters';

    movies.forEach((movie, index) => {
        if (!movie.backdrop_path) return;
        const card = crearTarjetaPelicula(movie, index, options);
        postersContainer.appendChild(card);
    });

    row.appendChild(postersContainer);
    return row;
}

// =========================================================================
// APARTADO DEDICADO "MI LISTA" CON CARPETAS EDITABLES
// =========================================================================
function renderMyListView() {
    heroBanner.classList.add('hidden');
    rowsContainer.classList.add('clean-view');
    rowsContainer.innerHTML = '';

    const folders = getFolders();
    if (!folders.some(f => f.id === activeFolderId)) {
        activeFolderId = folders[0].id;
    }
    const currentFolder = folders.find(f => f.id === activeFolderId);

    const dashboard = document.createElement('div');
    dashboard.className = 'mylist-dashboard';

    const header = document.createElement('div');
    header.className = 'mylist-header';
    header.innerHTML = `
        <div>
            <h1>Mi Lista y Carpetas</h1>
            <p style="color:#aaa; font-size:0.9rem; margin-top:4px;">
                Organizá tus películas en carpetas. Tocá el lápiz (✏️) para renombrar una carpeta o creá una nueva con el botón (+).
            </p>
        </div>
    `;
    dashboard.appendChild(header);

    const foldersBar = document.createElement('div');
    foldersBar.className = 'folders-bar';

    folders.forEach(folder => {
        const tab = document.createElement('div');
        tab.className = `folder-tab ${folder.id === activeFolderId ? 'active' : ''}`;
        tab.onclick = () => {
            activeFolderId = folder.id;
            renderMyListView();
        };

        const nameSpan = document.createElement('span');
        nameSpan.textContent = folder.name;
        tab.appendChild(nameSpan);

        const countSpan = document.createElement('span');
        countSpan.className = 'folder-count';
        countSpan.textContent = folder.movies.length;
        tab.appendChild(countSpan);

        const editIcon = document.createElement('i');
        editIcon.className = 'fa-solid fa-pen folder-action-icon';
        editIcon.title = 'Cambiar nombre de carpeta';
        editIcon.onclick = (e) => {
            e.stopPropagation();
            const nuevoNombre = prompt('Nuevo nombre para la carpeta:', folder.name);
            if (nuevoNombre && nuevoNombre.trim()) {
                renameFolder(folder.id, nuevoNombre);
                renderMyListView();
            }
        };
        tab.appendChild(editIcon);

        if (!folder.system) {
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fa-solid fa-trash folder-action-icon';
            deleteIcon.title = 'Eliminar carpeta';
            deleteIcon.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`¿Seguro que querés eliminar la carpeta "${folder.name}"?`)) {
                    deleteCustomFolder(folder.id);
                    renderMyListView();
                }
            };
            tab.appendChild(deleteIcon);
        }

        foldersBar.appendChild(tab);
    });

    const newFolderBtn = document.createElement('button');
    newFolderBtn.className = 'btn-new-folder';
    newFolderBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Nueva lista`;
    newFolderBtn.onclick = () => {
        const nombre = prompt('Nombre de la nueva carpeta:');
        if (nombre && nombre.trim()) {
            const created = createCustomFolder(nombre);
            if (created) {
                activeFolderId = created.id;
                renderMyListView();
            }
        }
    };
    foldersBar.appendChild(newFolderBtn);
    dashboard.appendChild(foldersBar);

    if (!currentFolder || currentFolder.movies.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-folder-msg';
        emptyMsg.innerHTML = `La carpeta <strong>"${currentFolder ? currentFolder.name : ''}"</strong> todavía no tiene películas.<br>Tocá el botón <strong>(+)</strong> sobre cualquier película del catálogo para guardarla acá.`;
        dashboard.appendChild(emptyMsg);
    } else {
        const grid = document.createElement('div');
        grid.className = 'mylist-grid';
        currentFolder.movies.forEach((movie, idx) => {
            const card = crearTarjetaPelicula(movie, idx, {
                onUpdate: () => renderMyListView()
            });
            grid.appendChild(card);
        });
        dashboard.appendChild(grid);
    }

    rowsContainer.appendChild(dashboard);
}

// =========================================================================
// MODAL SELECTOR DE CARPETA AL TOCAR EL BOTÓN (+) EN UNA PELÍCULA
// =========================================================================
function ensureFolderPickerModal() {
    if (document.getElementById('folder-picker-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'folder-picker-modal';
    modal.className = 'folder-picker-modal hidden';
    modal.innerHTML = `
        <div class="folder-picker-box">
            <div class="folder-picker-header">
                <h3 id="folder-picker-title">Guardar en carpeta</h3>
                <button id="folder-picker-close" class="folder-picker-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div id="folder-picker-options" class="folder-picker-options"></div>
            <button id="folder-picker-new" class="btn-new-folder" style="width: 100%; justify-content: center;">
                <i class="fa-solid fa-plus"></i> Crear nueva carpeta
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('folder-picker-close').onclick = () => {
        modal.classList.add('hidden');
    };
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    };
}

function openFolderPicker(movie, onChanged) {
    ensureFolderPickerModal();
    const modal = document.getElementById('folder-picker-modal');
    const titleEl = document.getElementById('folder-picker-title');
    const optionsEl = document.getElementById('folder-picker-options');
    const newBtn = document.getElementById('folder-picker-new');

    titleEl.textContent = `Guardar "${movie.title || movie.name}" en:`;

    function renderOptions() {
        optionsEl.innerHTML = '';
        const folders = getFolders();
        folders.forEach(folder => {
            const inFolder = isMovieInFolder(folder.id, movie.id);
            const btn = document.createElement('button');
            btn.className = `folder-option-btn ${inFolder ? 'saved' : ''}`;
            btn.innerHTML = `
                <span>${folder.name}</span>
                <i class="fa-solid ${inFolder ? 'fa-check' : 'fa-plus'}"></i>
            `;
            btn.onclick = () => {
                toggleMovieInFolder(folder.id, movie);
                renderOptions();
                if (onChanged) onChanged();
            };
            optionsEl.appendChild(btn);
        });
    }

    newBtn.onclick = () => {
        const nombre = prompt('Nombre de la nueva carpeta:');
        if (nombre && nombre.trim()) {
            const nueva = createCustomFolder(nombre);
            if (nueva) {
                toggleMovieInFolder(nueva.id, movie);
                renderOptions();
                if (onChanged) onChanged();
            }
        }
    };

    renderOptions();
    modal.classList.remove('hidden');
}

// =========================================================================
// BUSCADOR Y NAVEGACIÓN
// =========================================================================
if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;

        heroBanner.classList.add('hidden');
        rowsContainer.classList.add('clean-view');
        rowsContainer.innerHTML = ''; 
        await crearFila(`Resultados para: ${query}`, `/search/movie?api_key=${API_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
    });
}

if (btnMiLista) {
    btnMiLista.addEventListener('click', (e) => {
        e.preventDefault();
        btnInicio.classList.remove('active');
        btnMiLista.classList.add('active');
        renderMyListView();
    });
}

btnInicio.addEventListener('click', (e) => {
    e.preventDefault();
    btnMiLista?.classList.remove('active');
    btnInicio.classList.add('active');
    document.getElementById('search-input').value = '';
    loadHeroMovie();
    loadRows();
});

document.querySelector('.logo').addEventListener('click', () => {
    btnInicio.click();
});

// 4. Lógica de reproducción de FramexTV
function abrirPlayer(movie) {
    saveToContinueWatching(movie);
    if (!heroBanner.classList.contains('hidden')) {
        renderContinueWatchingRow();
    }

    playerContainer.innerHTML = `
        <iframe
            src="https://framextv.xyz/embed/${movie.id}?autoplay=1"
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

closePlayerBtn.addEventListener('click', () => {
    playerModal.classList.add('hidden');
    playerContainer.innerHTML = '';
    document.body.style.overflow = 'auto';
});