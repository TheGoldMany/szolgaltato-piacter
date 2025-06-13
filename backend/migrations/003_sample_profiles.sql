-- Sample service profiles for testing (minimal version)

-- Sample users
INSERT INTO users (email, password_hash, first_name, last_name, user_type) 
VALUES ('janos.kovacs@test.com', 'dummy_hash', 'János', 'Kovács', 'service_provider');

INSERT INTO users (email, password_hash, first_name, last_name, user_type) 
VALUES ('maria.nagy@test.com', 'dummy_hash', 'Mária', 'Nagy', 'service_provider');

INSERT INTO users (email, password_hash, first_name, last_name, user_type) 
VALUES ('peter.toth@test.com', 'dummy_hash', 'Péter', 'Tóth', 'service_provider');

-- Sample service profiles (only basic fields)
INSERT INTO service_profiles (user_id, business_name, description, location_city) 
VALUES (1, 'Kovács Építő Bt.', 'Családi házak építése és felújítása.', 'Budapest');

INSERT INTO service_profiles (user_id, business_name, description, location_city) 
VALUES (2, 'Nagy Webdesign', 'Modern weboldalak készítése.', 'Debrecen');

INSERT INTO service_profiles (user_id, business_name, description, location_city) 
VALUES (3, 'Tóth Kertépítő', 'Kertészeti szolgáltatások.', 'Szeged');