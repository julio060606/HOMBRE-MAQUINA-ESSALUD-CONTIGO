-- ============================================================================
-- PROYECTO: ESSALUD CONTIGO - DATOS SEMILLA DE PRUEBA (SEED SQL)
-- DESCRIPCIÓN: Datos iniciales de demostración para el asegurado Dacio Ramos
-- ============================================================================

-- 1. LIMPIEZA PREVIA (En orden inverso de claves foráneas)
DELETE FROM alertas_clinicas;
DELETE FROM registros_presion;
DELETE FROM citas_medicas;
DELETE FROM tomas_diarias;
DELETE FROM recetas;
DELETE FROM pacientes;
DELETE FROM cuidadores;

-- 2. INSERTAR CUIDADOR PRINCIPAL (Familiar)
INSERT INTO cuidadores (id, nombre_completo, email, password, telefono, parentesco, codigo_cuidador)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'Gerson Vega Cisneros',
    'gerson.vega@essalud-contigo.pe',
    '12345678',
    '987654321',
    'Hijo',
    'CUID-1001'
);

-- 3. INSERTAR ASEGURADOS ADULTOS MAYORES (EsSalud)
-- Paciente 1: Dacio Ramos Quispe (78 años)
INSERT INTO pacientes (id, dni, nombre_completo, edad, ipress_essalud, telefono_emergencia, cuidador_id, codigo_enlace_familiar, modo_facil_activo, guia_voz_activa)
VALUES (
    'd1111111-1111-1111-1111-111111111111',
    '08123456',
    'Dacio Ramos Quispe',
    78,
    'Policlínico Chincha - EsSalud',
    '987654321',
    'c1111111-1111-1111-1111-111111111111',
    'FAM-8492',
    TRUE,
    TRUE
);

-- Paciente 2: Elena Morales Rivas (72 años)
INSERT INTO pacientes (id, dni, nombre_completo, edad, ipress_essalud, telefono_emergencia, cuidador_id, codigo_enlace_familiar, modo_facil_activo, guia_voz_activa)
VALUES (
    'e2222222-2222-2222-2222-222222222222',
    '07654321',
    'Elena Morales Rivas',
    72,
    'Policlínico Pablo Bermúdez - EsSalud',
    '987654321',
    'c1111111-1111-1111-1111-111111111111',
    'FAM-9123',
    TRUE,
    TRUE
);

-- 4. INSERTAR RECETAS CRÓNICAS CON TRAZABILIDAD DE FARMACIA ESSALUD
-- Receta 1: Losartán (Hipertensión) - En uso en casa
INSERT INTO recetas (
    id, paciente_id, numero_receta_essalud, medico_prescriptor, ipress_farmacia,
    medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url,
    cantidad_recetada, stock_actual, estado_dispensacion, fecha_dispensacion, vigencia_hasta
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    'REC-2026-004812',
    'Dr. Carlos Mendoza Paredes (Geriatría)',
    'Farmacia Principal - Policlínico Chincha',
    'Losartán Potásico',
    '50 mg',
    12,
    'Tomar después del desayuno con un vaso de agua tibia.',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    30,
    28,
    'EN_USO_DOMICILIO',
    NOW() - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '60 days'
);

-- Receta 2: Metformina (Diabetes Tipo 2) - En uso en casa
INSERT INTO recetas (
    id, paciente_id, numero_receta_essalud, medico_prescriptor, ipress_farmacia,
    medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url,
    cantidad_recetada, stock_actual, estado_dispensacion, fecha_dispensacion, vigencia_hasta
) VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'd1111111-1111-1111-1111-111111111111',
    'REC-2026-004813',
    'Dra. Sofía Alarcón (Endocrinología)',
    'Farmacia Principal - Policlínico Chincha',
    'Metformina Clorhidrato',
    '850 mg',
    24,
    'Tomar con el almuerzo principal.',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    30,
    22,
    'EN_USO_DOMICILIO',
    NOW() - INTERVAL '8 days',
    CURRENT_DATE + INTERVAL '45 days'
);

-- Receta 3: Atorvastatina (Colesterol) - En uso en casa
INSERT INTO recetas (
    id, paciente_id, numero_receta_essalud, medico_prescriptor, ipress_farmacia,
    medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url,
    cantidad_recetada, stock_actual, estado_dispensacion, fecha_dispensacion, vigencia_hasta
) VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'd1111111-1111-1111-1111-111111111111',
    'REC-2026-005190',
    'Dr. Carlos Mendoza Paredes (Geriatría)',
    'Farmacia Principal - Policlínico Chincha',
    'Atorvastatina',
    '20 mg',
    24,
    'Tomar antes de dormir con un vaso de agua.',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    30,
    26,
    'EN_USO_DOMICILIO',
    NOW() - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '60 days'
);

