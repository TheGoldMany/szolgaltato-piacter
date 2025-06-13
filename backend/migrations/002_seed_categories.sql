-- Seed service categories - one by one

-- Main categories
INSERT INTO service_categories (name, slug, description, sort_order, is_active) 
VALUES ('Építés és Felújítás', 'epites-felujitas', 'Összes építéssel kapcsolatos szolgáltatás', 1, true);

INSERT INTO service_categories (name, slug, description, sort_order, is_active) 
VALUES ('Kert és Külső Területek', 'kert-kulso-teruletek', 'Kertépítés, karbantartás, külső munkák', 2, true);

INSERT INTO service_categories (name, slug, description, sort_order, is_active) 
VALUES ('Takarítás és Háztartás', 'takaritas-haztartas', 'Házimunka és takarítási szolgáltatások', 3, true);

INSERT INTO service_categories (name, slug, description, sort_order, is_active) 
VALUES ('IT és Technológia', 'it-technologia', 'Számítástechnika és digitális szolgáltatások', 4, true);

INSERT INTO service_categories (name, slug, description, sort_order, is_active) 
VALUES ('Üzleti Szolgáltatások', 'uzleti-szolgaltatasok', 'Könyvelés, jogi tanácsadás, marketing', 5, true);

INSERT INTO service_categories (name, slug, description, sort_order, is_active) 
VALUES ('Oktatás és Képzés', 'oktatas-kepzes', 'Magánórák, képzések, tanfolyamok', 6, true);

-- Sub-categories for Építés és Felújítás (parent_id = 1)
INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Kőművesmunka', 'komuvesmunka', 'Falazás, vakolás, alapozás', 1, 1, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Vízszerelés', 'vizszereles', 'Csővezeték, szaniter, fűtés', 1, 2, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Villanyszerelés', 'villanyszereles', 'Elektromos hálózat, világítás', 1, 3, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Burkolás', 'burkolas', 'Csempe, járólap, parketta', 1, 4, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Festés és Mázolás', 'festes-mazolas', 'Belső és külső festési munkák', 1, 5, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Tetőfedés', 'tetofedes', 'Tetőszerkezet, cserép, szigetelés', 1, 6, true);

-- Sub-categories for IT és Technológia (parent_id = 4)
INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Webfejlesztés', 'webfejlesztes', 'Weboldal és webapp készítés', 4, 1, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Mobilalkalmazás', 'mobilalkalmazas', 'iOS és Android app fejlesztés', 4, 2, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Grafikai tervezés', 'grafikai-tervezes', 'Logo, arculat, print design', 4, 3, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('SEO és Marketing', 'seo-marketing', 'Keresőoptimalizálás, online marketing', 4, 4, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('IT támogatás', 'it-tamogatas', 'Számítógép javítás, rendszerüzemeltetés', 4, 5, true);

-- Sub-categories for Kert és Külső Területek (parent_id = 2)
INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Kertépítés', 'kertepites', 'Teljes kert tervezés és kivitelezés', 2, 1, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Kertgondozás', 'kertgondozas', 'Fűnyírás, metszés, növényápolás', 2, 2, true);

INSERT INTO service_categories (name, slug, description, parent_id, sort_order, is_active) 
VALUES ('Kerítésépítés', 'keritesepites', 'Kerítések, kapuk építése', 2, 3, true);