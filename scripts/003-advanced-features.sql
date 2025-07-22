-- Tabla de suscripciones y pagos
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan_type VARCHAR(50) NOT NULL DEFAULT 'free', -- free, pro, business
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de colaboradores
CREATE TABLE IF NOT EXISTS collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    collaborator_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'editor', -- viewer, editor, admin
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de plantillas
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    preview_image TEXT,
    config JSONB,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de códigos QR
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    link_id UUID REFERENCES links(id) ON DELETE CASCADE,
    qr_data TEXT NOT NULL,
    style JSONB,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de programación de enlaces
CREATE TABLE IF NOT EXISTS scheduled_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id UUID REFERENCES links(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de A/B testing
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    variant_a JSONB,
    variant_b JSONB,
    traffic_split INTEGER DEFAULT 50,
    status VARCHAR(50) DEFAULT 'draft', -- draft, running, completed, paused
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resultados de A/B testing
CREATE TABLE IF NOT EXISTS ab_test_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant VARCHAR(10), -- 'a' or 'b'
    visitor_id VARCHAR(255),
    action VARCHAR(50), -- 'view', 'click', 'conversion'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de integraciones
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service VARCHAR(100) NOT NULL, -- google_analytics, facebook_pixel, mailchimp, etc.
    config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- ['link_click', 'profile_view', 'new_follower']
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50), -- info, success, warning, error
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de backups
CREATE TABLE IF NOT EXISTS backups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    backup_data JSONB,
    backup_type VARCHAR(50) DEFAULT 'manual', -- manual, automatic
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de dominios personalizados
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, verified, failed
    dns_records JSONB,
    ssl_status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar plantillas predefinidas
INSERT INTO templates (name, description, category, config, is_premium) VALUES
('Minimalista', 'Diseño limpio y elegante', 'Profesional', '{"theme": "minimal", "colors": ["#000000", "#ffffff"]}', false),
('Creativo', 'Colores vibrantes y diseño moderno', 'Artístico', '{"theme": "creative", "colors": ["#ff6b6b", "#4ecdc4"]}', false),
('Empresarial', 'Profesional para negocios', 'Negocios', '{"theme": "corporate", "colors": ["#2c3e50", "#3498db"]}', false),
('Influencer', 'Perfecto para redes sociales', 'Social Media', '{"theme": "influencer", "colors": ["#e91e63", "#9c27b0"]}', true),
('Tech Startup', 'Moderno y tecnológico', 'Tecnología', '{"theme": "tech", "colors": ["#00bcd4", "#607d8b"]}', true),
('Artista', 'Expresivo y colorido', 'Arte', '{"theme": "artist", "colors": ["#ff9800", "#795548"]}', true);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);

-- Triggers para updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
