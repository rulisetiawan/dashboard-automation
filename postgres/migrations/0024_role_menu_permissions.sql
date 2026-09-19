BEGIN;

-- 1. Tabel Role
CREATE TABLE IF NOT EXISTS dashboard_role (
  role_code VARCHAR(32) PRIMARY KEY,
  role_name VARCHAR(64) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Tabel Katalog Menu Dashboard
CREATE TABLE IF NOT EXISTS dashboard_menu (
  menu_code VARCHAR(32) PRIMARY KEY,
  menu_group VARCHAR(32) NOT NULL,
  menu_title VARCHAR(64) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(32) NOT NULL DEFAULT '⌁',
  description TEXT
);

-- 3. Tabel Relasi Izin Akses Menu per Role
CREATE TABLE IF NOT EXISTS dashboard_role_menu (
  role_code VARCHAR(32) NOT NULL REFERENCES dashboard_role(role_code) ON DELETE CASCADE,
  menu_code VARCHAR(32) NOT NULL REFERENCES dashboard_menu(menu_code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (role_code, menu_code)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_role_menu_role ON dashboard_role_menu (role_code);

-- 4. Seed Data Role Standar
INSERT INTO dashboard_role (role_code, role_name, description, is_system)
VALUES
  ('ADMIN', 'Administrator', 'Akses penuh ke seluruh menu dan pengaturan sistem', TRUE),
  ('ENGINEER', 'Process Engineer', 'Akses operasional mesin, utilitas, konsumsi kimia, dan tren historis', TRUE),
  ('SUPERVISOR', 'Production Supervisor', 'Monitoring lini produksi, efisiensi sumber daya, dan penanganan alarm', TRUE),
  ('PRODUCTION', 'Production Team', 'Akses lini produksi, utilitas, kimia, solar, alarm, dan tren (tanpa WWTP)', TRUE),
  ('OPERATOR', 'Machine Operator', 'Akses harian operasional mesin produksi dan pengisian solar', TRUE),
  ('WWTP', 'WWTP Operator', 'Akses khusus monitoring dan operasional IPAL / WWTP', TRUE),
  ('VIEWER', 'General Viewer', 'Akses ringkasan plant overview dan tren historis read-only', TRUE)
ON CONFLICT (role_code) DO UPDATE
SET role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    is_system = EXCLUDED.is_system,
    updated_at = clock_timestamp();

-- 5. Seed Data Katalog Menu
INSERT INTO dashboard_menu (menu_code, menu_group, menu_title, sort_order, icon, description)
VALUES
  ('overview', 'Operations', 'Plant Overview', 1, '⌁', 'Monitoring menyeluruh lini produksi dan utilisasi pabrik'),
  ('jetflow', 'Operations', 'Jetflow', 2, '◉', 'Mesin celup kain Jetflow 88 chamber dan monitoring batch'),
  ('calator', 'Operations', 'Calator', 3, '≈', 'Mesin pencucian Calator 18 unit'),
  ('dryer', 'Operations', 'Dryer', 4, '≋', 'Mesin pengering Dryer 6 unit'),
  ('kalender', 'Operations', 'Kalender', 5, '⊜', 'Mesin finishing Kalender 21 unit'),
  ('utilities', 'Resources', 'Utilities', 6, 'ϟ', 'Distribusi kelistrikan, air, steam, dan thermal oil'),
  ('chemical', 'Resources', 'Chemical', 7, '◇', 'Konsumsi dan transaksi dispensing bahan kimia'),
  ('solar', 'Resources', 'Solar Fueling', 8, '◒', 'Pencatatan fueling solar dan rekonsiliasi flow meter'),
  ('wwtp', 'Resources', 'WWTP (IPAL)', 9, '♒', 'Pengolahan air limbah, cooling tower, dan diagram P&ID'),
  ('alarms', 'Intelligence', 'Alarms & Events', 10, '△', 'Pusat notifikasi dan riwayat alarm aktif pabrik'),
  ('trends', 'Intelligence', 'Historical Trends', 11, '⌗', 'Analisa multi-tag dan investigasi tren historis'),
  ('health', 'Intelligence', 'Data Health', 12, '⊕', 'Kesehatan gateway PLC, status tag, dan kualitas data')
ON CONFLICT (menu_code) DO UPDATE
SET menu_group = EXCLUDED.menu_group,
    menu_title = EXCLUDED.menu_title,
    sort_order = EXCLUDED.sort_order,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- 6. Seed Default Hak Akses Menu per Role
-- ADMIN: Semua Menu (1-12)
INSERT INTO dashboard_role_menu (role_code, menu_code)
SELECT 'ADMIN', menu_code FROM dashboard_menu
ON CONFLICT DO NOTHING;

-- ENGINEER: Seluruh 12 menu teknis & operasional
INSERT INTO dashboard_role_menu (role_code, menu_code)
SELECT 'ENGINEER', menu_code FROM dashboard_menu
ON CONFLICT DO NOTHING;

-- SUPERVISOR: 11 menu (tanpa Health)
INSERT INTO dashboard_role_menu (role_code, menu_code)
VALUES
  ('SUPERVISOR', 'overview'),
  ('SUPERVISOR', 'jetflow'),
  ('SUPERVISOR', 'calator'),
  ('SUPERVISOR', 'dryer'),
  ('SUPERVISOR', 'kalender'),
  ('SUPERVISOR', 'utilities'),
  ('SUPERVISOR', 'chemical'),
  ('SUPERVISOR', 'solar'),
  ('SUPERVISOR', 'wwtp'),
  ('SUPERVISOR', 'alarms'),
  ('SUPERVISOR', 'trends')
ON CONFLICT DO NOTHING;

-- PRODUCTION: Semua menu KECUALI WWTP
INSERT INTO dashboard_role_menu (role_code, menu_code)
SELECT 'PRODUCTION', menu_code FROM dashboard_menu WHERE menu_code <> 'wwtp'
ON CONFLICT DO NOTHING;

-- OPERATOR: 6 menu operasional mesin & solar
INSERT INTO dashboard_role_menu (role_code, menu_code)
VALUES
  ('OPERATOR', 'overview'),
  ('OPERATOR', 'jetflow'),
  ('OPERATOR', 'calator'),
  ('OPERATOR', 'dryer'),
  ('OPERATOR', 'kalender'),
  ('OPERATOR', 'solar')
ON CONFLICT DO NOTHING;

-- WWTP: Khusus menu WWTP saja (sisanya tidak ada)
INSERT INTO dashboard_role_menu (role_code, menu_code)
VALUES
  ('WWTP', 'wwtp')
ON CONFLICT DO NOTHING;

-- VIEWER: 2 menu ringkasan
INSERT INTO dashboard_role_menu (role_code, menu_code)
VALUES
  ('VIEWER', 'overview'),
  ('VIEWER', 'trends')
ON CONFLICT DO NOTHING;

-- 7. Fleksibilitas Penambahan Role pada dashboard_user
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'dashboard_user' AND constraint_name = 'dashboard_user_role_code_check'
  ) THEN
    ALTER TABLE dashboard_user DROP CONSTRAINT dashboard_user_role_code_check;
  END IF;
END $$;

COMMIT;
