# Sidebar AI

> Una extensión de Chrome Manifest V3 que proporciona una interfaz de chat de IA en la barra lateral del navegador con endpoints de API personalizables, modelos y diseño de interfaz de usuario APPLE.

[English Version](README.md) | [中文版本](README.zh-CN.md) | [Versión en Español](README.es.md) | [Version Française](README.fr.md) | [日本語版](README.ja.md) | [русский язык](README.ru.md)

## Características

```
project/
├── manifest.json
├── background.js
├── sidebar.html
├── sidebar.css
├── sidebar.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── _locales/
│   ├── en/
│   │   └── messages.json
│   └── zh_CN/
│       └── messages.json
```

### Funcionalidad Principal
- **Integración de Barra Lateral**: Implementación nativa de barra lateral de Chrome usando la API de Panel Lateral de Manifest V3
- **Interfaz de Chat de IA**: Interacciones conversacionales de IA en tiempo real con respuestas en streaming
- **Soporte Multilingüe**: Internacionalización completa (i18n) con localizaciones en inglés, chino, español, francés, japonés
- **Almacenamiento Persistente**: Gestión del historial de conversaciones con persistencia en almacenamiento local

### Configuración de API
- **Endpoints de API Personalizables**: Endpoints REST configurables para servicios compatibles con OpenAI
- **Selección de Modelos**: Especificación flexible de modelos con soporte para varias arquitecturas LLM
- **Gestión de Autenticación**: Almacenamiento y gestión segura de claves API
- **Control de Temperatura**: Parámetros ajustables de creatividad de respuesta (rango 0.0-1.0)

### Gestión de Conversaciones
- **Historial de Sesiones**: Contexto de conversación persistente dentro de sesiones activas
- **Historial de Chat**: Archivo completo de conversaciones históricas con metadatos de timestamp
- **Cambio de Conversación**: Transición fluida entre múltiples contextos de chat
- **Eliminación Selectiva**: Gestión granular del historial de conversaciones con eliminación de registros individuales

### Diseño UI/UX
- **Diseño Responsivo**: Diseño adaptativo optimizado para varias dimensiones de viewport
- **Soporte para Modo Oscuro**: Detección automática de preferencias del sistema con cambio dinámico de tema
- **Micro-interacciones**: Animaciones y transiciones sutiles usando funciones de tiempo cubic-bezier
- **Cumplimiento de Accesibilidad**: Relaciones de contraste compatibles con WCAG y estructura HTML semántica

## Arquitectura Técnica

### Implementación de Manifest V3
- **Service Worker**: Script en segundo plano para gestión del ciclo de vida de la extensión
- **API de Panel Lateral**: Interfaz de barra lateral dedicada con contexto de ejecución aislado
- **API de Almacenamiento**: Configuración sincronizada y persistencia asíncrona de datos de conversación
- **Permisos de Host**: Acceso seguro a recursos cross-origin con declaraciones explícitas de dominio

### Consideraciones de Seguridad
- **Aislamiento de Credenciales**: Claves API almacenadas en mecanismos de almacenamiento cifrado de Chrome
- **Política de Seguridad de Contenido**: Implementación estricta de CSP previniendo vulnerabilidades XSS
- **Saneamiento de Entrada**: Codificación de entidades HTML para renderizado de contenido generado por usuarios
- **Limitación de Tasa**: Regulación de solicitudes del lado del cliente para prevenir abuso de API

### Optimización de Rendimiento
- **Carga Diferida**: Carga condicional de recursos basada en patrones de interacción del usuario
- **Gestión de Memoria**: Recolección eficiente de basura con poda de datos de conversación
- **Delegación de Eventos**: Manejo optimizado de eventos con técnicas de prevención de burbujeo
- **Desplazamiento Virtual**: Renderizado eficiente de DOM para historiales extensos de conversaciones

## Instalación

### Configuración de Desarrollo
1. Clona el repositorio en el entorno de desarrollo local
2. Navega a `chrome://extensions/` en el navegador basado en Chromium
3. Habilita el toggle "Modo de desarrollador"
4. Selecciona "Cargar extensión descomprimida" y elige el directorio de la extensión
5. Fija la extensión a la barra de herramientas para acceso conveniente

### Requisitos de Configuración
- **Endpoint de API**: URL de endpoint REST válida para servicios de completado de chat
- **Token de Autenticación**: Token Bearer para autenticación del servicio API
- **Identificador de Modelo**: Nombre de modelo válido compatible con el endpoint configurado

