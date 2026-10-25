/**
 * migrate.js
 * Script de migración y verificación de conexión a Supabase (PostgreSQL)
 * Ejecuta schema.sql y seed.sql utilizando conexión SSL segura.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no está definida en .env');
  process.exit(1);
}

async function runMigration() {
  console.log('🔄 Conectando a Supabase PostgreSQL...');
  console.log('📡 Host:', process.env.DB_HOST || 'db.liozqlizpovzlgmzjiic.supabase.co');

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Requerido para Supabase Cloud
  });

  try {
    await client.connect();
    console.log('✅ ¡Conexión exitosa con Supabase PostgreSQL!');

    // 1. Ejecutar schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📦 Aplicando schema.sql (Creación de tablas e índices)...');
    await client.query(schemaSql);
    console.log('✅ Tablas e índices creados correctamente en Supabase.');

    // 2. Ejecutar seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Aplicando seed.sql (Inserción de datos de prueba)...');
    await client.query(seedSql);
    console.log('✅ Datos semilla de Dacio Ramos y Elena Morales insertados.');

    // 3. Comprobar datos insertados
    const resPacientes = await client.query('SELECT count(*) FROM pacientes');
    const resRecetas = await client.query('SELECT count(*) FROM recetas');
    const resCitas = await client.query('SELECT count(*) FROM citas_medicas');
    const resTomas = await client.query('SELECT count(*) FROM tomas_diarias');
    const resPresion = await client.query('SELECT count(*) FROM registros_presion');

    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS EN LA NUBE:');
    console.log(`   - Pacientes registrados: ${resPacientes.rows[0].count}`);
    console.log(`   - Recetas de EsSalud:    ${resRecetas.rows[0].count}`);
    console.log(`   - Citas médicas oficiales: ${resCitas.rows[0].count}`);
    console.log(`   - Tomas programadas hoy: ${resTomas.rows[0].count}`);
    console.log(`   - Registros de presión:  ${resPresion.rows[0].count}`);
    console.log('\n🚀 ¡Migración completada con éxito en Supabase!');
  } catch (err) {
    console.error('❌ Error durante la migración en Supabase:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
