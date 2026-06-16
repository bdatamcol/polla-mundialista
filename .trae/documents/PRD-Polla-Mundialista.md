# Polla Mundialista Town Center - Documento de Requisitos (PRD)

## 1. Descripción General del Producto

**Polla Mundialista Town Center** es una plataforma web de predicciones deportivas para el Mundial 2026, diseñada para que los usuarios registrados puedan predecir resultados de partidos, acumular puntos y competir por premios. La plataforma es responsive, segura y está optimizada para funcionar en un subdominio dedicado (`polla.towncenter.com`).

### Propósito Principal
- Permitir a los usuarios de Town Center participar en una polla mundialista con predicciones de todos los partidos del Mundial 2026
- Generar engagement mediante rankings competitivos y sistema de puntos transparente
- Ofrecer una experiencia moderna con diseño responsive y fluida

### Usuarios Objetivo
- Empleados y miembros de la comunidad Town Center
- Aficionados al fútbol que desean competir en predicciones del Mundial

---

## 2. Roles de Usuario

| Rol | Método de Registro | Permisos Principales |
|-----|--------------------|--------------------|
| Usuario | Registro con email y contraseña | Hacer predicciones, ver ranking, ver premios |
| Administrador | Creado manualmente por sistema | CRUD partidos, cargar resultados, gestionar usuarios, gestionar premios |

---

## 3. Módulos y Estructura de Páginas

### 3.1 Páginas Públicas
1. **Landing Page (/)**: Hero con countdown, llamado a participar, partidos destacados, preview ranking top 5
2. **Reglamento (/reglamento)**: Cómo participar, cálculo de puntos, fechas límite, premios, reglas de desempate
3. **Premios (/premios)**: Listado de premios con imágenes y condiciones
4. **Ranking (/ranking)**: Tabla completa de posiciones con filtros

### 3.2 Páginas de Autenticación
5. **Login (/login)**: Formulario de inicio de sesión con email y contraseña
6. **Registro (/registro)**: Formulario de registro con nombre, email, contraseña y términos

### 3.3 Páginas de Usuario Autenticado
7. **Dashboard (/dashboard)**: Resumen personal - puntos, posición, próximos partidos
8. **Mis Predicciones (/predicciones)**: Lista de partidos con estado de predicciones
9. **Editar Predicción (/predicciones/[matchId])**: Formulario para predecir resultado
10. **Mi Perfil (/perfil)**: Información del usuario y historial

### 3.4 Panel de Administración
11. **Admin Dashboard (/admin)**: Vista general con estadísticas
12. **Gestionar Partidos (/admin/partidos)**: CRUD de partidos
13. **Cargar Resultados (/admin/resultados)**: Actualizar marcadores finales
14. **Gestionar Predicciones (/admin/predicciones)**: Ver todas las predicciones por partido
15. **Gestionar Usuarios (/admin/usuarios)**: Lista de usuarios registrados
16. **Gestionar Premios (/admin/premios)**: CRUD de premios
17. **Configuración (/admin/configuracion)**: Configuración de puntos

---

## 4. Modelos de Datos

### 4.1 User (Usuario)
- `id`: UUID (Primary Key)
- `name`: string (requerido)
- `email`: string (único, requerido)
- `password`: string (hasheada)
- `role`: enum (USER, ADMIN)
- `totalPoints`: integer (default 0)
- `exactScores`: integer (default 0) - Marcadores exactos acertados
- `correctWinners`: integer (default 0) - Ganadores acertados
- `createdAt`: datetime
- `updatedAt`: datetime

### 4.2 Match (Partido)
- `id`: UUID (Primary Key)
- `homeTeam`: string
- `awayTeam`: string
- `group`: string (ej: "Grupo A", "Octavos", "Final")
- `matchDate`: datetime
- `status`: enum (PENDING, LIVE, FINISHED)
- `homeGoals`: integer (nullable)
- `awayGoals`: integer (nullable)
- `createdAt`: datetime
- `updatedAt`: datetime

### 4.3 Prediction (Predicción)
- `id`: UUID (Primary Key)
- `userId`: UUID (FK -> User)
- `matchId`: UUID (FK -> Match)
- `homeGoals`: integer
- `awayGoals`: integer
- `points`: integer (default 0)
- `isExactScore`: boolean
- `isCorrectWinner`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime
- **Unique constraint**: (userId, matchId)

### 4.4 Prize (Premio)
- `id`: UUID (Primary Key)
- `position`: integer (1, 2, 3, etc.)
- `title`: string
- `description`: text
- `imageUrl`: string (nullable)
- `conditions`: text
- `isPublished`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

### 4.5 PointsConfig (Configuración de Puntos)
- `id`: UUID (Primary Key)
- `correctWinnerPoints`: integer (default 90)
- `exactScoreBonus`: integer (default 60)
- `totalExactScorePoints`: integer (default 150)
- `updatedAt`: datetime

### 4.6 AuditLog (Log de Auditoría - Opcional)
- `id`: UUID (Primary Key)
- `action`: string
- `userId`: UUID (nullable)
- `details`: json
- `createdAt`: datetime

---

## 5. Sistema de Puntos

