-- ========================================
-- Multi-Tenant Notes App - Test Data
-- ========================================
-- This file creates the 2-tenant test environment
-- for assignment demonstration and testing.
-- ========================================

-- Insert Tenant 1: Test Company (PRO plan - unlimited notes)
INSERT INTO tenants (id, name, subscription_plan)
VALUES (1, 'Test Company', 'PRO')
ON CONFLICT (id) DO NOTHING;

-- Insert Tenant 2: Another Company (FREE plan - max 3 notes)
INSERT INTO tenants (id, name, subscription_plan)
VALUES (2, 'Another Company', 'FREE')
ON CONFLICT (id) DO NOTHING;

-- Insert admin user for Tenant 1
-- Email: admin@test.com | Password: password123 | Role: ADMIN
INSERT INTO users (id, email, password, role, tenant_id)
VALUES (1, 'admin@test.com', 'password123', 'ADMIN', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert member user for Tenant 2
-- Email: user@another.com | Password: password123 | Role: MEMBER
INSERT INTO users (id, email, password, role, tenant_id)
VALUES (2, 'user@another.com', 'password123', 'MEMBER', 2)
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to ensure auto-generated IDs start after existing records
SELECT setval('tenants_id_seq', (SELECT MAX(id) FROM tenants));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

