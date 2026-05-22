# Gestión de Productos Financieros — Prueba Técnica Frontend

Aplicación web desarrollada con **Angular 20** para la gestión de productos financieros bancarios. Permite listar, crear, editar y eliminar productos, con validaciones en tiempo real, paginación, manejo centralizado de errores e interceptores HTTP.

---

## Tecnologías utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 20.x | Framework principal |
| TypeScript | 5.x | Lenguaje de programación |
| RxJS | 7.x | Programación reactiva |
| Jest | 29.x | Framework de testing |
| jest-preset-angular | 14.x | Integración Jest + Angular |
| SCSS | — | Estilos con variables y BEM |
| Angular CLI | 20.x | Tooling y scaffolding |

---

## Prerrequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Angular CLI** v20: `npm install -g @angular/cli`
- **Backend** corriendo localmente en `http://localhost:3002`

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd devsu-test

# 2. Instalar dependencias
npm install

# 3. Asegurarse de que el backend esté corriendo en http://localhost:3002

# 4. Levantar la aplicación
ng serve
```

Abrir el navegador en `http://localhost:4200`.

---

## Comandos disponibles

```bash
# Servidor de desarrollo
ng serve

# Ejecutar tests unitarios
npm test

# Tests con reporte de cobertura
npm test -- --coverage

# Build de producción
ng build
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/                          # Servicios y utilidades transversales
│   │   ├── errors/
│   │   │   └── app-error.model.ts     # Modelo de error tipado con códigos
│   │   ├── interceptors/
│   │   │   ├── error.interceptor.ts   # Convierte HttpErrorResponse → AppError
│   │   │   └── loading.interceptor.ts # Contador de requests activos
│   │   └── services/
│   │       └── loading.service.ts     # Signal-based global loading state
│   ├── features/
│   │   └── products/
│   │       ├── domain/                # Capa de dominio (pura, sin dependencias)
│   │       │   ├── models/
│   │       │   │   └── product.model.ts
│   │       │   └── repositories/
│   │       │       └── product.repository.ts   # Puerto (abstract class)
│   │       ├── application/           # Casos de uso (orquestación)
│   │       │   └── use-cases/
│   │       │       ├── create-product.use-case.ts
│   │       │       ├── delete-product.use-case.ts
│   │       │       ├── get-products.use-case.ts
│   │       │       ├── update-product.use-case.ts
│   │       │       └── verify-product-id.use-case.ts
│   │       ├── infrastructure/        # Adaptadores externos
│   │       │   ├── adapters/
│   │       │   │   └── product-http.repository.ts  # Implementación HTTP
│   │       │   └── dtos/
│   │       │       └── product.dto.ts
│   │       └── presentation/          # UI, estado, componentes
│   │           ├── state/
│   │           │   └── product.store.ts           # Estado reactivo con signals
│   │           ├── pages/
│   │           │   ├── product-list/              # Página de listado
│   │           │   └── product-form/              # Página de crear/editar
│   │           ├── components/
│   │           │   └── product-table/             # Tabla con menú contextual
│   │           └── validators/
│   │               └── product-form.validators.ts
│   ├── shared/                        # Componentes reutilizables
│   │   └── components/
│   │       ├── modal/                 # Diálogo de confirmación
│   │       └── pagination/            # Componente de paginación
│   └── app.config.ts                  # Configuración global (interceptores, router)
└── styles/
    └── _variables.scss                # Design tokens globales (colores, spacing)
```

---

## Arquitectura

El proyecto implementa **Clean Architecture** con separación estricta en 4 capas:

### 1. Dominio (`domain/`)
Contiene los modelos de negocio y el contrato del repositorio (`ProductRepository` como `abstract class`). No tiene dependencias externas. Es la capa más estable del sistema.

### 2. Aplicación (`application/`)
Casos de uso de responsabilidad única. Cada use case orquesta la interacción con el repositorio sin conocer detalles de implementación HTTP ni de UI.

### 3. Infraestructura (`infrastructure/`)
Implementación concreta del repositorio usando `HttpClient`. El adaptador `ProductHttpRepository` traduce DTOs de red al modelo de dominio. Se provee como token de DI a nivel de feature (route-level providers), manteniendo el aislamiento.

### 4. Presentación (`presentation/`)
Componentes Angular standalone con `ChangeDetectionStrategy.OnPush`. El estado se gestiona con un **Signal Store** (`ProductStore`) que expone computeds derivados: filtrado, paginación y totales. Los componentes son "tontos" respecto al estado global; sólo interactúan a través del store.

