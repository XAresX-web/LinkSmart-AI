-- Insertar usuario de ejemplo
INSERT INTO users (
    id,
    email,
    username,
    full_name,
    bio,
    description,
    location,
    theme,
    dark_mode,
    show_analytics
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'maria@ejemplo.com',
    'mariagonzalez',
    'María González',
    'Diseñadora UX/UI & Desarrolladora Frontend',
    '✨ Creando experiencias digitales increíbles desde 2018. Especializada en diseño de interfaces y desarrollo web moderno. ¡Conectemos y creemos algo asombroso juntos! 🚀',
    'Madrid, España',
    'gradient-purple',
    false,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insertar enlaces de ejemplo
INSERT INTO links (user_id, title, description, url, icon, color, position, active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Mi Portafolio Web', 'Descubre mis proyectos más recientes', 'https://mariagonzalez.dev', 'Globe', 'from-blue-500 to-purple-600', 1, true),
('550e8400-e29b-41d4-a716-446655440000', 'Canal de YouTube', 'Tutoriales de diseño y desarrollo', 'https://youtube.com/@mariagonzalez', 'Youtube', 'from-red-500 to-pink-500', 2, true),
('550e8400-e29b-41d4-a716-446655440000', 'Instagram Personal', 'Mi día a día y proyectos creativos', 'https://instagram.com/mariagonzalez', 'Instagram', 'from-pink-500 to-orange-500', 3, true),
('550e8400-e29b-41d4-a716-446655440000', 'Twitter Profesional', 'Pensamientos sobre tecnología y diseño', 'https://twitter.com/mariagonzalez', 'Twitter', 'from-blue-400 to-blue-600', 4, true),
('550e8400-e29b-41d4-a716-446655440000', 'Contacto Directo', '¿Tienes un proyecto en mente?', 'mailto:maria@ejemplo.com', 'Mail', 'from-green-500 to-teal-500', 5, true),
('550e8400-e29b-41d4-a716-446655440000', 'Mi Tienda Online', 'Productos digitales y cursos', 'https://tienda.mariagonzalez.dev', 'ExternalLink', 'from-purple-500 to-indigo-600', 6, true)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para analytics
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
    NOW() - (random() * interval '30 days')
FROM generate_series(1, 500);

-- Insertar clics de ejemplo
INSERT INTO link_clicks (link_id, user_id, ip_address, country, city, clicked_at)
SELECT 
    l.id,
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
    NOW() - (random() * interval '30 days')
FROM links l
CROSS JOIN generate_series(1, 100)
WHERE l.user_id = '550e8400-e29b-41d4-a716-446655440000';
