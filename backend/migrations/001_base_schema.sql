-- Base schema migration for Szolgáltató Piactér

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'client',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service categories with hierarchy
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    parent_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced service profiles
CREATE TABLE IF NOT EXISTS service_profiles (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    user_id INTEGER,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    profile_image_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    website VARCHAR(255),
    location_city VARCHAR(100),
    location_address TEXT,
    location_postal_code VARCHAR(10),
    location_country VARCHAR(2) DEFAULT 'HU',
    service_radius_km INTEGER DEFAULT 50,
    business_type VARCHAR(50) DEFAULT 'individual',
    tax_number VARCHAR(50),
    company_registration VARCHAR(100),
    insurance_number VARCHAR(100),
    price_category VARCHAR(20) DEFAULT 'medium',
    hourly_rate_min DECIMAL(8,2),
    hourly_rate_max DECIMAL(8,2),
    min_project_value DECIMAL(10,2),
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    response_rate DECIMAL(5,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    years_experience INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    availability_note TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profile categories (many-to-many)
CREATE TABLE IF NOT EXISTS profile_categories (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER,
    category_id INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced service offerings
CREATE TABLE IF NOT EXISTS service_offerings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    profile_id INTEGER,
    category_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    base_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    price_unit VARCHAR(50) DEFAULT 'project',
    price_note TEXT,
    estimated_duration_hours INTEGER,
    min_duration_hours INTEGER,
    max_duration_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio items
CREATE TABLE IF NOT EXISTS portfolio_items (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    profile_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_urls TEXT,
    project_date DATE,
    project_value DECIMAL(10,2),
    client_name VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Working hours
CREATE TABLE IF NOT EXISTS working_hours (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER,
    day_of_week INTEGER,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    client_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_city VARCHAR(100),
    location_address TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'planning',
    priority VARCHAR(10) DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    completion_percentage INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project participants
CREATE TABLE IF NOT EXISTS project_participants (
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    provider_id INTEGER,
    role VARCHAR(100),
    status VARCHAR(20) DEFAULT 'invited',
    hourly_rate DECIMAL(8,2),
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    notes TEXT,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    sender_id INTEGER,
    receiver_id INTEGER,
    project_id INTEGER,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    reviewer_id INTEGER,
    reviewed_profile_id INTEGER,
    project_id INTEGER,
    rating INTEGER,
    title VARCHAR(255),
    content TEXT,
    pros TEXT,
    cons TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_service_profiles_user_id ON service_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_categories_profile ON profile_categories(profile_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_profile ON service_offerings(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_profile ON portfolio_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_profile ON working_hours(profile_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_reviews_profile ON reviews(reviewed_profile_id);