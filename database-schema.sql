-- ============================================
-- Complete Database Schema for Notes App
-- Multi-Tenant Application
-- ============================================

-- Connect to the database first
\c notesapp_db

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- ============================================
-- Table: tenants
-- Stores tenant/organization information-- ============================================
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    subscription_plan VARCHAR(255) NOT NULL CHECK (subscription_plan IN ('FREE', 'PRO'))
);

-- ============================================
-- Table: users
-- Stores user authentication and tenant mapping
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('ADMIN', 'MEMBER')),
    tenant_id BIGINT NOT NULL
);

-- ============================================
-- Table: notes
-- Stores notes with tenant isolation
-- ============================================
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tenant_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Insert Test Data
-- ============================================

-- Insert test tenants
INSERT INTO tenants (id, name, subscription_plan)
VALUES
    (1, 'Test Company', 'PRO'),
    (2, 'Another Company', 'FREE');

-- Insert test users
INSERT INTO users (id, email, password, role, tenant_id)
VALUES
    (1, 'admin@test.com', 'password123', 'ADMIN', 1),
    (2, 'user@another.com', 'password123', 'MEMBER', 2);

-- Reset sequences to continue from max ID
SELECT setval('tenants_id_seq', (SELECT MAX(id) FROM tenants));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('notes_id_seq', 1, false);

-- ============================================
-- Verify Installation
-- ============================================
SELECT 'Tables created successfully!' as status;
SELECT * FROM tenants;
SELECT id, email, role, tenant_id FROM users;

