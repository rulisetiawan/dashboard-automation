// ============================================================================
// Page: User Management (CRUD, Password Reset, Status)
// ============================================================================

function userManagementPage() {
  const totalUsers = rbacState.users.length;
  const activeUsers = rbacState.users.filter((u) => u.active).length;
  const now = Date.now();
  const lockedOrInactiveUsers = rbacState.users.filter(
    (u) => !u.active || (u.locked_until && new Date(u.locked_until).getTime() > now)
  ).length;
  const totalRoles = rbacState.roles.length;

  const roleFilterOptions = rbacState.roles
    .map((r) => `<option value="${escapeHtml(r.role_code)}" ${userMgmtState.role === r.role_code ? "selected" : ""}>Role: ${escapeHtml(r.role_name)}</option>`)
    .join("");

  return `
    <div class="user-mgmt-page">
      <header class="user-mgmt-hero-header">
        <div>
          <span class="data-pill good">System Administration</span>
          <h1 style="margin-top:6px;font-size:24px;font-weight:800;letter-spacing:-0.02em;">User Management</h1>
          <p style="color:var(--muted);margin-top:4px;font-size:13px;max-width:700px;">
            Kelola akun pengguna, hak akses role sistem, status keamanan, reset kredensial, dan aktivitas akun di seluruh ekosistem Digital Automation PT. SMM.
          </p>
        </div>
        <div>
          <button type="button" class="button primary" id="user-mgmt-open-create" style="display:flex;align-items:center;gap:6px;">
            <span>+</span> Tambah Pengguna Baru
          </button>
        </div>
      </header>

      <section class="user-mgmt-kpis">
        <div class="card kpi-card" data-tooltip="Total Pengguna: Jumlah seluruh akun yang tersimpan di sistem">
          <div class="kpi-top">
            <span class="kpi-label">Total Pengguna</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Jumlah seluruh akun yang tersimpan di sistem">ⓘ</span>
          </div>
          <strong class="kpi-value" id="user-mgmt-stat-total">${totalUsers}</strong>
          <small class="kpi-meta">Terdaftar dalam database</small>
        </div>
        <div class="card kpi-card" data-tooltip="Pengguna Aktif: Akun dengan status aktif yang diizinkan login">
          <div class="kpi-top">
            <span class="kpi-label">Pengguna Aktif</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Akun dengan status aktif yang diizinkan login">ⓘ</span>
          </div>
          <strong class="kpi-value good" id="user-mgmt-stat-active">${activeUsers}</strong>
          <small class="kpi-meta">Dapat mengakses dashboard</small>
        </div>
        <div class="card kpi-card" data-tooltip="Terkunci / Nonaktif: Akun terkunci karena percobaan login gagal berulang atau dinonaktifkan admin">
          <div class="kpi-top">
            <span class="kpi-label">Terkunci / Nonaktif</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Akun terkunci karena percobaan login gagal berulang atau dinonaktifkan admin">ⓘ</span>
          </div>
          <strong class="kpi-value ${lockedOrInactiveUsers > 0 ? "warn" : "neutral"}" id="user-mgmt-stat-locked">${lockedOrInactiveUsers}</strong>
          <small class="kpi-meta">Perlu tindakan admin</small>
        </div>
        <div class="card kpi-card" data-tooltip="Total Role: Jumlah tingkatan wewenang dan izin akses yang dikonfigurasi">
          <div class="kpi-top">
            <span class="kpi-label">Total Role</span>
            <span class="b2b-tooltip-trigger" data-tooltip="Jumlah tingkatan wewenang dan izin akses yang dikonfigurasi">ⓘ</span>
          </div>
          <strong class="kpi-value" id="user-mgmt-stat-roles">${totalRoles}</strong>
          <small class="kpi-meta"><a href="#/roles" style="color:var(--primary);text-decoration:none;">Kelola Menu Permissions →</a></small>
        </div>
      </section>

      <section class="card" style="padding:0;overflow:hidden;border:1px solid var(--border,#dce7e9);">
        <div class="user-mgmt-toolbar">
          <div class="user-mgmt-filters">
            <input
              type="search"
              id="user-mgmt-search-input"
              class="user-mgmt-search"
              placeholder="Cari nama, username, email, departemen..."
              value="${escapeHtml(userMgmtState.search)}"
              aria-label="Cari pengguna"
            />
            <select id="user-mgmt-role-filter" class="user-mgmt-select" aria-label="Filter berdasarkan role">
              <option value="all" ${userMgmtState.role === "all" ? "selected" : ""}>Semua Role</option>
              ${roleFilterOptions}
            </select>
            <select id="user-mgmt-status-filter" class="user-mgmt-select" aria-label="Filter berdasarkan status">
              <option value="all" ${userMgmtState.status === "all" ? "selected" : ""}>Semua Status</option>
              <option value="active" ${userMgmtState.status === "active" ? "selected" : ""}>Aktif</option>
              <option value="inactive" ${userMgmtState.status === "inactive" ? "selected" : ""}>Nonaktif</option>
              <option value="locked" ${userMgmtState.status === "locked" ? "selected" : ""}>Terkunci (Brute-force)</option>
            </select>
          </div>
          <div>
            <button type="button" class="button secondary compact" id="user-mgmt-refresh-btn" title="Muat ulang data pengguna">
              ↻ Refresh
            </button>
          </div>
        </div>

        <div class="table-responsive" style="overflow-x:auto;">
          <table class="data-table" style="width:100%;margin:0;border:none;">
            <thead>
              <tr>
                <th style="min-width:220px;">Pengguna <span class="b2b-tooltip-trigger" data-tooltip="Nama lengkap dan identifikasi username akun">ⓘ</span></th>
                <th style="min-width:200px;">Kontak & Departemen <span class="b2b-tooltip-trigger" data-tooltip="Alamat email resmi dan unit kerja">ⓘ</span></th>
                <th style="min-width:140px;">Role Akses <span class="b2b-tooltip-trigger" data-tooltip="Tingkat izin hak akses dan otorisasi">ⓘ</span></th>
                <th style="min-width:120px;">Status <span class="b2b-tooltip-trigger" data-tooltip="Status operasional akun (Aktif, Nonaktif, Terkunci)">ⓘ</span></th>
                <th style="min-width:160px;">Terakhir Login <span class="b2b-tooltip-trigger" data-tooltip="Waktu sesi login terakhir kali tercatat">ⓘ</span></th>
                <th style="min-width:160px;text-align:right;">Aksi <span class="b2b-tooltip-trigger" data-tooltip="Operasi edit data, reset password, dan status akun">ⓘ</span></th>
              </tr>
            </thead>
            <tbody id="user-mgmt-tbody">
              ${renderUserManagementRowsHtml()}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function openUserModal(userId = null) {
  const modal = document.getElementById("user-modal");
  const form = document.getElementById("user-modal-form");
  if (!modal || !form) return;

  const errorEl = document.getElementById("user-modal-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  const idInput = document.getElementById("user-form-id");
  const usernameInput = document.getElementById("user-form-username");
  const displayNameInput = document.getElementById("user-form-display-name");
  const emailInput = document.getElementById("user-form-email");
  const departmentInput = document.getElementById("user-form-department");
  const roleSelect = document.getElementById("user-form-role");
  const activeCheckbox = document.getElementById("user-form-active");
  const passwordInput = document.getElementById("user-form-password");
  const titleEl = document.getElementById("user-modal-title");
  const badgeEl = document.getElementById("user-modal-badge");
  const passLabel = document.getElementById("user-form-password-label");
  const passStar = document.getElementById("user-form-password-star");
  const passHint = document.getElementById("user-form-password-hint");
  const submitBtn = document.getElementById("user-modal-submit");

  // Populate roles in select (with resilient fallback if not yet fetched)
  const defaultRoles = [
    { role_code: "ADMIN", role_name: "Administrator" },
    { role_code: "ENGINEER", role_name: "Process Engineer" },
    { role_code: "SUPERVISOR", role_name: "Production Supervisor" },
    { role_code: "PRODUCTION", role_name: "Production Team" },
    { role_code: "OPERATOR", role_name: "Machine Operator" },
    { role_code: "WWTP", role_name: "WWTP Operator" },
    { role_code: "VIEWER", role_name: "General Viewer" },
  ];
  const availableRoles = (rbacState.roles && rbacState.roles.length) ? rbacState.roles : defaultRoles;
  if (roleSelect) {
    roleSelect.innerHTML = availableRoles
      .map((r) => `<option value="${escapeHtml(r.role_code)}">${escapeHtml(r.role_name)} (${escapeHtml(r.role_code)})</option>`)
      .join("");
  }

  if (userId) {
    const user = rbacState.users.find((u) => String(u.user_id) === String(userId));
    if (!user) {
      showToast("User tidak ditemukan", "Data pengguna tidak ditemukan dalam memori.");
      return;
    }
    if (idInput) idInput.value = user.user_id;
    if (titleEl) titleEl.textContent = `Edit Pengguna: ${user.display_name || user.username}`;
    if (badgeEl) badgeEl.textContent = "Edit Akun";
    if (usernameInput) {
      usernameInput.value = user.username;
      usernameInput.disabled = true;
    }
    if (displayNameInput) displayNameInput.value = user.display_name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (departmentInput) departmentInput.value = user.department || "";
    if (roleSelect) roleSelect.value = user.role_code;
    if (activeCheckbox) activeCheckbox.checked = Boolean(user.active);
    if (passwordInput) {
      passwordInput.value = "";
      passwordInput.required = false;
    }
    if (passLabel) passLabel.textContent = "Ubah Password (Opsional)";
    if (passStar) passStar.hidden = true;
    if (passHint) passHint.textContent = "Biarkan kosong jika tidak ingin mengubah password. Minimal 6 karakter jika diisi.";
    if (submitBtn) submitBtn.textContent = "Simpan Perubahan";
  } else {
    if (idInput) idInput.value = "";
    if (titleEl) titleEl.textContent = "Tambah Pengguna Baru";
    if (badgeEl) badgeEl.textContent = "User Administration";
    if (usernameInput) {
      usernameInput.value = "";
      usernameInput.disabled = false;
    }
    if (displayNameInput) displayNameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (departmentInput) departmentInput.value = "Digital Automation";
    if (roleSelect && roleSelect.options.length) roleSelect.selectedIndex = 0;
    if (activeCheckbox) activeCheckbox.checked = true;
    if (passwordInput) {
      passwordInput.value = "";
      passwordInput.required = true;
    }
    if (passLabel) passLabel.textContent = "Password";
    if (passStar) passStar.hidden = false;
    if (passHint) passHint.textContent = "Minimal 6 karakter. Disarankan kombinasi huruf, angka, dan simbol.";
    if (submitBtn) submitBtn.textContent = "Buat Pengguna";
  }

  modal.hidden = false;
  window.requestAnimationFrame(() => {
    (userId ? displayNameInput : usernameInput)?.focus();
  });
}

function closeUserModal() {
  const modal = document.getElementById("user-modal");
  if (modal) modal.hidden = true;
  const form = document.getElementById("user-modal-form");
  if (form) form.reset();
  const idInput = document.getElementById("user-form-id");
  if (idInput) idInput.value = "";
  const errorEl = document.getElementById("user-modal-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }
}

async function handleUserFormSubmit(event) {
  event.preventDefault();
  const errorEl = document.getElementById("user-modal-error");
  const reportError = (msg) => {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }
    showToast("Validasi Gagal", msg);
  };
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  const id = document.getElementById("user-form-id")?.value?.trim();
  const username = document.getElementById("user-form-username")?.value?.trim().toLowerCase();
  const displayName = document.getElementById("user-form-display-name")?.value?.trim();
  const email = document.getElementById("user-form-email")?.value?.trim() || null;
  const department = document.getElementById("user-form-department")?.value?.trim() || null;
  const roleCode = document.getElementById("user-form-role")?.value?.trim() || "VIEWER";
  const active = document.getElementById("user-form-active")?.checked !== false;
  const password = document.getElementById("user-form-password")?.value || "";

  if (!displayName) {
    reportError("Nama lengkap wajib diisi.");
    return;
  }

  const submitBtn = document.getElementById("user-modal-submit");
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (!id) {
      // Create user
      if (!username) { reportError("Username wajib diisi."); return; }
      if (username.length < 3) { reportError("Username minimal 3 karakter."); return; }
      if (!/^[a-z0-9_.-]+$/.test(username)) { reportError("Username hanya boleh berisi huruf kecil, angka, titik, strip, atau underscore."); return; }
      if (!password) { reportError("Password wajib diisi."); return; }
      if (password.length < 6) { reportError("Password minimal harus 6 karakter."); return; }

      const res = await fetch("/api/v1/rbac/users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          display_name: displayName,
          email,
          department,
          role_code: roleCode,
          active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || data.error || "Gagal membuat pengguna baru.");
        throw new Error(msg);
      }

      showToast("Pengguna Dibuat", data.message || `Pengguna ${username} berhasil dibuat.`);
      closeUserModal();
      await loadRbacUsers();
    } else {
      // Update user
      if (password && password.length < 6) {
        reportError("Password baru minimal harus 6 karakter.");
        return;
      }

      const body = {
        display_name: displayName,
        email,
        department,
        role_code: roleCode,
        active,
      };
      if (password) body.new_password = password;

      const res = await fetch(`/api/v1/rbac/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || data.error || "Gagal memperbarui pengguna.");
        throw new Error(msg);
      }

      showToast("Pengguna Diperbarui", data.message || "Data pengguna berhasil disimpan.");
      closeUserModal();
      await loadRbacUsers();

      // If updating the currently logged-in admin user
      if (authentication.user && String(authentication.user.userId) === String(id)) {
        authentication.user.displayName = displayName;
        authentication.user.department = department;
        authentication.user.role = roleCode;
        const currentRoleObj = rbacState.roles.find((r) => r.role_code === roleCode);
        if (currentRoleObj) authentication.user.allowedMenus = currentRoleObj.menus;
        applyAuthenticatedUser(authentication.user);
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan.";
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.hidden = false;
    }
    showToast("Gagal Menyimpan", errorMsg);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function deleteUserAccount(userId, username) {
  if (authentication.user && String(authentication.user.userId) === String(userId)) {
    showToast("Aksi Ditolak", "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.");
    return;
  }
  const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${username}"?\nTindakan ini permanen dan tidak dapat dibatalkan.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/v1/rbac/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || data.error || "Gagal menghapus pengguna.");
      throw new Error(msg);
    }

    showToast("Pengguna Dihapus", data.message || `Akun ${username} berhasil dihapus.`);
    await loadRbacUsers();
  } catch (err) {
    showToast("Gagal Menghapus", err instanceof Error ? err.message : "Terjadi kesalahan.");
  }
}