### Reglas de Cálculo
1. **Acertar ganador o empate**: 90 puntos
2. **Marcador exacto**: 150 puntos totales (incluye los 90 + 60 bonus)
3. **No acertar**: 0 puntos

### Ejemplos
| Resultado Real | Predicción | Puntos | Explicación |
|----------------|------------|--------|-------------|
| Colombia 2 - 1 Japón | Colombia 1 - 0 Japón | 90 | Ganador correcto (Colombia gana) |
| Colombia 2 - 1 Japón | Colombia 2 - 1 Japón | 150 | Marcador exacto |
| Colombia 2 - 1 Japón | Colombia 0 - 1 Japón | 0 | Perdedor predicho como ganador |
| Colombia 2 - 1 Japón | Japón 1 - 0 Colombia | 0 | Ganador incorrecto |
| Colombia 2 - 1 Japón | Colombia 2 - 2 Japón | 90 | Empate predicho, pero no existe (diferencia) |

### Recálculo Automático
- Cuando el administrador carga el resultado final de un partido, el sistema recalcula automáticamente los puntos de todas las predicciones asociadas

---

## 6. Estados de Predicción

| Estado | Descripción | Visualización |
|--------|-------------|---------------|
| ABIERTA | Partido pendiente, puede predecir | Badge verde "Abierta" |
| PREDICHA | Usuario ya hizo su predicción | Badge azul "Tu predicción: X-Y" |
| BLOQUEADA | Partido en vivo o finalizado | Badge gris "Cerrada" |
| PUNTUADA | Partido finalizado con puntos asignados | Badge dorado con puntos |

---

## 7. Flujos Principales

### 7.1 Registro e Inicio de Sesión
```
Usuario -> /registro -> Formulario -> Validación -> Crear usuario -> Login automático -> /dashboard
Usuario -> /login -> Formulario -> Validación -> Sesión -> /dashboard
```

### 7.2 Hacer una Predicción
```
Usuario -> /predicciones -> Lista partidos -> Clic en partido abierto -> Formulario ->
Validación -> Guardar -> Mostrar predicción -> Recalcular ranking
```

### 7.3 Cargar Resultado (Admin)
```
Admin -> /admin/resultados -> Seleccionar partido -> Ingresar marcadores ->
Guardar -> Recalcular puntos de todas predicciones -> Actualizar ranking
```

### 7.4 Flujo de Autenticación (Mermaid)
```mermaid
flowchart TD
    A[Usuario] --> B{¿Autenticado?}
    B -->|No| C[/registro]
    B -->|No| D[/login]
    C --> E[Crear Usuario]
    D --> F[Validar Credenciales]
    E --> G[Crear Sesión]
    F --> G
    G --> H[/dashboard]
    H --> I{¿Admin?}
    I -->|Sí| J[/admin]
    I -->|No| K[/predicciones]
    J --> L[Gestionar Partidos]
    K --> M[Hacer Predicciones]
```

---

## 8. Diseño Visual

### 8.1 Paleta de Colores
- **Primary**: #1E3A5F (Azul Town Center oscuro)
- **Secondary**: #2E7D32 (Verde césped)
- **Accent**: #FFD700 (Dorado fútbol)
- **Background**: #0A1628 (Azul noche)
- **Surface**: #1A2A42 (Azul card)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #B0BEC5
- **Success**: #4CAF50
- **Warning**: #FF9800
- **Error**: #F44336

### 8.2 Tipografía
- **Display**: "Bebas Neue" (títulos impactantes)
- **Headings**: "Montserrat" 700
- **Body**: "Montserrat" 400
- **Monospace**: "JetBrains Mono" (para scores)

### 8.3 Estilo de Botones
- Botones primarios: Fondo dorado (#FFD700), texto negro, border-radius 8px
- Botones secundarios: Borde dorado, fondo transparente
- Hover: Escala 1.02, sombra elevada

### 8.4 Layout
- Cards con bordes redondeados (12px)
- Sombras sutiles con glow dorado en elementos destacados
- Gradientes oscuros en backgrounds
- Iconos: Lucide React

### 8.5 Animaciones
- Fade-in staggered en listas
- Hover con lift effect en cards
- Countdown animado en homepage
- Transiciones suaves de 200ms

---

## 9. Responsividad

- **Desktop**: Grid de 3-4 columnas para cards de partidos
- **Tablet**: Grid de 2 columnas
- **Mobile**: Stack vertical, menú hamburguesa
- Touch targets mínimo 44px

---

## 10. Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Validación de formularios con Zod
- Middleware de protección de rutas
- Rate limiting en autenticación
- Variables de entorno para secrets
- CSRF protection via Next.js
- Sanitización de inputs

---

## 11. Despliegue

### Opciones de Hosting
1. **Vercel + PostgreSQL externo** (Neon, Supabase, Railway)
2. **Railway** (Next.js + PostgreSQL)
3. **Render** (Web Service + PostgreSQL)
4. **VPS** (Docker + nginx)

### Subdominio
- Configurar `polla.towncenter.com` -> A/CNAME del hosting
- SSL automático via Let's Encrypt

---

## 12. Comandos de Instalación

```bash
# Clonar e instalar
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con credenciales

# Migrar base de datos
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Iniciar desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start
```
