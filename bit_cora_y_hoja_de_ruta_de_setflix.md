# 🎬 SETFLIX - Plataforma de Streaming (Clon de Netflix)

**Setflix** es una aplicación web de catálogo y reproducción de películas y series en tiempo real, inspirada en la interfaz moderna de Netflix. Desarrollada como proyecto de práctica de arquitectura Frontend, consumo de APIs REST y seguridad web.

🔗 **Demo en vivo:** [https://bastion-code.github.io/Setflix-pagina-de-peliculas/](https://bastion-code.github.io/Setflix-pagina-de-peliculas/)

---

## 🛠️ Tecnologías Utilizadas
* **HTML5:** Estructura semántica de la aplicación y modales de reproducción.
* **CSS3 (Vanilla):** Diseño responsivo, variables CSS, animaciones (`hover`, `scale`), barras de desplazamiento ocultas y estética oscura pixel-perfect.
* **JavaScript (ES6+):** Peticiones asíncronas (`fetch`, `async/await`), manipulación dinámica del DOM, `localStorage` y manejo de eventos.
* **FontAwesome 6:** Iconografía de la interfaz (reproducción, búsqueda, notificaciones, perfiles).
* **APIs Integradas:**
  * **TMDB API (The Movie Database):** Obtención en tiempo real de portadas, fondos en alta definición, títulos, años de estreno y sinopsis en español.
  * **FramexTV API:** Motor de inserción de video en streaming mediante `<iframe>`.

---

## ✅ Lo que ya hicimos (Paso a Paso Completado)

### Etapa 1: Base y Conexión de APIs
- [x] **1. Arquitectura de archivos:** Separación limpia del código en `index.html`, `style.css` y `app.js`.
- [x] **2. Integración con TMDB:** Configuración de credenciales (`API_KEY`) y creación de funciones asíncronas para pedir catálogos reales de películas.
- [x] **3. Reproductor FramexTV:** Conexión del ID de cada película de TMDB con el reproductor embebido en un modal a pantalla completa.

### Etapa 2: Diseño Visual "Tal Cual Netflix"
- [x] **4. Barra de Navegación (Navbar):** Diseño fijo con efecto de transición a fondo negro al hacer scroll, logotipo de **SETFLIX**, enlaces de navegación, campana de notificaciones y avatar de usuario.
- [x] **5. Hero Banner Dinámico:** Portada principal gigante que elige una película en tendencia al azar cada vez que recarga la página, mostrando título, metadatos (`98% para ti`, año, `16+`, `HD`), sinopsis y botones de acción.
- [x] **6. Carruseles por Categoría:** Filas horizontales deslizables para *Nuevos Lanzamientos*, *Tendencias Ahora*, *Acción Pura*, *Comedias para reír* y *Terror y Suspenso*.
- [x] **7. Mejoras en Tarjetas:** Bordes redondeados, animación de zoom al pasar el mouse, títulos centrados debajo de cada miniatura y etiquetas rojas aleatorias de *"Recién agregado"* posicionadas sobre la imagen sin tapar el título.
- [x] **8. Buscador Integrado:** Barra de búsqueda funcional en la cabecera para encontrar cualquier película de la base de datos de TMDB por su título.

### Etapa 3: Seguridad y Despliegue
- [x] **9. Blindaje Anti-Publicidad y Rastreadores:** Implementación de los atributos `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"` y `referrerpolicy="no-referrer"` en el `<iframe>` para bloquear ventanas emergentes (pop-ups) y redirecciones maliciosas sin afectar el video.
- [x] **10. Publicación en GitHub Pages:** Control de versiones con Git desde VS Code y despliegue público accesible desde PC y celulares.

---

## 🚀 Cosas por hacer (Próximos Pasos)

Iremos marcando estas casillas con una `[x]` a medida que las vayamos programando:

### 📌 Fase 2: Historial y Favoritos en el Navegador (`localStorage`)
*En esta fase guardaremos los datos en la memoria del navegador para no necesitar todavía una base de datos externa.*
- [x] **11. Fila "Continuar viendo contenido de Seba":** Hacer que cada vez que abras una película, se guarde automáticamente en una fila especial arriba de todo con una barra de progreso roja debajo de la imagen.
- [x] **12. Sistema Avanzado de "Mi Lista" por Carpetas:** 
  - Vista dedicada limpia (sin superposición con el Hero Banner).
  - 4 carpetas principales por defecto: **Querés ver**, **Ya viste**, **Volvería a ver** y **No me gusta** + carpeta especial **Vista con Sol**.
  - Botón `+ Nueva lista` para crear carpetas personalizadas con cualquier nombre.
  - Opción para **renombrar** cualquier carpeta en cualquier momento.
  - Selector al tocar el botón `+` en una película para elegir en qué carpeta guardarla.
- [x] **13. Insignias "TOP 10":** Colocar el cartelito rojo de `TOP 10` en la esquina superior izquierda a las películas de la fila de tendencias.

### 📌 Fase 3: Series, Detalles y Filtros Avanzados
- [ ] **14. Ventana de "Más Información":** Hacer que el botón `ⓘ Más info` abra una tarjeta flotante con la trama completa, puntaje, géneros, fecha exacta de estreno y reparto antes de reproducir.
- [ ] **15. Sección de Series (TV Shows):** Activar el botón *"Series"* del menú y armar un selector de **Temporada** y **Episodio** dentro del reproductor para pasárselo a FramexTV (`/embed/{id}/{temporada}/{episodio}`).
- [ ] **16. Filtro por Plataformas y Cines:** Agregar botones o filas para filtrar películas que están actualmente en el cine o que pertenecen a Netflix, Disney+, Max o Prime Video.
- [ ] **17. Botones de Ordenamiento:** Opciones para ordenar los resultados de búsqueda por calificación (mejores puntuadas), año de estreno o alfabéticamente (A-Z).

### 📌 Fase 4: Perfiles y Cuentas en la Nube (Backend)
- [ ] **18. Pantalla "¿Quién está viendo ahora?":** Crear la pantalla clásica de inicio para elegir perfil (ej. *Seba*, *Sol*, *Amigos*, *Invitado*) con avatares propios.
- [ ] **19. Base de Datos Real (Firebase / Supabase):** Conectar un backend gratuito para que tu historial de *"Continuar viendo"* y *"Mi Lista"* se sincronicen automáticamente entre tu computadora y tu celular.

---

## 💻 Comandos rápidos para actualizar cambios en GitHub
Cada vez que terminemos uno de los puntos de arriba en VS Code, ejecutamos en la terminal:

```bash
git add .
git commit -m "Descripción del paso completado"
git push