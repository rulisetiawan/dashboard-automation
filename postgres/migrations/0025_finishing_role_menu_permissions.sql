BEGIN;

-- Keep the Finishing Line menus available after role-based navigation was introduced.
INSERT INTO dashboard_menu (menu_code, menu_group, menu_title, sort_order, icon, description)
VALUES
  ('continuous', 'Finishing Line', 'Continuous', 6, '↝', 'Konsumsi chemical, temperature, pressure padder, speed, runtime, dan output'),
  ('inspecting', 'Finishing Line', 'Inspecting', 7, '⌕', 'Speed, runtime, output, kualitas kain, defect, dan kesiapan kamera'),
  ('finishing', 'Finishing Line', 'Finishing', 8, '◇', 'Speed, runtime, output, temperature, dan pressure proses finishing'),
  ('setting_dongnam', 'Finishing Line', 'Setting Dongnam', 9, '≍', 'Speed, output, temperature, lebar kain, dan overfeed')
ON CONFLICT (menu_code) DO UPDATE
SET menu_group = EXCLUDED.menu_group,
    menu_title = EXCLUDED.menu_title,
    sort_order = EXCLUDED.sort_order,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

UPDATE dashboard_menu
SET sort_order = CASE menu_code
  WHEN 'utilities' THEN 10
  WHEN 'chemical' THEN 11
  WHEN 'solar' THEN 12
  WHEN 'wwtp' THEN 13
  WHEN 'alarms' THEN 14
  WHEN 'trends' THEN 15
  WHEN 'health' THEN 16
  ELSE sort_order
END
WHERE menu_code IN ('utilities', 'chemical', 'solar', 'wwtp', 'alarms', 'trends', 'health');

INSERT INTO dashboard_role_menu (role_code, menu_code)
SELECT role_code, menu_code
FROM (VALUES ('ADMIN'), ('ENGINEER'), ('SUPERVISOR'), ('PRODUCTION'), ('OPERATOR')) AS roles(role_code)
CROSS JOIN (VALUES ('continuous'), ('inspecting'), ('finishing'), ('setting_dongnam')) AS menus(menu_code)
ON CONFLICT DO NOTHING;

COMMIT;
