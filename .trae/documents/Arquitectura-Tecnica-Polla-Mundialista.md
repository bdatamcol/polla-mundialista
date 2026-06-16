# Polla Mundialista Town Center - Arquitectura Técnica

## 1. Arquitectura del Sistema

```mermaid
flowchart TB
    subgraph Cliente["Frontend (Next.js App Router)"]
        UI[Pages / Components]
        Forms[Forms con Zod]
        Context[Auth Context]
    end

    subgraph Servidor["Backend (Next.js Server Actions + API Routes)"]
        Actions[Server Actions]
        Middleware[Middleware]
        Validators[Zod Validators]
    end

    subgraph Datos["Capa de Datos"]
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL)]
    end

    subgraph External["Servicios Externos"]
        Email[Email Service]
        Storage[Storage CDN]
    end

    Cliente --> Servidor
    Servidor --> Datos
    Servidor --> External
    UI --> Context
    Actions --> Prisma
    Prisma --> PostgreSQL
```

## 2. Estructura de Carpetas

```
polla-mundialista/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── registro/
│   │   │       └── page.tsx
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # Landing
│   │   │   ├── ranking/
│   │   │   │   └── page.tsx
│   │   │   ├── premios/
│   │   │   │   └── page.tsx
│   │   │   └── reglamento/
│   │   │       └── page.tsx
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── predicciones/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [matchId]/
│   │   │   │       └── page.tsx
│   │   │   └── perfil/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── partidos/
│   │   │   │   └── page.tsx
│   │   │   ├── resultados/
│   │   │   │   └── page.tsx
│   │   │   ├── predicciones/
│   │   │   │   └── page.tsx
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx
│   │   │   ├── premios/
│   │   │   │   └── page.tsx
│   │   │   └── configuracion/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── revalidate/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── MatchCard.tsx
│   │   ├── PredictionForm.tsx
│   │   ├── RankingTable.tsx
│   │   ├── Countdown.tsx
│   │   ├── PrizeCard.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── providers/
│   │       └── AuthProvider.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── points.ts
│   │   ├── validations.ts
│   │   └── utils.ts
│   ├── actions/
│   │   ├── auth-actions.ts
│   │   ├── match-actions.ts
│   │   ├── prediction-actions.ts
│   │   ├── user-actions.ts
│   │   └── admin-actions.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts
├── public/
│   ├── images/
│   └── icons/
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 3. Definición de Rutas

### 3.1 Rutas Públicas
| Ruta | Propósito | Autenticación |
|------|-----------|---------------|
| `/` | Landing page con hero y countdown | No |
| `/ranking` | Tabla de posiciones | No |
| `/premios` | Listado de premios | No |
| `/reglamento` | Reglas y condiciones | No |

### 3.2 Rutas de Autenticación
| Ruta | Propósito | Redirección |
|------|-----------|------------|
| `/login` | Formulario de login | → /dashboard si ya autenticado |
| `/registro` | Formulario de registro | → /dashboard si ya autenticado |

### 3.3 Rutas Protegidas (Usuario)
| Ruta | Propósito |
|------|-----------|
| `/dashboard` | Resumen personal |
| `/predicciones` | Lista de partidos y predicciones |
| `/predicciones/[matchId]` | Editar predicción específica |
| `/perfil` | Perfil del usuario |

### 3.4 Rutas de Admin
| Ruta | Propósito |
|------|-----------|
| `/admin` | Dashboard administrativo |
| `/admin/partidos` | CRUD de partidos |
| `/admin/resultados` | Cargar marcadores |
| `/admin/predicciones` | Ver predicciones |
| `/admin/usuarios` | Gestionar usuarios |
| `/admin/premios` | CRUD de premios |
| `/admin/configuracion` | Configurar puntos |

## 4. Schema de Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum MatchStatus {
  PENDING
  LIVE
  FINISHED
}

model User {
  id            String       @id @default(uuid())
  name          String
  email         String       @unique
  password      String
  role          Role         @default(USER)
  totalPoints   Int          @default(0)
  exactScores   Int          @default(0)
  correctWinners Int         @default(0)
  predictions   Prediction[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([email])
  @@index([totalPoints])
}

model Match {
  id          String       @id @default(uuid())
  homeTeam    String
  awayTeam    String
  group       String
  matchDate   DateTime
  status      MatchStatus  @default(PENDING)
  homeGoals   Int?
  awayGoals   Int?
  predictions Prediction[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([matchDate])
  @@index([status])
  @@index([group])
}

model Prediction {
  id              String   @id @default(uuid())
  userId          String
  matchId         String
  homeGoals       Int
  awayGoals       Int
  points          Int      @default(0)
  isExactScore    Boolean  @default(false)
  isCorrectWinner Boolean  @default(false)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  match           Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, matchId])
  @@index([userId])
  @@index([matchId])
}

model Prize {
  id          String   @id @default(uuid())
  position    Int
  title       String
  description String
  imageUrl    String?
  conditions  String
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([position])
}

model PointsConfig {
  id                   String @id @default(uuid())
  correctWinnerPoints  Int    @default(90)
  exactScoreBonus      Int    @default(60)
  totalExactScorePoints Int   @default(150)
  updatedAt            DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  userId    String?
  details   Json?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
}
```

