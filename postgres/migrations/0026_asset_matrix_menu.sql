BEGIN;

-- Registrasi Menu Asset Status ke Dashboard Menu
INSERT INTO dashboard_menu (menu_code, menu_group, menu_title, sort_order, icon, description)
VALUES
  ('asset_status', 'Operations', 'Asset Status', 2, '⊞', 'Monitoring visual status matrix seluruh asset pabrik (Running, Idle, Rusak, Offline)'),
  ('asset_matrix', 'Operations', 'Asset Status', 2, '⊞', 'Monitoring visual status matrix seluruh asset pabrik (Running, Idle, Rusak, Offline)')
ON CONFLICT (menu_code) DO UPDATE
SET menu_group = EXCLUDED.menu_group,
    menu_title = EXCLUDED.menu_title,
    sort_order = EXCLUDED.sort_order,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- Sesuaikan urutan menu di bawahnya
UPDATE dashboard_menu
SET sort_order = sort_order + 1
WHERE menu_code NOT IN ('asset_status', 'asset_matrix', 'overview') AND sort_order >= 2;

-- Berikan izin akses menu ke seluruh peran operasional & viewer
INSERT INTO dashboard_role_menu (role_code, menu_code)
SELECT r.role_code, m.menu_code
FROM (VALUES ('ADMIN'), ('ENGINEER'), ('SUPERVISOR'), ('PRODUCTION'), ('OPERATOR'), ('VIEWER')) AS r(role_code)
CROSS JOIN (VALUES ('asset_status'), ('asset_matrix')) AS m(menu_code)
ON CONFLICT DO NOTHING;

COMMIT;
