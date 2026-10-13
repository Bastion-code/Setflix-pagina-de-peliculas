# SETFLIX - Clon de Netflix 🎬

Este proyecto es un clon de la interfaz web de Netflix, desarrollado como práctica de maquetación y consumo de APIs REST. El objetivo principal es replicar la experiencia visual del usuario y permitir la reproducción de trailers/películas utilizando servicios externos de manera fluida.

## 🚀 Tecnologías Utilizadas
* **HTML5:** Estructura semántica.
* **CSS3 (Vanilla):** Estilos, animaciones (`hover`, `transform`), diseño responsivo (Flexbox/Grid), y variables de entorno.
* **JavaScript (ES6+):** Lógica asíncrona (`fetch`, `async/await`), manipulación del DOM e inyección dinámica de componentes.
* **APIs Externas:**
  * **TMDB (The Movie Database):** Base de datos principal para obtener el catálogo (títulos, portadas, sinopsis, géneros, calificaciones).
  * **FramexTV API:** Motor de extracción y reproducción mediante inserción de `iframes`.

---

## 🗺️ Hoja de Ruta (Roadmap)

### ✅ Fase 1: MVP Frontend (¡Completado!)
- [x] Configuración inicial del repositorio.
- [x] Maquetación base del `index.html` (Navbar, Hero Banner, Filas).
- [x] Estilos CSS puros intentando lograr pixel-perfect respecto al diseño original.
- [x] Conexión a la API de TMDB (Generación de Token).
- [x] Lógica de JavaScript para obtener "Tendencias", "Nuevos Lanzamientos", etc.
- [x] Integración de FramexTV: Al hacer clic en una portada, se abre un reproductor superpuesto.
- [x] Motor de búsqueda funcional integrado al header.
- [x] Detalles UI: Insignias de "TOP 10", etiquetas de "Recién agregado" y barra de progreso simulada.

### ⏳ Fase 2: Backend y Usuarios (Próximamente)
- [ ] **Autenticación de Usuarios:** Permitir registro e inicio de sesión.
- [ ] **Integración de Base de Datos:** Migración a servicios como Firebase o Supabase para almacenar datos persistentes.
- [ ] **Sistema de Perfiles:** Soporte para múltiples perfiles bajo una misma cuenta.
- [ ] **Mi Lista (Favoritos):** Funcionalidad para que el usuario guarde películas que quiere ver.
- [ ] **Historial de Reproducción:** Lógica real para la fila "Continuar viendo contenido de [Usuario]", guardando el timestamp (minuto exacto) en el que se dejó de ver la película.

---

## 🛠️ Cómo ejecutar el proyecto localmente

1. Clona este repositorio en tu máquina:
   ```bash
   git clone [https://github.com/tu-usuario/setflix.git](https://github.com/tu-usuario/setflix.git)