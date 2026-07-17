-- Crea la base de datos de n8n si no existe
SELECT 'CREATE DATABASE n8n OWNER autopyme'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec
