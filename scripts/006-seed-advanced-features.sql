-- Script 006: Datos de ejemplo para funcionalidades avanzadas
-- Ejecutar después del script 005

-- Insertar etiquetas de ejemplo para el usuario
INSERT INTO link_tags (user_id, name, color) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Trabajo', '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440000', 'Personal', '#10B981'),
('550e8400-e29b-41d4-a716-446655440000', 'Social Media', '#F59E0B'),
('550e8400-e29b-41d4-a716-446655440000', 'Proyectos', '#8B5CF6'),
('550e8400-e29b-41d4-a716-446655440000', 'Contacto', '#EF4444')
ON CONFLICT DO NOTHING;

-- Insertar plantillas públicas adicionales
INSERT INTO user_templates (user_id, name, description, config, is_public) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Desarrollador', 'Plantilla para desarrolladores y programadores', '{"theme": "tech", "colors": ["#1F2937", "#3B82F6"], "layout": "grid"}', true),
('550e8400-e29b-41d4-a716-446655440000', 'Fotógrafo', 'Diseño elegante para fotógrafos', '{"theme": "photography", "colors": ["#000000", "#FFFFFF"], "layout": "masonry"}', true),
('550e8400-e29b-41d4-a716-446655440000', 'Músico', 'Plantilla vibrante para artistas musicales', '{"theme": "music", "colors": ["#7C3AED", "#EC4899"], "layout": "wave"}', true),
('550e8400-e29b-41d4-a716-446655440000', 'Chef', 'Diseño cálido para chefs y restaurantes', '{"theme": "food", "colors": ["#F59E0B", "#EF4444"], "layout": "cards"}', true),
('550e8400-e29b-41d4-a716-446655440000', 'Fitness', 'Plantilla energética para entrenadores', '{"theme": "fitness", "colors": ["#10B981", "#059669"], "layout": "dynamic"}', true)
ON CONFLICT DO NOTHING;

-- Insertar configuración SEO para el usuario de ejemplo
INSERT INTO seo_settings (
    user_id, 
    meta_title, 
    meta_description, 
    meta_keywords,
    og_title,
    og_description,
    twitter_title,
    twitter_description
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'María González - Diseñadora UX/UI & Desarrolladora Frontend',
    'Descubre el portafolio y enlaces de María González, especialista en diseño UX/UI y desarrollo frontend. Conecta conmigo para proyectos increíbles.',
    'diseño ux, ui design, desarrollo frontend, portafolio, maría gonzález, diseñadora web',
    'María González - Diseño y Desarrollo Web',
    'Creando experiencias digitales increíbles desde 2018. Especializada en interfaces y desarrollo web moderno.',
    'María González - UX/UI Designer',
    'Conecta conmigo para crear experiencias digitales asombrosas'
) ON CONFLICT (user_id) DO UPDATE SET
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    meta_keywords = EXCLUDED.meta_keywords,
    og_title = EXCLUDED.og_title,
    og_description = EXCLUDED.og_description,
    twitter_title = EXCLUDED.twitter_title,
    twitter_description = EXCLUDED.twitter_description,
    updated_at = NOW();

-- Actualizar contadores existentes basados en datos actuales
UPDATE users SET 
    view_count = (
        SELECT COUNT(*) FROM profile_views 
        WHERE profile_views.user_id = users.id
    ),
    like_count = (
        SELECT COUNT(*) FROM profile_likes 
        WHERE profile_likes.user_id = users.id
    )
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

UPDATE links SET 
    click_count = (
        SELECT COUNT(*) FROM link_clicks 
        WHERE link_clicks.link_id = links.id
    )
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insertar algunas vistas adicionales para analytics más realistas
INSERT INTO profile_views (user_id, ip_address, country, city, viewed_at) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    ('192.168.1.' || (random() * 255)::int)::inet,
    CASE (random() * 5)::int
        WHEN 0 THEN 'ES'
        WHEN 1 THEN 'US'
        WHEN 2 THEN 'MX'
        WHEN 3 THEN 'AR'
        ELSE 'CO'
    END,
    CASE (random() * 5)::int
        WHEN 0 THEN 'Madrid'
        WHEN 1 THEN 'New York'
        WHEN 2 THEN 'Mexico City'
        WHEN 3 THEN 'Buenos Aires'
        ELSE 'Bogotá'
    END,
    NOW() - (random() * interval '7 days')
FROM generate_series(1, 50);

-- Insertar datos de analytics más recientes (últimas 24 horas)
INSERT INTO profile_views (user_id, ip_address, country, city, viewed_at) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    ('10.0.0.' || (random() * 255)::int)::inet,
    'ES',
    'Madrid',
    NOW() - (random() * interval '24 hours')
FROM generate_series(1, 15);

-- Actualizar contadores después de insertar nuevos datos
UPDATE users SET 
    view_count = (
        SELECT COUNT(*) FROM profile_views 
        WHERE profile_views.user_id = users.id
    )
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