### Interceptores HTTP
- **`loadingInterceptor`** — incrementa y decrementa un contador de requests activos en `LoadingService`; usa `finalize()` para garantizar el decremento incluso ante errores.
- **`errorInterceptor`** — convierte `HttpErrorResponse` en `AppError` con código tipado (`NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`, `SERVER_ERROR`, `NETWORK_ERROR`). Los status `0` o `Unknown Error` se mapean a `NETWORK_ERROR`.

### Gestión de estado
`ProductStore` es un servicio con signals que centraliza:
- Lista de productos (`products`)
- Término de búsqueda (`searchTerm`) — filtra por nombre o descripción
- Tamaño de página (`pageSize`) — configurable por el usuario
- Página actual (`currentPage`) — se reinicia al filtrar o cambiar tamaño
- Computeds derivados: `filteredProducts`, `paginatedProducts`, `totalFiltered`, `totalPages`

---

## Testing

La suite de tests está implementada con **Jest** y `jest-preset-angular`, configurada para ejecutarse en modo zoneless (`provideZonelessChangeDetection()`).

### Cobertura actual

```
Statements   : > 90%
Branches     : > 85%
Functions    : > 90%
Lines        : > 90%
```

### Estrategia de testing

| Capa | Tipo de test | Herramienta |
|---|---|---|
| Repositorio HTTP | Tests de integración con mock HTTP | `HttpTestingController` |
| Casos de uso | Tests unitarios con repositorio mock | Jest mocks |
| Store | Tests unitarios de signals y computeds | Jest |
| Interceptores | Tests con `HttpTestingController` | `TestBed` |
| Componentes | Tests de renderizado y comportamiento | `ComponentFixture` |
| Validadores | Tests unitarios puros | Jest |
| Paginación | Tests del algoritmo `buildPageRange` | Jest |

### Técnicas destacadas

- `jest.useFakeTimers()` para testear el debounce de 400ms en el validador asíncrono de ID
- `jest.spyOn(router, 'navigate').mockResolvedValue(true)` para evitar errores de rutas en tests de componentes
- Mocks granulares: se mockean sólo las dependencias externas, manteniendo la lógica del SUT real

```bash
# Ejecutar todos los tests con cobertura
npm test -- --coverage --coverageReporters=text
```

---

## Funcionalidades implementadas

- [x] Listado de productos con búsqueda en tiempo real
- [x] Paginación con selector de tamaño de página (5, 10, 20)
- [x] Formulario de creación con validaciones síncronas y asíncronas
- [x] Validación asíncrona de ID único (debounce 400ms)
- [x] Sincronización automática de Fecha Revisión (+1 año desde Fecha Liberación)
- [x] Modo edición con precarga de datos del producto
- [x] Eliminación con modal de confirmación
- [x] Manejo centralizado de errores HTTP con mensajes descriptivos
- [x] Indicador global de carga (interceptor)
- [x] Fallback visual para logos inválidos (avatar SVG con iniciales)
- [x] Menú contextual por fila (editar / eliminar)
- [x] Diseño responsive adaptado a mobile y desktop
- [x] Accesibilidad: roles ARIA, `aria-live`, `aria-describedby`, `aria-current`

---

## Decisiones técnicas destacadas

**`abstract class` como token de DI en lugar de `InjectionToken<interface>`**
Angular no puede usar interfaces TypeScript como tokens DI (se borran en compilación). Usar `abstract class` permite mantener el contrato tipado y usarlo directamente como token, eliminando boilerplate de `InjectionToken`.

**Zoneless con `provideZonelessChangeDetection()`**
Elimina Zone.js del bundle, reduciendo el tamaño y mejorando el rendimiento. Requiere que todos los componentes sean `OnPush` y que los cambios de estado se expresen mediante signals o `markForCheck()`.

**`overflow-x: clip` en el scroll wrapper de la tabla**
`overflow: hidden` y `overflow: auto` crean un nuevo stacking context, lo que impide que el menú contextual (con `position: absolute` y `z-index` alto) se renderice encima del footer de la página. `overflow-x: clip` recorta el overflow sin crear stacking context, resolviendo el bug.

**Route-level providers para el feature de productos**
`ProductHttpRepository` y los use cases se proveen en la configuración de rutas del feature, no en `providedIn: 'root'`. Esto garantiza que el feature sea verdaderamente lazy-loadable y que sus dependencias no contaminen el scope global.

---

## Mejoras futuras

- Integrar `@angular/pwa` para soporte offline
- Agregar animaciones de transición entre rutas con `@angular/animations`
- Implementar virtualización de lista para catálogos grandes (`@angular/cdk/scrolling`)
- Añadir tests E2E con Playwright
- Internacionalización con `@angular/localize`

---

## Autor

**Jesús Agámez**  
Prueba técnica Frontend — Devsu  
Angular 20 · Clean Architecture · Signal-based State
