# Modelo de Datos Relacional (PostgreSQL en Supabase)
## Estructura de Tablas, Integridad Referencial y Scripts SQL

---

## 1. Diagrama Entidad-Relación (Lógico)

```
┌─────────────────────────┐             ┌─────────────────────────┐
│       CUIDADORES        │             │        PACIENTES        │
├─────────────────────────┤             ├─────────────────────────┤
│ id (PK, UUID)           │ 1         N │ id (PK, UUID)           │
│ nombre_completo         ├─────────────┤ dni (UNIQUE)            │
│ email (UNIQUE)          │  (tutoría)  │ nombre_completo         │
│ telefono                │             │ edad                    │
│ parentesco              │             │ ipress_essalud          │
└─────────────────────────┘             │ telefono_emergencia     │
                                        └───────────┬─────────────┘
                                                    │
                      ┌─────────────────────────────┼─────────────────────────────┐
                      │ 1                         1 │                           1 │
                      ▼ N                           ▼ N                           ▼ N
        ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
        │         RECETAS         │   │    REGISTROS_PRESION    │   │    ALERTAS_CLINICAS     │
        ├─────────────────────────┤   ├─────────────────────────┤   ├─────────────────────────┤
        │ id (PK, UUID)           │   │ id (PK, UUID)           │   │ id (PK, UUID)           │
        │ paciente_id (FK)        │   │ paciente_id (FK)        │   │ paciente_id (FK)        │
        │ medicamento_nombre      │   │ sistolica (mmHg)        │   │ tipo (CRITICAL / SOS)   │
        │ dosis                   │   │ diastolica (mmHg)       │   │ severidad (HIGH/CRIT)   │
        │ frecuencia_horas        │   │ pulso (bpm)             │   │ titulo                  │
        │ imagen_pastilla_url     │   │ estado_clinico          │   │ descripcion             │
        │ stock_actual            │   │ fecha_registro          │   │ fecha_alerta            │
        └───────────┬─────────────┘   └─────────────────────────┘   │ atendida (BOOLEAN)      │
                    │                                               └─────────────────────────┘
                    │ 1
                    ▼ N
        ┌─────────────────────────┐
        │      TOMAS_DIARIAS      │
        ├─────────────────────────┤
        │ id (PK, UUID)           │
        │ receta_id (FK)          │
        │ hora_programada         │
        │ estado (PENDING/TAKEN)  │
        │ hora_tomada             │
        │ confirmado_por (METODO) │
        └─────────────────────────┘
```

---

## 2. Script de Creación de Tablas (DDL PostgreSQL)

```sql
-- Habilitar extensión para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Cuidadores Familiares
CREATE TABLE cuidadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Pacientes Asegurados (EsSalud)
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    edad INT NOT NULL CHECK (edad >= 0),
    ipress_essalud VARCHAR(120) NOT NULL, -- Policlínico o Centro Asistencial
    telefono_emergencia VARCHAR(20) NOT NULL,
    cuidador_id UUID REFERENCES cuidadores(id) ON DELETE SET NULL,
    modo_facil_activo BOOLEAN DEFAULT TRUE,
    guia_voz_activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Recetas Médicas y Existencias Farmacéuticas
CREATE TABLE recetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medicamento_nombre VARCHAR(120) NOT NULL,
    dosis VARCHAR(60) NOT NULL,
    frecuencia_horas INT NOT NULL DEFAULT 8,
    instrucciones TEXT,
    imagen_pastilla_url TEXT, -- Foto real del comprimido para Nielsen H6
    stock_actual INT NOT NULL DEFAULT 30 CHECK (stock_actual >= 0),
    vigencia_hasta DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Tomas Diarias Programadas
CREATE TABLE tomas_diarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    hora_programada TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (estado IN ('PENDING', 'TAKEN', 'OMITTED')),
    tomada_at TIMESTAMP WITH TIME ZONE,
    confirmado_por VARCHAR(30) DEFAULT 'MANUAL_PATIENT', -- MANUAL_PATIENT, VOICE_PATIENT, CAREGIVER
    fecha_toma DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 5. Tabla de Registros Biométricos (Presión Arterial y Pulso)
CREATE TABLE registros_presion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    sistolica INT NOT NULL CHECK (sistolica BETWEEN 50 AND 260),
    diastolica INT NOT NULL CHECK (diastolica BETWEEN 30 AND 160),
    pulso INT CHECK (pulso BETWEEN 30 AND 220),
    estado_clinico VARCHAR(20) NOT NULL CHECK (estado_clinico IN ('NORMAL', 'HIGH', 'CRITICAL')),
    registrado_via VARCHAR(30) DEFAULT 'APP_PACIENTE',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Alertas Clínicas y Eventos SOS
CREATE TABLE alertas_clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('CRITICAL_VITALS', 'PANIC_BUTTON', 'MISSED_MEDICATION', 'LOW_STOCK')),
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('INFO', 'WARNING', 'CRITICAL')),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    atendida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de Rendimiento para Consultas Frecuentes
CREATE INDEX idx_tomas_paciente_fecha ON tomas_diarias(paciente_id, fecha_toma);
CREATE INDEX idx_presion_paciente_fecha ON registros_presion(paciente_id, created_at DESC);
CREATE INDEX idx_alertas_paciente_no_atendidas ON alertas_clinicas(paciente_id, atendida);
```

---

## 3. Datos Semilla Iniciales de Demostración (Seed SQL)

```sql
-- Inserción de Cuidador de Prueba
INSERT INTO cuidadores (id, nombre_completo, email, telefono, parentesco)
VALUES ('c1111111-1111-1111-1111-111111111111', 'Gerson Vega Cisneros', 'gerson.vega@essalud-contigo.pe', '987654321', 'Hijo');

-- Inserción de Asegurado Adulto Mayor (Dacio Ramos)
INSERT INTO pacientes (id, dni, nombre_completo, edad, ipress_essalud, telefono_emergencia, cuidador_id)
VALUES ('p1111111-1111-1111-1111-111111111111', '08123456', 'Dacio Ramos Quispe', 78, 'Policlínico Chincha - EsSalud', '987654321', 'c1111111-1111-1111-1111-111111111111');

-- Inserción de Receta Crónica con Foto Real
INSERT INTO recetas (id, paciente_id, medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url, stock_actual)
VALUES ('r1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Losartán Potásico', '50 mg', 12, 'Tomar después del desayuno con agua tibia.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', 28);

-- Inserción de Toma Diaria
INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
VALUES ('r1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '08:00:00', 'PENDING', CURRENT_DATE);
```
