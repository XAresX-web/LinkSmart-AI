-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    description TEXT,
    location VARCHAR(255),
    custom_domain VARCHAR(255) UNIQUE,
    theme VARCHAR(50) DEFAULT 'default',
    dark_mode BOOLEAN DEFAULT false,
    show_analytics BOOLEAN DEFAULT true,
    show_branding BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de enlaces
CREATE TABLE IF NOT EXISTS links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'Globe',
    color VARCHAR(100) DEFAULT 'from-blue-500 to-purple-600',
    position INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clics en enlaces
CREATE TABLE IF NOT EXISTS link_clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id UUID REFERENCES links(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(255),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vistas de perfil
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(255),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de likes de perfil
CREATE TABLE IF NOT EXISTS profile_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, ip_address)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(position);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_user_id ON profile_views(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_likes_user_id ON profile_likes(user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
