-- Script 005: Funcionalidades Avanzadas MVP
-- Ejecutar después de los scripts 001-004

-- Tabla de etiquetas para enlaces
CREATE TABLE IF NOT EXISTS link_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación enlaces-etiquetas
CREATE TABLE IF NOT EXISTS link_tag_relations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id UUID REFERENCES links(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES link_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(link_id, tag_id)
);

-- Tabla de plantillas personalizadas
CREATE TABLE IF NOT EXISTS user_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de favoritos entre usuarios
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    favorite_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, favorite_user_id)
);

-- Tabla de configuraciones SEO
CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    twitter_title VARCHAR(255),
    twitter_description TEXT,
    twitter_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar nuevas columnas a la tabla links
ALTER TABLE links ADD COLUMN IF NOT EXISTS password_protected BOOLEAN DEFAULT false;
ALTER TABLE links ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE links ADD COLUMN IF NOT EXISTS click_limit INTEGER;
ALTER TABLE links ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255);
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255);
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255);
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);
ALTER TABLE links ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);

-- Agregar contador de clics a links
ALTER TABLE links ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Agregar contador de vistas a users
ALTER TABLE users ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Función para actualizar contadores de clics
CREATE OR REPLACE FUNCTION update_link_click_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE links 
    SET click_count = click_count + 1 
    WHERE id = NEW.link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contadores de vistas
CREATE OR REPLACE FUNCTION update_user_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET view_count = view_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contadores de likes
CREATE OR REPLACE FUNCTION update_user_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users 
        SET like_count = like_count + 1 
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users 
        SET like_count = like_count - 1 
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para contadores automáticos
DROP TRIGGER IF EXISTS trigger_update_link_clicks ON link_clicks;
CREATE TRIGGER trigger_update_link_clicks
    AFTER INSERT ON link_clicks
    FOR EACH ROW EXECUTE FUNCTION update_link_click_count();

DROP TRIGGER IF EXISTS trigger_update_user_views ON profile_views;
CREATE TRIGGER trigger_update_user_views
    AFTER INSERT ON profile_views
    FOR EACH ROW EXECUTE FUNCTION update_user_view_count();

DROP TRIGGER IF EXISTS trigger_update_user_likes ON profile_likes;
CREATE TRIGGER trigger_update_user_likes
    AFTER INSERT OR DELETE ON profile_likes
    FOR EACH ROW EXECUTE FUNCTION update_user_like_count();

-- Trigger para updated_at en seo_settings
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_link_tags_user_id ON link_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_link_tag_relations_link_id ON link_tag_relations(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tag_relations_tag_id ON link_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_public ON user_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_settings_user_id ON seo_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_links_password_protected ON links(password_protected);
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links(expires_at);

-- Función para limpiar datos antiguos (optimización)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Eliminar vistas de perfil más antiguas de 90 días
    DELETE FROM profile_views 
    WHERE viewed_at < NOW() - INTERVAL '90 days';
    
    -- Eliminar clics de enlaces más antiguos de 90 días
    DELETE FROM link_clicks 
    WHERE clicked_at < NOW() - INTERVAL '90 days';
    
    -- Eliminar notificaciones leídas más antiguas de 30 días
    DELETE FROM notifications 
    WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
