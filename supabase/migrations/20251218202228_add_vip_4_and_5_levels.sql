/*
  # Add VIP 4 and VIP 5 Levels
  
  1. Changes
    - Add VIP 4 level with configurable commission
    - Add VIP 5 level with configurable commission
    
  2. Notes
    - These levels can be configured in admin panel
    - Commission amounts are placeholders and should be set by admin
*/

INSERT INTO vip_levels (level, name, commission, description, categories) VALUES
  (4, 'VIP 4', 30.00, 'Премиум+ уровень', ARRAY['fashion', 'sports', 'home']),
  (5, 'VIP 5', 50.00, 'Максимальный уровень', ARRAY['fashion', 'sports', 'home', 'beauty', 'electronics'])
ON CONFLICT (level) DO NOTHING;