-- Receta 4: Vitamina D3 (Salud Ósea y Geriátrica) - En uso en casa
INSERT INTO recetas (
    id, paciente_id, numero_receta_essalud, medico_prescriptor, ipress_farmacia,
    medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url,
    cantidad_recetada, stock_actual, estado_dispensacion, fecha_dispensacion, vigencia_hasta
) VALUES (
    'a4444444-4444-4444-4444-444444444444',
    'd1111111-1111-1111-1111-111111111111',
    'REC-2026-005241',
    'Dr. Carlos Mendoza Paredes (Geriatría)',
    'Farmacia Principal - Policlínico Chincha',
    'Vitamina D3',
    '2000 UI',
    24,
    'Tomar con el almuerzo principal (comida con grasa para mejor absorción).',
    'https://images.unsplash.com/photo-1550572017-ed21124dd788?w=400',
    30,
    28,
    'EN_USO_DOMICILIO',
    NOW() - INTERVAL '4 days',
    CURRENT_DATE + INTERVAL '90 days'
);

-- 5. INSERTAR CITAS MÉDICAS OFICIALES DE ESSALUD (Dacio Ramos)
-- Cita 1: Programada para los próximos días (Presencial)
INSERT INTO citas_medicas (
    id, paciente_id, especialidad, medico_nombre, ipress, consultorio, fecha_hora, tipo_cita, estado_cita, motivo
) VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    'Geriatría',
    'Dr. Manuel Flores Barreda',
    'Policlínico Chincha - EsSalud',
    'Consultorio 204 (2do Piso)',
    NOW() + INTERVAL '3 days' + INTERVAL '10 hours',
    'PRESENCIAL',
    'PROGRAMADA',
    'Control mensual de hipertensión arterial y renovación de pauta farmacológica.'
);

-- Cita 2: En espera de atención / lista de interconsulta (Cardiología)
INSERT INTO citas_medicas (
    id, paciente_id, especialidad, medico_nombre, ipress, consultorio, fecha_hora, tipo_cita, estado_cita, motivo
) VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'd1111111-1111-1111-1111-111111111111',
    'Cardiología',
    'Médico por asignar (Red Almenara)',
    'Hospital Nacional Guillermo Almenara',
    'Pabellón C - Consulta Externa',
    NOW() + INTERVAL '14 days' + INTERVAL '9 hours',
    'PRESENCIAL',
    'EN_ESPERA',
    'Solicitud de ecocardiograma transtorácico de control.'
);

-- 6. INSERTAR CRONOGRAMA DE TOMAS PARA HOY (Diferentes momentos del día)
INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
VALUES 
-- 🌅 08:00 AM (Desayuno / Mañana) - 2 medicamentos
(
    'a1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    '08:00:00',
    'PENDING',
    CURRENT_DATE
),
(
    'a2222222-2222-2222-2222-222222222222',
    'd1111111-1111-1111-1111-111111111111',
    '08:00:00',
    'PENDING',
    CURRENT_DATE
),
-- ☀️ 13:00 PM (Almuerzo / Tarde) - 1 medicamento
(
    'a4444444-4444-4444-4444-444444444444',
    'd1111111-1111-1111-1111-111111111111',
    '13:00:00',
    'PENDING',
    CURRENT_DATE
),
-- 🌙 20:00 PM (Cena / Noche) - 2 medicamentos
(
    'a1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    '20:00:00',
    'PENDING',
    CURRENT_DATE
),
(
    'a3333333-3333-3333-3333-333333333333',
    'd1111111-1111-1111-1111-111111111111',
    '20:00:00',
    'PENDING',
    CURRENT_DATE
);

-- 7. INSERTAR REGISTROS HISTÓRICOS DE PRESIÓN ARTERIAL (Últimos 7 días)
INSERT INTO registros_presion (paciente_id, sistolica, diastolica, pulso, estado_clinico, registrado_via, notas, created_at)
VALUES
('d1111111-1111-1111-1111-111111111111', 120, 80, 72, 'NORMAL', 'APP_PACIENTE', 'Presión matutina basal', NOW() - INTERVAL '6 days'),
('d1111111-1111-1111-1111-111111111111', 122, 81, 70, 'NORMAL', 'APP_PACIENTE', 'Control después de caminar', NOW() - INTERVAL '5 days'),
('d1111111-1111-1111-1111-111111111111', 126, 83, 75, 'NORMAL', 'APP_PACIENTE', 'Medición al despertar', NOW() - INTERVAL '4 days'),
('d1111111-1111-1111-1111-111111111111', 121, 80, 71, 'NORMAL', 'APP_PACIENTE', 'Control en casa', NOW() - INTERVAL '3 days'),
('d1111111-1111-1111-1111-111111111111', 128, 84, 76, 'NORMAL', 'APP_PACIENTE', 'Día caluroso', NOW() - INTERVAL '2 days'),
('d1111111-1111-1111-1111-111111111111', 124, 82, 73, 'NORMAL', 'APP_PACIENTE', 'Control matutino', NOW() - INTERVAL '1 day'),
('d1111111-1111-1111-1111-111111111111', 120, 80, 72, 'NORMAL', 'APP_PACIENTE', 'Lectura de hoy', NOW());

-- 8. INSERTAR ALERTA INICIAL
INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion, atendida, created_at)
VALUES (
    'd1111111-1111-1111-1111-111111111111',
    'LOW_STOCK',
    'INFO',
    'Receta lista en Farmacia EsSalud',
    'La receta N° REC-2026-005190 de Atorvastatina 20mg está lista para recojo en Policlínico Chincha.',
    FALSE,
    NOW()
);