## 5. API y Server Actions

### 5.1 Autenticación

```typescript
// src/actions/auth-actions.ts

// Registro
async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }>

// Login
async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }>

// Logout
async function logoutUser(): Promise<void>

// Obtener sesión actual
async function getCurrentUser(): Promise<User | null>
```

### 5.2 Partidos

```typescript
// src/actions/match-actions.ts

async function getMatches(filters?: {
  status?: MatchStatus;
  group?: string;
}): Promise<Match[]>

async function getMatch(id: string): Promise<Match | null>

async function createMatch(data: CreateMatchInput): Promise<Match>

async function updateMatch(id: string, data: UpdateMatchInput): Promise<Match>

async function deleteMatch(id: string): Promise<void>

async function loadResults(id: string, homeGoals: number, awayGoals: number): Promise<void>
```

### 5.3 Predicciones

```typescript
// src/actions/prediction-actions.ts

async function getPredictions(userId?: string): Promise<PredictionWithMatch[]>

async function getPrediction(userId: string, matchId: string): Promise<Prediction | null>

async function createPrediction(data: {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
}): Promise<Prediction>

async function updatePrediction(id: string, data: {
  homeGoals: number;
  awayGoals: number;
}): Promise<Prediction>

async function calculatePoints(matchId: string): Promise<void>
```

### 5.4 Usuarios y Ranking

```typescript
// src/actions/user-actions.ts

async function getUsers(): Promise<User[]>

async function getUser(id: string): Promise<User | null>

async function updateUser(id: string, data: UpdateUserInput): Promise<User>

async function getRanking(options?: {
  limit?: number;
  offset?: number;
}): Promise<RankingEntry[]>

async function recalculateAllPoints(): Promise<void>
```

## 6. Funciones de Cálculo de Puntos

```typescript
// src/lib/points.ts

interface PointsResult {
  points: number;
  isExactScore: boolean;
  isCorrectWinner: boolean;
}

function calculatePredictionPoints(
  homeGoals: number,
  awayGoals: number,
  realHomeGoals: number,
  realAwayGoals: number,
  config: PointsConfig
): PointsResult {
  const isExactScore = homeGoals === realHomeGoals && awayGoals === realAwayGoals;
  const isCorrectWinner = getWinner(homeGoals, awayGoals) === getWinner(realHomeGoals, realAwayGoals);

  let points = 0;

  if (isExactScore) {
    points = config.totalExactScorePoints; // 150 puntos
  } else if (isCorrectWinner) {
    points = config.correctWinnerPoints; // 90 puntos
  }

  return { points, isExactScore, isCorrectWinner };
}

function getWinner(homeGoals: number, awayGoals: number): 'home' | 'away' | 'draw' {
  if (homeGoals > awayGoals) return 'home';
  if (awayGoals > homeGoals) return 'away';
  return 'draw';
}
```

## 7. Middleware de Protección

