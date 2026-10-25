-- ============================================================================
-- PROYECTO: ESSALUD CONTIGO - BASE DE DATOS SUPABASE (POSTGRESQL 15)
-- DESCRIPCIÓN: Esquema Relacional de Teleasistencia, Adherencia y Servicios EsSalud
-- ============================================================================

-- Habilitar extensión para generación de identificadores únicos UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreación limpia de tablas
DROP TABLE IF EXISTS alertas_clinicas CASCADE;
DROP TABLE IF EXISTS registros_presion CASCADE;
DROP TABLE IF EXISTS citas_medicas CASCADE;
DROP TABLE IF EXISTS tomas_diarias CASCADE;
DROP TABLE IF EXISTS recetas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS cuidadores CASCADE;

-- 1. TABLA: CUIDADORES FAMILIARES
CREATE TABLE IF NOT EXISTS cuidadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '12345678',
    telefono VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL, -- Hijo, Hija, Cónyuge, Cuidador Formal
    codigo_cuidador VARCHAR(20) UNIQUE DEFAULT 'CUID-1001',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: PACIENTES ASEGURADOS (ADULTOS MAYORES DE ESSALUD)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    edad INT NOT NULL CHECK (edad >= 0),
    ipress_essalud VARCHAR(120) NOT NULL, -- Policlínico o Centro Asistencial
    telefono_emergencia VARCHAR(20) NOT NULL,
    cuidador_id UUID REFERENCES cuidadores(id) ON DELETE SET NULL,
    codigo_enlace_familiar VARCHAR(20) UNIQUE DEFAULT 'FAM-8492',
    modo_facil_activo BOOLEAN DEFAULT TRUE,
    guia_voz_activa BOOLEAN DEFAULT TRUE,
    configuracion_clinica JSONB DEFAULT '{"systolicMaxNormal": 140, "systolicMinNormal": 90, "diastolicMaxNormal": 90, "diastolicMinNormal": 60, "notifyOnOutOfRange": true, "notifyMissedDoseMinutes": 30}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: RECETAS MÉDICAS Y TRAZABILIDAD DE FARMACIA ESSALUD
CREATE TABLE IF NOT EXISTS recetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    numero_receta_essalud VARCHAR(50) NOT NULL, -- Código oficial (ej. REC-2026-004812)
    medico_prescriptor VARCHAR(150) NOT NULL, -- Médico tratante en EsSalud
    ipress_farmacia VARCHAR(150) NOT NULL, -- Farmacia donde se recoge
    medicamento_nombre VARCHAR(120) NOT NULL,
    dosis VARCHAR(60) NOT NULL,
    frecuencia_horas INT NOT NULL DEFAULT 12,
    instrucciones TEXT,
    imagen_pastilla_url TEXT, -- Fotografía real del comprimido (Nielsen H6)
    cantidad_recetada INT NOT NULL DEFAULT 30 CHECK (cantidad_recetada > 0),
    stock_actual INT NOT NULL DEFAULT 30 CHECK (stock_actual >= 0),
    estado_dispensacion VARCHAR(50) NOT NULL DEFAULT 'EN_USO_DOMICILIO'
        CHECK (estado_dispensacion IN ('PENDIENTE_RECOJO', 'DISPENSADA_EN_FARMACIA', 'EN_USO_DOMICILIO', 'AGOTADA', 'DESABASTECIDO')),
    fecha_dispensacion TIMESTAMP WITH TIME ZONE,
    vigencia_hasta DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: TOMAS DIARIAS PROGRAMADAS
CREATE TABLE IF NOT EXISTS tomas_diarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    hora_programada TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (estado IN ('PENDING', 'TAKEN', 'OMITTED')),
    tomada_at TIMESTAMP WITH TIME ZONE,
    confirmado_por VARCHAR(30) DEFAULT 'MANUAL_PATIENT', -- MANUAL_PATIENT, VOICE_PATIENT, CAREGIVER
    fecha_toma DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 5. TABLA: CITAS MÉDICAS OFICIALES DE ESSALUD
CREATE TABLE IF NOT EXISTS citas_medicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    especialidad VARCHAR(100) NOT NULL, -- Geriatría, Cardiología, Medicina General
    medico_nombre VARCHAR(150) NOT NULL,
    ipress VARCHAR(150) NOT NULL, -- Policlínico Chincha, Hospital Rebagliati
    consultorio VARCHAR(50),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_cita VARCHAR(30) NOT NULL DEFAULT 'PRESENCIAL' CHECK (tipo_cita IN ('PRESENCIAL', 'TELEMEDICINA')),
    estado_cita VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA' 
        CHECK (estado_cita IN ('PROGRAMADA', 'EN_ESPERA', 'ATENDIDA', 'CANCELADA')),
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: REGISTROS BIOMÉTRICOS (PRESIÓN ARTERIAL Y PULSO)
CREATE TABLE IF NOT EXISTS registros_presion (
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

-- 7. TABLA: ALERTAS CLÍNICAS Y EVENTOS SOS DE AUXILIO
CREATE TABLE IF NOT EXISTS alertas_clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('CRITICAL_VITALS', 'PANIC_BUTTON', 'MISSED_MEDICATION', 'LOW_STOCK', 'APPOINTMENT_REQUESTED', 'APPOINTMENT_CONFIRMED', 'PRESCRIPTION_ISSUED', 'PRESCRIPTION_DISPENSED', 'MEDICATION_RESTOCKED')),
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('INFO', 'WARNING', 'CRITICAL')),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    atendida BOOLEAN DEFAULT FALSE,
    resuelta_at TIMESTAMP WITH TIME ZONE,
    resuelta_por VARCHAR(100),
    motivo_resolucion VARCHAR(100),
    notas_resolucion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES DE RENDIMIENTO PARA CONSULTAS FRECUENTES
CREATE INDEX IF NOT EXISTS idx_tomas_paciente_fecha ON tomas_diarias(paciente_id, fecha_toma);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_fecha ON citas_medicas(paciente_id, fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_presion_paciente_fecha ON registros_presion(paciente_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_paciente_atendida ON alertas_clinicas(paciente_id, atendida);
CREATE INDEX IF NOT EXISTS idx_recetas_paciente ON recetas(paciente_id);
