-- Insert test tenant
INSERT INTO tenants (id, name, subscription_plan) VALUES (1, 'Test Company', 'PRO');

-- Insert test user (email: admin@test.com, password: password123)
INSERT INTO users (id, email, password, role, tenant_id) VALUES (1, 'admin@test.com', 'password123', 'ADMIN', 1);

-- Insert another tenant
INSERT INTO tenants (id, name, subscription_plan) VALUES (2, 'Another Company', 'FREE');

-- Insert another user for different tenant
INSERT INTO users (id, email, password, role, tenant_id) VALUES (2, 'user@another.com', 'password123', 'MEMBER', 2);

