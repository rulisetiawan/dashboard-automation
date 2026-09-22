BEGIN;

-- Registrasi Menu Command Center ke Dashboard Menu pada urutan teratas
INSERT INTO dashboard_menu (menu_code, menu_group, menu_title, sort_order, icon, description)
VALUES
  ('command_center', 'Command Center', 'Command Center', 0, '❖', 'Smart Manufacturing SCADA / MES Command Center multi-slide visual operations')
ON CONFLICT (menu_code) DO UPDATE
SET menu_group = EXCLUDED.menu_group,
    menu_title = EXCLUDED.menu_title,
    sort_order = EXCLUDED.sort_order,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- Berikan izin akses menu Command Center ke seluruh peran operasional & viewer
INSERT INTO dashboard_role_menu (role_code, menu_code)
SELECT r.role_code, 'command_center'
FROM (VALUES ('ADMIN'), ('ENGINEER'), ('SUPERVISOR'), ('PRODUCTION'), ('OPERATOR'), ('VIEWER')) AS r(role_code)
ON CONFLICT DO NOTHING;

COMMIT;
