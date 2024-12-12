<p align="center">
  <a href="https://universitariadecolombia.edu.co/" target="blank"><img src="./.github/images/Logo_universitaria.png" width="" alt="Logo Universitaria de colombia" /></a>
</p>

<p align="center">Cliente <a href="https://react.dev/" target="_blank">React</a> construido para la gestión de comunicaciones vía WhatsApp</p>

<p align="center">
  <a href="https://www.facebook.com/universitariadecolombia0" target="_blank">
    <img src="https://img.shields.io/badge/Facebook-Universidad%20de%20Colombia-blue?style=flat&logo=facebook" alt="Facebook" />
  </a>
  <a href="https://www.instagram.com/universitaria_oficial/" target="_blank">
    <img src="https://img.shields.io/badge/Instagram-Universidad%20de%20Colombia-pink?style=flat&logo=instagram" alt="Instagram" />
  </a>
  <a href="https://www.tiktok.com/@universitariadecolombia" target="_blank">
    <img src="https://img.shields.io/badge/TikTok-Universidad%20de%20Colombia-black?style=flat&logo=tiktok" alt="TikTok" />
  </a>
</p>

# Tabla de contenido

- [Tabla de contenido](#tabla-de-contenido)
  - [Descripción](#descripción)
  - [Tecnologías](#tecnologías)
  - [Requisitos](#requisitos)
    - [Entorno de Desarrollo](#entorno-de-desarrollo)
    - [Servicios en la Nube](#servicios-en-la-nube)
    - [Herramientas Necesarias](#herramientas-necesarias)
  - [Instalación](#instalación)
  - [Estructura del Proyecto](#estructura-del-proyecto)

## Descripción

Esta aplicación web está diseñada por el área de innovación de la Institución Universitaria de Colombia para proporcionar una interfaz de usuario moderna y eficiente para la gestión de comunicaciones vía WhatsApp. Permite:

- Autenticación segura mediante Google Cloud
- Gestión de conversaciones en tiempo real
- Envío y recepción de mensajes multimedia
- Visualización de métricas y estadísticas
- Administración de plantillas de mensajes
- Interfaz adaptativa y responsiva
- Gestión de configuraciones personalizadas

La arquitectura del frontend está construida con React y TypeScript, implementando las mejores prácticas de desarrollo y patrones de diseño modernos.

## Tecnologías

| Categoría         | Tecnologías       |
| ----------------- | ----------------- |
| Framework         | React, TypeScript |
| Autenticación     | Google Cloud Auth |
| Estilo y UI       | CSS Modules       |
| Calidad de código | ESLint            |
| DevTools          | Git, NPM          |

## Requisitos

### Entorno de Desarrollo
- ⚙️ Node.js 18 o superior
- 🌐 Navegador web moderno

### Servicios en la Nube
- 🔐 Cuenta de Google Cloud
- 🔑 Credenciales de autenticación configuradas

### Herramientas Necesarias
- 📦 Gestor de paquetes (npm/yarn/bun)
- 🔄 Control de versiones Git

## Instalación

```bash
# Clona el repositorio
git clone [URL_DEL_REPOSITORIO]

# Entra al directorio
cd [NOMBRE_DIRECTORIO]

# Instala dependencias
npm install

# varibles de entono
cp .env.example .env

# - despues de estar creado el .env entra al archivo y ingresa todas las variables.

# Inicia el servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```bash
src/
├── assets/              # Recursos estáticos
├── components/          # Componentes React
│   ├── googlecloud/    # Componentes de autenticación
│   ├── mensajelist/    # Componentes de mensajería
│   ├── metricas/       # Componentes de análisis
│   └── settings/       # Componentes de configuración
├── css/                # Estilos
│   ├── Admins/        # Estilos de administradores        
│   │   └── auth/      # Estilos de autenticación admin
│   └── Agentes/       # Estilos de agentes
│       └── auth/      # Estilos de autenticación agentes
├── services/           # Servicios y APIs
├── utils/              # Utilidades y helpers
├── main.tsx           # Punto de entrada
├── index.css          # Estilos globales
├── app.css            # Estilos de la aplicación
└── app.tsx            # Componente principal
```