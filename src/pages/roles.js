// ============================================================================
// Page: Role & Permission Management (RBAC Matrix)
// ============================================================================

function accessDeniedPage(targetPage) {
  const meta = pageMeta[targetPage] || [targetPage, "Restricted Modul", ""];
  const title = meta[0];
  const role = authentication.user?.role || "GUEST";
  const allowed = Array.isArray(authentication.user?.allowedMenus) ? authentication.user.allowedMenus : [];
  const firstAllowed = allowed.find((p) => p !== "roles") || "overview";

  return `
    <div class="access-denied-container">
      <div class="access-denied-card card">
        <div class="access-denied-icon-badge" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="access-denied-meta">
          <span class="data-pill bad">403 FORBIDDEN</span>
          <h2>Akses Ditolak / Dibatasi</h2>
          <p>Role akun Anda (<strong>${escapeHtml(role)}</strong>) tidak memiliki izin akses untuk membuka modul <strong>${escapeHtml(title)}</strong>.</p>
        </div>
        <div class="access-denied-details">
          <div class="access-denied-detail-item">
            <span>Role Aktif Saat Ini:</span>
            <div><span class="data-pill good">${escapeHtml(role)}</span></div>
          </div>
          <div class="access-denied-detail-item">
            <span>Menu yang Diizinkan untuk Role Anda:</span>
            <div class="allowed-chips-wrap">
              ${
                allowed.length > 0
                  ? allowed
                      .map((m) => `<span class="data-chip">${escapeHtml(pageMeta[m]?.[0] || m)}</span>`)
                      .join("")
                  : `<em style="color:var(--muted)">Tidak ada modul yang diizinkan</em>`
              }
            </div>
          </div>
        </div>
        <div class="access-denied-actions">
          <button type="button" class="button primary" onclick="navigate('${firstAllowed}')">
            ← Kembali ke Menu Utama (${escapeHtml(pageMeta[firstAllowed]?.[0] || firstAllowed)})
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ── Role & Permission Management (RBAC Dedicated Page) ── */
const rbacState = {
  roles: [],
  menus: [],
  users: [],
  selectedRole: "ADMIN",
  activeTab: "permissions",
  userSearchFilter: "",
};

async function loadRbacData() {
  try {
    const [rolesRes, menusRes] = await Promise.all([
      fetch("/api/v1/rbac/roles", { cache: "no-store", credentials: "same-origin" }),
      fetch("/api/v1/rbac/menus", { cache: "no-store", credentials: "same-origin" }),
    ]);
    if (!rolesRes.ok || !menusRes.ok) throw new Error("Gagal memuat data role dan menu.");
    const rolesJson = await rolesRes.json();
    const menusJson = await menusRes.json();
    rbacState.roles = rolesJson.roles || [];
    rbacState.menus = menusJson.menus || [];
    if (!rbacState.roles.some((r) => r.role_code === rbacState.selectedRole) && rbacState.roles[0]) {
      rbacState.selectedRole = rbacState.roles[0].role_code;
    }
    if (state.page === "roles" || state.page === "users") {
      renderPage({ preserveScroll: true });
    }
  } catch (err) {
    showToast("RBAC Error", err instanceof Error ? err.message : "Gagal memuat konfigurasi hak akses.");
  }
}

async function loadRbacUsers() {
  try {
    const usersRes = await fetch("/api/v1/rbac/users", { cache: "no-store", credentials: "same-origin" });
    if (!usersRes.ok) throw new Error("Gagal memuat data pengguna.");
    const usersJson = await usersRes.json();
    rbacState.users = usersJson.users || [];
    const tbody = document.getElementById("rbac-users-tbody");
    if (tbody) tbody.innerHTML = renderRbacUsersRowsHtml(rbacState.userSearchFilter);
    const userMgmtTbody = document.getElementById("user-mgmt-tbody");
    if (userMgmtTbody) userMgmtTbody.innerHTML = renderUserManagementRowsHtml();
    updateUserManagementStats();

    const roleFilterEl = document.getElementById("user-mgmt-role-filter");
    if (roleFilterEl && rbacState.roles.length && roleFilterEl.options.length <= 1) {
      const currentVal = userMgmtState.role || "all";
      roleFilterEl.innerHTML = `<option value="all" ${currentVal === "all" ? "selected" : ""}>Semua Role</option>` +
        rbacState.roles.map((r) => `<option value="${escapeHtml(r.role_code)}" ${currentVal === r.role_code ? "selected" : ""}>Role: ${escapeHtml(r.role_name)}</option>`).join("");
    }
  } catch (err) {
    showToast("RBAC Error", err instanceof Error ? err.message : "Gagal memuat daftar pengguna.");
  }
}

function renderRbacMenuGridHtml(assignedMenus = []) {
  const groups = { Operations: [], Resources: [], Intelligence: [] };
  rbacState.menus.forEach((m) => {
    const grp = m.menu_group || "Operations";
    if (!groups[grp]) groups[grp] = [];
    groups[grp].push(m);
  });

  let html = "";
  for (const [groupName, groupMenus] of Object.entries(groups)) {
    if (!groupMenus.length) continue;
    html += `
      <div class="rbac-group-box">
        <div class="rbac-group-title">${escapeHtml(groupName)}</div>
        ${groupMenus
          .map((m) => {
            const checked = assignedMenus.includes(m.menu_code) ? "checked" : "";
            return `
              <label class="rbac-menu-item-label">
                <input type="checkbox" data-menu-code="${escapeHtml(m.menu_code)}" ${checked} />
                <span class="rbac-menu-icon">${m.icon || "⌁"}</span>
                <div class="rbac-menu-info">
                  <span class="rbac-menu-name">${escapeHtml(m.menu_title)}</span>
                  <span class="rbac-menu-sub">${escapeHtml(m.description || m.menu_code)}</span>
                </div>
              </label>
            `;
          })
          .join("")}
      </div>
    `;
  }
  return html;
}

function renderRbacUsersRowsHtml(filterText = "") {
  const query = String(filterText || "").trim().toLowerCase();
  const filteredUsers = rbacState.users.filter((u) => {
    if (!query) return true;
    return (
      String(u.display_name || "").toLowerCase().includes(query) ||
      String(u.username || "").toLowerCase().includes(query) ||
      String(u.department || "").toLowerCase().includes(query) ||
      String(u.role_code || "").toLowerCase().includes(query)
    );
  });

  if (!filteredUsers.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--muted)">Tidak ada pengguna yang cocok.</td></tr>`;
  }

  return filteredUsers
    .map((u) => {
      const roleOptions = rbacState.roles
        .map((r) => `<option value="${r.role_code}" ${r.role_code === u.role_code ? "selected" : ""}>${escapeHtml(r.role_name)}</option>`)
        .join("");
      return `
        <tr>
          <td><strong>${escapeHtml(u.display_name || u.username)}</strong></td>
          <td><code>${escapeHtml(u.username)}</code></td>
          <td>${escapeHtml(u.department || "-")}</td>
          <td><span class="data-pill good">${escapeHtml(u.role_code)}</span></td>
          <td>
            <select class="rbac-user-role-select" data-user-select="${escapeHtml(u.user_id)}">
              ${roleOptions}
            </select>
          </td>
          <td>
            <button type="button" class="button small" data-save-user-role="${escapeHtml(u.user_id)}">Simpan</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function rolePermissionPage() {
  const currentRole = rbacState.roles.find((r) => r.role_code === rbacState.selectedRole) || rbacState.roles[0];
  const assignedMenus = currentRole ? (currentRole.menus || []) : [];
  const totalRoles = rbacState.roles.length || 0;
  const totalMenus = rbacState.menus.length || 0;
  const totalUsers = rbacState.users.length || 0;

  return `
    <div class="rbac-page">
      <section class="card rbac-hero-card">
        <div class="rbac-hero-header">
          <div class="rbac-hero-copy">
            <span class="data-pill good">Administrator Access Control</span>
            <h1>Role & Permission Management</h1>
            <p>Konfigurasi hak akses menu dashboard per role dan penugasan peran pengguna secara terpusat.</p>
          </div>
        </div>
        <div class="rbac-stats-strip">
          <div class="rbac-stat-tile">
            <small>Total Role</small>
            <strong>${totalRoles}</strong>
          </div>
          <div class="rbac-stat-tile">
            <small>Total Modul Menu</small>
            <strong>${totalMenus}</strong>
          </div>
          <div class="rbac-stat-tile">
            <small>Total Pengguna</small>
            <strong>${totalUsers}</strong>
          </div>
          <div class="rbac-stat-tile">
            <small>Role Dipilih</small>
            <strong style="color:var(--primary)">${currentRole ? currentRole.role_code : "ADMIN"}</strong>
          </div>
        </div>
      </section>

      <section class="card rbac-page-box">
        <div class="rbac-page-nav">
          <button type="button" class="rbac-tab-btn ${rbacState.activeTab === "permissions" ? "active" : ""}" data-rbac-tab="permissions">
            <span>Hak Akses Menu per Role</span>
          </button>
          <button type="button" class="rbac-tab-btn ${rbacState.activeTab === "users" ? "active" : ""}" data-rbac-tab="users">
            <span>Penugasan Role Pengguna</span>
          </button>
        </div>

        <!-- Tab 1: Permissions per Role -->
        <div class="rbac-tab-panel ${rbacState.activeTab === "permissions" ? "" : "hidden"}" id="rbac-tab-permissions">
          <div class="rbac-role-selector-bar">
            <label for="rbac-selected-role"><strong>Pilih Role:</strong></label>
            <select id="rbac-selected-role" class="select-control">
              ${rbacState.roles
                .map((r) => `<option value="${r.role_code}" ${r.role_code === rbacState.selectedRole ? "selected" : ""}>${escapeHtml(r.role_name)} (${escapeHtml(r.role_code)})</option>`)
                .join("")}
            </select>
            <span id="rbac-role-desc" class="rbac-role-desc">${currentRole?.description ? `“${escapeHtml(currentRole.description)}”` : ""}</span>
          </div>

          <div class="rbac-menu-grid" id="rbac-menu-grid">
            ${renderRbacMenuGridHtml(assignedMenus)}
          </div>

          <div class="rbac-page-footer">
            <div class="rbac-batch-actions">
              <button type="button" class="button ghost small" id="rbac-select-all">Pilih Semua</button>
              <button type="button" class="button ghost small" id="rbac-deselect-all">Hapus Semua</button>
            </div>
            <button type="button" class="button primary" id="rbac-save-permissions">Simpan Hak Akses</button>
          </div>
        </div>

        <!-- Tab 2: User Role Assignment -->
        <div class="rbac-tab-panel ${rbacState.activeTab === "users" ? "" : "hidden"}" id="rbac-tab-users">
          <div class="rbac-users-filter-bar">
            <input type="search" id="rbac-users-search" placeholder="Cari nama atau username pengguna..." value="${escapeHtml(rbacState.userSearchFilter)}" aria-label="Cari pengguna" />
            <small style="color:var(--muted)">Menampilkan pengguna terdaftar pada sistem.</small>
          </div>

          <div class="table-wrap rbac-table-wrap">
            <table class="data-table rbac-users-table">
              <thead>
                <tr>
                  <th>Nama Pengguna</th>
                  <th>Username</th>
                  <th>Departemen</th>
                  <th>Role Saat Ini</th>
                  <th>Ubah Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="rbac-users-tbody">
                ${renderRbacUsersRowsHtml(rbacState.userSearchFilter)}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `;
}

function bindRolePermissionPageEvents() {
  document.querySelectorAll("[data-rbac-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-rbac-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.rbacTab;
      rbacState.activeTab = tab;
      document.getElementById("rbac-tab-permissions")?.classList.toggle("hidden", tab !== "permissions");
      document.getElementById("rbac-tab-users")?.classList.toggle("hidden", tab !== "users");
      if (tab === "users" && !rbacState.users.length) void loadRbacUsers();
    });
  });

  document.getElementById("rbac-selected-role")?.addEventListener("change", (e) => {
    rbacState.selectedRole = e.target.value;
    const currentRole = rbacState.roles.find((r) => r.role_code === rbacState.selectedRole);
    const descEl = document.getElementById("rbac-role-desc");
    if (descEl) descEl.textContent = currentRole?.description ? `“${currentRole.description}”` : "";
    const grid = document.getElementById("rbac-menu-grid");
    if (grid) grid.innerHTML = renderRbacMenuGridHtml(currentRole ? currentRole.menus || [] : []);
  });

  document.getElementById("rbac-select-all")?.addEventListener("click", () => {
    document.querySelectorAll("#rbac-menu-grid input[type='checkbox']").forEach((cb) => (cb.checked = true));
  });

  document.getElementById("rbac-deselect-all")?.addEventListener("click", () => {
    document.querySelectorAll("#rbac-menu-grid input[type='checkbox']").forEach((cb) => (cb.checked = false));
  });

  document.getElementById("rbac-save-permissions")?.addEventListener("click", saveRbacPermissions);

  document.getElementById("rbac-users-search")?.addEventListener("input", (e) => {
    rbacState.userSearchFilter = e.target.value;
    const tbody = document.getElementById("rbac-users-tbody");
    if (tbody) tbody.innerHTML = renderRbacUsersRowsHtml(rbacState.userSearchFilter);
  });

  document.getElementById("rbac-users-tbody")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-save-user-role]");
    if (btn) {
      void saveSingleUserRole(btn.dataset.saveUserRole);
    }
  });

  if (!rbacState.roles.length) void loadRbacData();
  if (rbacState.activeTab === "users" && !rbacState.users.length) void loadRbacUsers();
}

async function saveRbacPermissions() {
  const saveBtn = document.getElementById("rbac-save-permissions");
  if (saveBtn) saveBtn.disabled = true;
  try {
    const checkboxes = document.querySelectorAll("#rbac-menu-grid input[type='checkbox']:checked");
    const selectedMenus = Array.from(checkboxes).map((cb) => cb.dataset.menuCode);
    const roleCode = rbacState.selectedRole;

    const res = await fetch(`/api/v1/rbac/roles/${encodeURIComponent(roleCode)}/menus`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menus: selectedMenus }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || "Gagal menyimpan hak akses menu.");
    }

    const r = rbacState.roles.find((item) => item.role_code === roleCode);
    if (r) r.menus = selectedMenus;

    if (authentication.user && authentication.user.role === roleCode) {
      authentication.user.allowedMenus = selectedMenus;
      applyMenuPermissions(authentication.user);
      renderPage({ preserveScroll: true });
    }

    showToast("Berhasil Disimpan", `Hak akses menu untuk role ${roleCode} berhasil diperbarui.`);
  } catch (err) {
    showToast("Gagal Menyimpan", err instanceof Error ? err.message : "Terjadi kesalahan.");
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

async function saveSingleUserRole(userId) {
  const select = document.querySelector(`select[data-user-select="${userId}"]`);
  if (!select) return;
  const newRole = select.value;
  try {
    const res = await fetch(`/api/v1/rbac/users/${encodeURIComponent(userId)}/role`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_code: newRole }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || "Gagal mengubah role pengguna.");
    }
    const json = await res.json();
    showToast("Role Diperbarui", `Role pengguna berhasil diubah ke ${json.role_name || newRole}.`);
    await loadRbacUsers();
    if (authentication.user && authentication.user.userId === userId) {
      authentication.user.role = newRole;
      const roleObj = rbacState.roles.find((r) => r.role_code === newRole);
      if (roleObj) authentication.user.allowedMenus = roleObj.menus;
      applyAuthenticatedUser(authentication.user);
      renderPage({ preserveScroll: true });
    }
  } catch (err) {
    showToast("Gagal Mengubah Role", err instanceof Error ? err.message : "Terjadi kesalahan.");
  }
}

/* ── User Management Dedicated Page ── */
const userMgmtState = {
  search: "",
  role: "all",
  status: "all",
};

function updateUserManagementStats() {
  const totalUsers = rbacState.users.length;
  const activeUsers = rbacState.users.filter((u) => u.active).length;
  const now = Date.now();
  const lockedOrInactiveUsers = rbacState.users.filter(
    (u) => !u.active || (u.locked_until && new Date(u.locked_until).getTime() > now)
  ).length;
  const totalRoles = rbacState.roles.length;

  const totalEl = document.getElementById("user-mgmt-stat-total");
  const activeEl = document.getElementById("user-mgmt-stat-active");
  const lockedEl = document.getElementById("user-mgmt-stat-locked");
  const rolesEl = document.getElementById("user-mgmt-stat-roles");

  if (totalEl) totalEl.textContent = String(totalUsers);
  if (activeEl) activeEl.textContent = String(activeUsers);
  if (lockedEl) lockedEl.textContent = String(lockedOrInactiveUsers);
  if (rolesEl) rolesEl.textContent = String(totalRoles);
}

function renderUserManagementRowsHtml() {
  const query = (userMgmtState.search || "").trim().toLowerCase();
  const roleFilter = userMgmtState.role || "all";
  const statusFilter = userMgmtState.status || "all";
  const now = Date.now();

  const filtered = rbacState.users.filter((u) => {
    const isLocked = Boolean(u.locked_until && new Date(u.locked_until).getTime() > now);
    if (roleFilter !== "all" && u.role_code !== roleFilter) return false;
    if (statusFilter === "active" && (!u.active || isLocked)) return false;
    if (statusFilter === "inactive" && u.active) return false;
    if (statusFilter === "locked" && !isLocked) return false;
    if (query) {
      const match =
        String(u.username || "").toLowerCase().includes(query) ||
        String(u.display_name || "").toLowerCase().includes(query) ||
        String(u.email || "").toLowerCase().includes(query) ||
        String(u.department || "").toLowerCase().includes(query) ||
        String(u.role_code || "").toLowerCase().includes(query) ||
        String(u.role_name || "").toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  if (!filtered.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--muted)">Tidak ada data pengguna yang sesuai dengan kriteria pencarian atau filter.</td></tr>`;
  }

  const currentUserId = authentication.user?.userId;

  return filtered
    .map((u) => {
      const isSelf = currentUserId && String(u.user_id) === String(currentUserId);
      const isLocked = Boolean(u.locked_until && new Date(u.locked_until).getTime() > now);
      const initials = (u.display_name || u.username || "U")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      let statusPill = "";
      if (isLocked) {
        statusPill = `<span class="data-pill bad" title="Akun terkunci hingga ${formatDateTime(new Date(u.locked_until).getTime(), true)}">🔒 Terkunci</span>`;
      } else if (u.active) {
        statusPill = `<span class="data-pill good">● Aktif</span>`;
      } else {
        statusPill = `<span class="data-pill warn">○ Nonaktif</span>`;
      }

      const roleBadgeClass = u.role_code === "ADMIN" ? "good" : (u.role_code === "WWTP" ? "neutral" : "primary");
      const lastLoginText = u.last_login_at ? formatDateTime(new Date(u.last_login_at).getTime(), true) : "Belum pernah";

      return `
        <tr>
          <td>
            <div class="user-avatar-cell">
              <div class="user-avatar-circle">${escapeHtml(initials)}</div>
              <div class="user-cell-names">
                <strong>${escapeHtml(u.display_name || u.username)}${isSelf ? ' <small style="color:var(--primary);font-weight:700;">(Anda)</small>' : ""}</strong>
                <code>@${escapeHtml(u.username)}</code>
              </div>
            </div>
          </td>
          <td>
            <div>${u.email ? `<a href="mailto:${escapeHtml(u.email)}" style="color:inherit;text-decoration:underline;">${escapeHtml(u.email)}</a>` : '<span style="color:var(--muted);">-</span>'}</div>
            <small style="color:var(--muted)">${escapeHtml(u.department || "-")}</small>
          </td>
          <td>
            <span class="data-pill ${roleBadgeClass}" style="font-weight:700;">${escapeHtml(u.role_name || u.role_code)}</span>
          </td>
          <td>${statusPill}</td>
          <td>
            <div style="font-size:12px;">${lastLoginText}</div>
            <small style="color:var(--muted);font-size:11px;">Dibuat: ${u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</small>
          </td>
          <td>
            <div class="user-action-buttons">
              <button type="button" class="button small secondary" data-edit-user="${escapeHtml(u.user_id)}">Edit</button>
              ${isLocked ? `<button type="button" class="button small warning" data-unlock-user="${escapeHtml(u.user_id)}" data-username="${escapeHtml(u.username)}">Buka Kunci</button>` : ""}
              ${!isSelf ? `<button type="button" class="button small danger" data-delete-user="${escapeHtml(u.user_id)}" data-username="${escapeHtml(u.username)}">Hapus</button>` : ""}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}
