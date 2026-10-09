# Fishy — API (backend)

API REST de **Fishy**, una app para reportar y consultar fraudes y estafas
digitales (SMS, correos, ligas falsas). Hecha con NestJS y MySQL. Cada
usuario se registra, entra con correo y contraseña, y con un token JWT
publica reportes, les agrega evidencias y marca "me pasó igual" en los de
otros. Un admin modera: ningún reporte se ve en las listas hasta que lo aprueba.

Proyecto del reto del curso **Integración de seguridad informática en redes y
sistemas de software** (TC2007B, Ago–Dic 2026). Lo consumen la app móvil y el
panel web de administración.

## Requisitos

- Node.js 20.19+ o 22.12+ (lo que pide `@nestjs/swagger` 12)
- MySQL 8 corriendo en `localhost:3306`

## Cómo correr

Todo se corre desde esta carpeta (`backend/`):

```bash
npm install
mysql -u root -p < db/schema.sql         # crea la base `fishy` y sus tablas (no borra datos)
mysql -u root -p fishy < db/seed.sql     # roles, estados, categorías y niveles de riesgo
npm run start:dev                        # http://localhost:3000
```

Sin `db/seed.sql` el registro falla: todo usuario nuevo recibe el rol
`usuario`, y ese rol sale del seed.

El servidor escucha en `0.0.0.0`, así que al arrancar también imprime la IP de
tu red local (`http://192.168.x.x:3000`); esa es la que usa la app del celular.

### Hacer admin a un usuario

No hay ruta para eso. Registra al usuario y cámbiale el rol en MySQL:

```sql
UPDATE usuario SET tieneRol = (SELECT id FROM rol WHERE nombre = 'admin')
WHERE correo = 'ana@example.com';
```

Después vuelve a hacer login: el rol viaja dentro del token, y el token viejo
sigue diciendo `usuario`.

## Configuración

| Variable / valor             | Dónde está hoy                      | Descripción                                          |
|------------------------------|-------------------------------------|------------------------------------------------------|
| `DATABASE_URL`               | `src/database/database.module.ts`   | Cadena de conexión a MySQL (usuario, contraseña, base `fishy`) |
| `SECRET`                     | `src/auth/jwt.ts`                   | Llave HMAC con la que se firman los tokens           |
| `ACCESS_TTL` / `REFRESH_TTL` | `src/auth/auth.service.ts`          | Vida de los tokens: 15 min y 7 días                  |
| `DB_API_KEY`                 | `src/usuario/usuario.repository.ts` | Llave escrita en el código; hoy ninguna ruta la usa  |
| Puerto `3000`                | `src/main.ts`                       | Puerto HTTP                                          |

Todos están escritos en el código. `ConfigModule` ya se carga en
`app.module.ts`, pero nada lee `process.env` todavía: un `.env` hoy no cambia
nada. Sacarlos a variables de entorno es parte de una sesión posterior.

Las fotos de las evidencias se guardan en `uploads/` y se sirven tal cual en
`/uploads/<archivo>`.

## Endpoints

Documentación interactiva en <http://localhost:3000/docs> (Swagger UI). El
documento OpenAPI crudo está en `/docs-json`.

Las rutas con **Bearer** requieren `Authorization: Bearer <accessToken>`; sin
él responden 401. Las marcadas **admin** además responden 403 a un usuario
normal. **dueño** significa que solo el autor del reporte puede hacerlo.

### Auth

| Método | Ruta              | Auth   | Qué hace                                                     |
|--------|-------------------|--------|--------------------------------------------------------------|
| POST   | `/auth/register`  | no     | Crea un usuario con rol `usuario` (`nombre`, `correo`, `contrasena` ≥ 8) |
| POST   | `/auth/login`     | no     | Regresa `accessToken` (15 min) y `refreshToken` (7 días)     |
| POST   | `/auth/refresh`   | no     | Access token nuevo a partir del refresh                      |
| GET    | `/auth/me`        | Bearer | `id`, `correo` y `rol` del token                             |

### Reportes

Un reporte nace `pendiente`. Mientras lo está, solo su dueño lo edita o lo
borra; ya moderado (`aprobado` o `rechazado`) queda congelado.

