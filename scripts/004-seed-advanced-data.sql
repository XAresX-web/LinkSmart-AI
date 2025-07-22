-- Insertar suscripción gratuita para el usuario de ejemplo
INSERT INTO subscriptions (user_id, plan_type, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'free', 'active')
ON CONFLICT DO NOTHING;

-- Insertar algunas notificaciones de ejemplo
INSERT INTO notifications (user_id, title, message, type) VALUES
('550e8400-e29b-41d4-a716-446655440000', '¡Bienvenido a EnlaceHub!', 'Tu cuenta ha sido creada exitosamente. Comienza personalizando tu perfil.', 'success'),
('550e8400-e29b-41d4-a716-446655440000', 'Nuevo clic en tu enlace', 'Tu enlace "Mi Portafolio Web" ha recibido un nuevo clic.', 'info'),
('550e8400-e29b-41d4-a716-446655440000', 'Límite de enlaces alcanzado', 'Has alcanzado el límite de 5 enlaces del plan gratuito. Considera actualizar a Pro.', 'warning');

-- Insertar integración de ejemplo
INSERT INTO integrations (user_id, service, config, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'google_analytics', '{"tracking_id": "GA-XXXXXXXXX", "enhanced_ecommerce": false}', false);