```typescript
// src/middleware.ts

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('session');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/registro'].includes(pathname);
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/predicciones') ||
                           pathname.startsWith('/perfil');

  // Redirecciones de autenticación
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Proteger rutas admin
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

## 8. Validaciones con Zod

```typescript
// src/lib/validations.ts

import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener mayúscula')
    .regex(/[0-9]/, 'Debe tener número'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debe aceptar los términos' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const predictionSchema = z.object({
  matchId: z.string().uuid('ID de partido inválido'),
  homeGoals: z.number().int().min(0).max(20),
  awayGoals: z.number().int().min(0).max(20),
});

export const matchSchema = z.object({
  homeTeam: z.string().min(1, 'Equipo local requerido'),
  awayTeam: z.string().min(1, 'Equipo visitante requerido'),
  group: z.string().min(1, 'Grupo requerido'),
  matchDate: z.string().datetime('Fecha inválida'),
});

export const resultSchema = z.object({
  homeGoals: z.number().int().min(0).max(20),
  awayGoals: z.number().int().min(0).max(20),
});
```

## 9. Variables de Entorno

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/polla_mundialista?schema=public"

# Auth
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
NEXTAUTH_URL="https://polla.towncenter.com"

# App
NEXT_PUBLIC_APP_URL="https://polla.towncenter.com"
NEXT_PUBLIC_APP_NAME="Polla Mundialista Town Center"
```

## 10. Consultas Prisma de Ejemplo

```typescript
// Obtener ranking con paginación
const ranking = await prisma.user.findMany({
  orderBy: [
    { totalPoints: 'desc' },
    { exactScores: 'desc' },
    { correctWinners: 'desc' },
    { createdAt: 'asc' }
  ],
  select: {
    id: true,
    name: true,
    totalPoints: true,
    exactScores: true,
    correctWinners: true,
    _count: { select: { predictions: true } }
  },
  take: 10,
  skip: 0
});

// Obtener partido con predicciones de un usuario
const matchWithPredictions = await prisma.match.findUnique({
  where: { id: matchId },
  include: {
    predictions: {
      where: { userId: userId },
      take: 1
    }
  }
});

// Recalcular puntos de todas las predicciones de un partido
const predictions = await prisma.prediction.findMany({
  where: { matchId: matchId },
  include: { match: true }
});

for (const prediction of predictions) {
  const result = calculatePredictionPoints(
    prediction.homeGoals,
    prediction.awayGoals,
    prediction.match.homeGoals!,
    prediction.match.awayGoals!,
    pointsConfig
  );

  await prisma.prediction.update({
    where: { id: prediction.id },
    data: {
      points: result.points,
      isExactScore: result.isExactScore,
      isCorrectWinner: result.isCorrectWinner
    }
  });
}

// Actualizar puntos totales del usuario
await prisma.user.update({
  where: { id: userId },
  data: {
    totalPoints: { increment: points },
    exactScores: { increment: isExactScore ? 1 : 0 },
    correctWinners: { increment: isCorrectWinner ? 1 : 0 }
  }
});
```

## 11. Recomendaciones de Despliegue

### Opción 1: Vercel + Neon PostgreSQL
```bash
# Conectar Neon como PostgreSQL externo
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/polla_mundialista?sslmode=require"

# Deploy automático desde GitHub
# Configurar subdominio en Vercel
```

### Opción 2: Railway
```bash
# Railway detecta Next.js automáticamente
# Añadir PostgreSQL como plugin
# Deploy con: railway up
```

### Opción 3: VPS con Docker
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Configuración de Subdominio
1. Crear registro CNAME: `polla.towncenter.com` → `cname.vercel-dns.com`
2. Configurar dominio personalizado en el hosting
3. SSL automático generalmente incluido

## 12. Comandos

```bash
# Instalación
npm install
cp .env.example .env

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Prisma
npx prisma migrate dev              # Crear migración
npx prisma migrate deploy          # Aplicar migraciones
npx prisma generate                 # Generar cliente
npx prisma studio                   # UI de base de datos

# Linting
npm run lint

# Type checking
npm run typecheck
```
