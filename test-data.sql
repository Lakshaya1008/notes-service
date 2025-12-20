-- Make sure you're connected to notesapp_db database first!

-- Insert test tenants
INSERT INTO tenants (id, name, subscription_plan)
VALUES (1, 'Test Company', 'PRO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (id, name, subscription_plan)
VALUES (2, 'Another Company', 'FREE')
ON CONFLICT (id) DO NOTHING;

-- Insert test users
INSERT INTO users (id, email, password, role, tenant_id)
VALUES (1, 'admin@test.com', 'password123', 'ADMIN', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password, role, tenant_id)
VALUES (2, 'user@another.com', 'password123', 'MEMBER', 2)
ON CONFLICT (id) DO NOTHING;