## Guía de Uso

### Operaciones Básicas
1. **Iniciar Chat**: Haz clic en el icono de la extensión para abrir la interfaz de barra lateral
2. **Configurar Ajustes**: Accede al panel de configuración mediante el icono de engranaje para configuración de API
3. **Comenzar Conversación**: Ingresa mensaje en el campo de entrada y presiona enviar o tecla Enter
4. **Gestionar Sesiones**: Usa el botón de nuevo chat para crear contextos de conversación frescos

### Características Avanzadas
- **Navegación de Historial**: Accede a conversaciones anteriores a través del panel de historial
- **Cambio de Contexto**: Carga conversaciones históricas para interacción continua
- **Limpieza Selectiva**: Elimina conversaciones individuales del archivo de historial
- **Adaptación de Tema**: Cambio automático de modo oscuro/claro basado en preferencias del sistema

## Soporte de Localización

### Idiomas Soportados
- Inglés
- Chino
- Español
- Francés
- Japonés
- Ruso

### Framework de Traducción
- **Paquetes de Mensajes**: Catálogos de mensajes i18n basados en JSON
- **Localización Dinámica**: Detección y cambio de idioma en tiempo de ejecución
- **Mecanismo de Fallback**: Degradación elegante al idioma por defecto

## Compatibilidad del Navegador

### Plataformas Soportadas
- **Google Chrome**: Versión 114+ con soporte de Manifest V3
- **Microsoft Edge**: Versiones basadas en Chromium con capacidad de panel lateral
- **Brave Browser**: Implementaciones compatibles con Manifest V3
- **Opera**: Versiones con motor Chromium con soporte de extensiones

### Requisitos del Sistema
- **Sistemas Operativos**: Windows 10+, macOS 10.15+, distribuciones Linux con GTK
- **Memoria**: Mínimo 4GB RAM recomendado para rendimiento óptimo
- **Almacenamiento**: 50MB de espacio en disco disponible para extensión y datos en caché

## Privacidad y Manejo de Datos

### Política de Recolección de Datos
- **Cero Rastreo**: Sin monitoreo de comportamiento de usuario o recolección de analíticas
- **Procesamiento Local**: Todos los datos de conversación procesados dentro del contexto del navegador
- **Sin Dependencias Externas**: Funcionalidad autocontenida sin servicios de terceros
- **Operaciones Transparentes**: Flujo de datos claro con mecanismos explícitos de consentimiento del usuario

### Gestión de Almacenamiento
- **Persistencia de Configuración**: Almacenamiento Sync de Chrome para configuración entre dispositivos
- **Archivo de Conversaciones**: Almacenamiento local con políticas automáticas de retención de datos
- **Optimización de Caché**: Utilización eficiente de memoria con rutinas automáticas de limpieza

## Hoja de Ruta de Desarrollo

### Mejoras Planificadas
- **Soporte Multi-modelo**: Interacción simultánea con múltiples servicios de IA
- **Funcionalidad de Exportación**: Serialización de datos de conversación en formatos estándar
- **Prompting Avanzado**: Capacidades de ingeniería de prompts basadas en plantillas
- **Integración de Voz**: Funcionalidad de voz a texto y texto a voz

### Mejoras Técnicas
- **Integración WebAssembly**: Optimización de rendimiento para procesamiento del lado del cliente
- **Mejora Progresiva**: Funcionalidad offline con almacenamiento en caché de service worker
- **Auditoría de Accesibilidad**: Verificación de cumplimiento WCAG 2.1 AA
- **Monitoreo de Rendimiento**: Recolección de métricas en tiempo real y optimización

## Contribución

### Flujo de Trabajo de Desarrollo
1. Bifurca el repositorio y crea una rama de características
2. Implementa cambios siguiendo los estándares de codificación establecidos
3. Ejecuta pruebas exhaustivas en todas las plataformas soportadas
4. Envía pull request con documentación detallada de cambios

### Estándares de Código
- **Sintaxis ES6+**: JavaScript moderno con patrones async/await
- **Arquitectura CSS**: Metodología BEM con theming de propiedades personalizadas
- **Prácticas de Seguridad**: Protocolos de validación de entrada y codificación de salida
- **Métricas de Rendimiento**: Puntuaciones Lighthouse y cumplimiento de Core Web Vitals

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para asistencia técnica y solicitudes de características, por favor envía issues a través del rastreador de issues del repositorio de GitHub. Las contribuciones y comentarios de la comunidad son bienvenidos a través de pull requests y discusiones.