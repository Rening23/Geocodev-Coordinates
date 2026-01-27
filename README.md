# Geocodev-Coordinates

Plataforma web para transformar coordenadas **Geográficas ⇄ UTM** (WGS84), con soporte de conversión manual y por archivos (CSV/Excel). Incluye **backend en Django** y **frontend en React**, listo para correr en local o con Docker.

## Stack

- **Backend**: Python 3.11, Django 5, Django REST Framework, PyProj, Pandas
- **Frontend**: React (CRA), React Router
- **Contenedores**: Docker + Docker Compose

## Qué hace

- **Geográficas → UTM**
  - Conversión manual (latitud/longitud)
  - Conversión por archivo (CSV/Excel)
- **UTM → Geográficas**
  - Conversión manual (este, norte, huso, hemisferio)
  - Conversión por archivo (CSV/Excel)

## Endpoints del backend

- `POST /geographic_to_utm_view/`
- `POST /utm-a-geograficas/`
- `POST /batch-geo-a-utm/`
- `POST /batch-utm-a-geograficas/`

## Formatos de archivo

### Geo → UTM
Archivo **CSV o Excel** con columnas:
- `latitud`
- `longitud`

### UTM → Geo
Archivo **CSV o Excel** con columnas:
- `este`
- `norte`
- `huso`
- `hemisferio` (N o S)

---

# Puesta en marcha en local (sin Docker)

## Requisitos
- Python 3.11+
- Node 18+ (o 20+ recomendado)

## Backend

```bash
cd geodetic_calculator
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Frontend

```bash
cd geocodev-frontend
npm install
npm start
```

El frontend quedará en: `http://localhost:3000`

---

# Puesta en marcha con Docker

## Requisitos
- Docker
- Docker Compose

```bash
cd geodetic_calculator
docker compose up --build
```

Servicios:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

---

# Configuración

## Backend (.env)
Archivo: `geodetic_calculator/.env`

```env
DJANGO_SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Frontend (.env)
Archivo: `geocodev-frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8000
```

---

# Notas

- Todas las transformaciones usan **WGS84**.
- Los endpoints aceptan `application/json` (para manual) y `multipart/form-data` (para archivos).
- Si cambias el puerto del backend, actualiza `REACT_APP_API_URL`.