| Método | Ruta                       | Auth           | Qué hace                                         |
|--------|----------------------------|----------------|--------------------------------------------------|
| GET    | `/reportes`                | Bearer         | Admin: todos. Usuario: solo los aprobados        |
| POST   | `/reportes`                | Bearer         | Crea un reporte (`titulo`, `categorias`: ids)    |
| GET    | `/reportes/pendientes`     | Bearer (admin) | Cola de moderación                               |
| GET    | `/reportes/:id`            | Bearer         | Un reporte (admin y dueño: cualquiera; los demás: solo aprobados) |
| PATCH  | `/reportes/:id`            | Bearer (dueño) | Edita título o categorías mientras está pendiente |
| PATCH  | `/reportes/:id/moderar`    | Bearer (admin) | Aprueba o rechaza (`tieneEstado`, `tieneRiesgo`) |
| POST   | `/reportes/:id/like`       | Bearer         | Marca "me pasó igual"                            |
| DELETE | `/reportes/:id/like`       | Bearer         | Quita el "me pasó igual"                         |
| DELETE | `/reportes/:id`            | Bearer (dueño) | Borra un reporte pendiente y sus fotos (204)     |

### Evidencias

| Método | Ruta                     | Auth           | Qué hace                                            |
|--------|--------------------------|----------------|-----------------------------------------------------|
| GET    | `/evidencias`            | Bearer         | Admin: todas. Usuario: solo de reportes aprobados   |
| POST   | `/evidencias`            | Bearer (dueño) | Agrega evidencia a un reporte (`perteneceAReporte`, `url`, `descripcion`) |
| GET    | `/evidencias/:id`        | Bearer         | Una evidencia                                       |
| PATCH  | `/evidencias/:id`        | Bearer (dueño) | Edita `url` o `descripcion`                         |
| POST   | `/evidencias/:id/photo`  | Bearer         | Sube o reemplaza la foto (`multipart/form-data`, campo `photo`) |
| DELETE | `/evidencias/:id`        | Bearer (dueño) | Borra la evidencia y su foto (204)                  |

### Usuarios

| Método | Ruta              | Auth           | Qué hace                                       |
|--------|-------------------|----------------|------------------------------------------------|
| GET    | `/usuarios`       | Bearer (admin) | Lista usuarios                                 |
| POST   | `/usuarios`       | Bearer (admin) | Crea un usuario con rol `usuario` (contraseña de 10 a 72) |
| GET    | `/usuarios/:id`   | Bearer         | Tu usuario (admin: cualquiera)                 |
| PATCH  | `/usuarios/:id`   | Bearer         | Edita tu nombre, correo o contraseña (admin: cualquiera) |
| DELETE | `/usuarios/:id`   | Bearer (admin) | Borra un usuario (204)                         |

### Catálogos

| Método | Ruta                 | Auth           | Qué hace                                  |
|--------|----------------------|----------------|-------------------------------------------|
| GET    | `/categorias`        | Bearer         | Lista categorías (SMS, URL, Email…)       |
| GET    | `/categorias/:id`    | Bearer         | Una categoría                             |
| POST   | `/categorias`        | Bearer (admin) | Crea una categoría                        |
| PATCH  | `/categorias/:id`    | Bearer (admin) | Renombra una categoría                    |
| DELETE | `/categorias/:id`    | Bearer (admin) | Borra una categoría (204)                 |
| GET    | `/estados`           | Bearer         | pendiente, aprobado, rechazado            |
| GET    | `/estados/:id`       | Bearer         | Un estado                                 |
| GET    | `/riesgos`           | Bearer         | Bajo, Medio, Alto                         |
| GET    | `/riesgos/:id`       | Bearer         | Un nivel de riesgo                        |
| GET    | `/roles`             | Bearer (admin) | Lista roles                               |
| GET    | `/roles/:id`         | Bearer         | Un rol                                    |
| POST   | `/roles`             | Bearer (admin) | Crea un rol (`nombre`, `gatename`)        |
| PATCH  | `/roles/:id`         | Bearer (admin) | Edita un rol                              |
| DELETE | `/roles/:id`         | Bearer (admin) | Borra un rol (204)                        |

## Estructura

Cada módulo sigue el mismo patrón: controller → service → repository.

```
src/
├── main.ts              arranque, ValidationPipe global, CORS, /uploads estático, Swagger en /docs
├── app.module.ts
├── database/            pool de MySQL (mysql2)
├── auth/                registro, login, refresh, JWT a mano, AuthGuard y RolesGuard
├── usuario/             usuarios
├── rol/                 roles (admin, usuario)
├── reporte/             reportes, sus categorías y los "me pasó igual"
├── evidencia/           evidencias de un reporte y subida de fotos
├── categoria/           categorías de fraude
├── estado/              estados de moderación
└── riesgo/              niveles de riesgo
db/schema.sql            tablas (incluye lecturas y progreso_leecturas, que aún no tienen endpoints)
db/seed.sql              catálogos iniciales
uploads/                 fotos subidas
```

## Flujo de trabajo

```bash
git switch -c sesion-NN-tema      # una rama por sesión
git commit -m "tipo: qué cambió y por qué"
git push -u origin sesion-NN-tema # y abrir pull request a main
```