async function unlockUserAccount(userId, username) {
  try {
    const res = await fetch(`/api/v1/rbac/users/${encodeURIComponent(userId)}/unlock`, {
      method: "POST",
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || data.error || "Gagal membuka kunci akun.");
      throw new Error(msg);
    }

    showToast("Kunci Dibuka", data.message || `Akun ${username} berhasil dibuka kuncinya.`);
    await loadRbacUsers();
  } catch (err) {
    showToast("Gagal Membuka Kunci", err instanceof Error ? err.message : "Terjadi kesalahan.");
  }
}

function bindUserManagementPageEvents() {
  document.getElementById("user-mgmt-search-input")?.addEventListener("input", (e) => {
    userMgmtState.search = e.target.value;
    const tbody = document.getElementById("user-mgmt-tbody");
    if (tbody) tbody.innerHTML = renderUserManagementRowsHtml();
  });

  document.getElementById("user-mgmt-role-filter")?.addEventListener("change", (e) => {
    userMgmtState.role = e.target.value;
    const tbody = document.getElementById("user-mgmt-tbody");
    if (tbody) tbody.innerHTML = renderUserManagementRowsHtml();
  });

  document.getElementById("user-mgmt-status-filter")?.addEventListener("change", (e) => {
    userMgmtState.status = e.target.value;
    const tbody = document.getElementById("user-mgmt-tbody");
    if (tbody) tbody.innerHTML = renderUserManagementRowsHtml();
  });

  document.getElementById("user-mgmt-open-create")?.addEventListener("click", () => {
    openUserModal();
  });

  document.getElementById("user-mgmt-refresh-btn")?.addEventListener("click", () => {
    void loadRbacUsers();
    void loadRbacData();
  });

  document.getElementById("user-mgmt-tbody")?.addEventListener("click", (event) => {
    const editBtn = event.target.closest("[data-edit-user]");
    if (editBtn) {
      openUserModal(editBtn.dataset.editUser);
      return;
    }
    const unlockBtn = event.target.closest("[data-unlock-user]");
    if (unlockBtn) {
      void unlockUserAccount(unlockBtn.dataset.unlockUser, unlockBtn.dataset.username);
      return;
    }
    const deleteBtn = event.target.closest("[data-delete-user]");
    if (deleteBtn) {
      void deleteUserAccount(deleteBtn.dataset.deleteUser, deleteBtn.dataset.username);
      return;
    }
  });

  if (!rbacState.roles.length) void loadRbacData();
  if (!rbacState.users.length) void loadRbacUsers();
}

document.getElementById("admin-rbac-button")?.addEventListener("click", () => {
  const sessionMenu = document.getElementById("user-session-menu");
  if (sessionMenu) sessionMenu.hidden = true;
  navigate("roles");
});

document.getElementById("admin-users-button")?.addEventListener("click", () => {
  const sessionMenu = document.getElementById("user-session-menu");
  if (sessionMenu) sessionMenu.hidden = true;
  navigate("users");
});

document.getElementById("user-modal-close")?.addEventListener("click", closeUserModal);
document.getElementById("user-modal-cancel")?.addEventListener("click", closeUserModal);
document.getElementById("user-modal-form")?.addEventListener("submit", handleUserFormSubmit);
document.getElementById("user-modal")?.addEventListener("click", (event) => {
  if (event.target === document.getElementById("user-modal")) {
    closeUserModal();
  }
});

window.addEventListener("hashchange", () => {
  const page = getPageFromUrl();
  if (page && page !== state.page) {
    navigate(page, { replaceState: true });
  }
});

void initializeAuthentication();
