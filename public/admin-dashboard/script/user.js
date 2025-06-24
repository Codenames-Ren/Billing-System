// Global variables
let users = [];
let filteredUsers = [];
let currentPage = 1;
let editingPackageId = null;
const itemsPerPage = 10;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  updateCurrentDate();
  loadusers();
  setupEventListeners();
});

// Update current date
function updateCurrentDate() {
  const now = moment();
  document.getElementById("current-date").textContent =
    now.format("dddd, DD MMMM YYYY");
}

// Setup event listeners
function setupEventListeners(role) {
  // ✅ proteksi form untuk non-admin
  if (role !== "admin") {
    const submitBtn = document.querySelector(
      "#package-form button[type='submit']"
    );
    const resetBtn = document.getElementById("reset-form-btn");
    if (submitBtn) submitBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
  }

  document
    .getElementById("package-form")
    .addEventListener("submit", handleAddUser);

  document
    .getElementById("reset-form-btn")
    .addEventListener("click", resetForm);

  document.getElementById("filter-btn").addEventListener("click", filterUsers);
  document.getElementById("reset-btn").addEventListener("click", resetFilter);

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document
    .getElementById("cancel-edit-btn")
    .addEventListener("click", closeModal);

  document
    .getElementById("search-input")
    .addEventListener("input", filterUsers);

  document.getElementById("logout-btn").addEventListener("click", handleLogout);
}

// Load users from API
async function loadusers() {
  try {
    const response = await fetch("/admin/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (response.ok) {
      const result = await response.json();

      users = result.users || [];
      filteredUsers = [...users];

      renderUsers();
    } else {
      throw new Error("Failed to load users");
    }
  } catch (error) {
    console.error("Error loading users:", error);
    Swal.fire("Error", "Gagal memuat data user", "error");
  }
}

// Handle add user
async function handleAddUser(e) {
  e.preventDefault();

  const role = localStorage.getItem("user_role");
  const isEditing = editingPackageId !== null;

  // Validasi interaktif: hanya admin yang boleh tambah/edit
  if (role !== "admin") {
    Swal.fire(
      "Akses Ditolak",
      isEditing
        ? "Hanya admin yang boleh mengedit user."
        : "Hanya admin yang boleh menambah user.",
      "error"
    );
    return;
  }

  const formData = new FormData(e.target);
  const userData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    region: formData.get("region"),
    role: formData.get("role"),
  };

  // Untuk edit, jangan kirim password jika kosong
  if (isEditing && !userData.password) {
    delete userData.password;
  }

  const url = isEditing
    ? `/admin/users/${editingPackageId}`
    : `/users/register`;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire(
        "Berhasil",
        isEditing
          ? "User berhasil diperbarui"
          : `User berhasil ditambahkan dengan ID: ${result.id}`,
        "success"
      );
      resetForm();
      loadusers();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Gagal simpan data user");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    Swal.fire("Error", error.message || "Gagal menyimpan data user", "error");
  }
}

// Handle delete user
async function handleDeleteUser(userId) {
  const role = localStorage.getItem("user_role");

  if (role !== "admin") {
    Swal.fire("Akses Ditolak", "Hanya admin yang bisa menghapus user", "error");
    return;
  }

  const result = await Swal.fire({
    title: "Konfirmasi Hapus",
    text: "Apakah Anda yakin ingin menghapus user ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        Swal.fire("Berhasil", "User berhasil dihapus", "success");
        loadusers();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire("Error", "Gagal menghapus user", "error");
    }
  }
}

// Open edit modal
function openEditModal(user) {
  const role = localStorage.getItem("user_role");

  if (role !== "admin") {
    Swal.fire("Akses Ditolak", "Hanya admin yang bisa mengedit user", "error");
    return;
  }

  editingPackageId = user.ID;
  document.getElementById("package-name").value = user.Username;
  document.getElementById("package-speed").value = user.Email;
  document.getElementById("package-price").value = ""; // Kosongkan password
  document.getElementById("user-region").value = user.Region;
  document.getElementById("user-role").value = user.Role;

  const submitBtn = document.querySelector(
    "#package-form button[type='submit']"
  );
  submitBtn.innerHTML = `<i class="fas fa-save"></i> Simpan Perubahan`;
  submitBtn.classList.remove("btn-primary");
  submitBtn.classList.add("btn-warning");
}

// Close modal
function closeModal() {
  document.getElementById("edit-modal").style.display = "none";
}

// Reset form
function resetForm() {
  document.getElementById("package-form").reset();
  editingPackageId = null;

  const submitBtn = document.querySelector(
    "#package-form button[type='submit']"
  );
  submitBtn.innerHTML = `<i class="fas fa-plus"></i> Tambah User`;
  submitBtn.classList.remove("btn-warning");
  submitBtn.classList.add("btn-primary");

  // Fokuskan kembali ke input pertama (opsional)
  document.getElementById("package-name").focus();
}

// Filter users
function filterUsers() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  filteredUsers = users.filter(
    (user) =>
      user.Username.toLowerCase().includes(searchTerm) ||
      user.Email.toLowerCase().includes(searchTerm) ||
      user.ID.toLowerCase().includes(searchTerm) ||
      user.Region.toLowerCase().includes(searchTerm) ||
      user.Role.toLowerCase().includes(searchTerm)
  );

  currentPage = 1;
  renderUsers();
}

// Reset filter
function resetFilter() {
  document.getElementById("search-input").value = "";
  filteredPackages = [...packages];
  currentPage = 1;
  renderUsers();
}

// Render users table
function renderUsers() {
  const tbody = document.getElementById("package-table-body");
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = filteredUsers.slice(startIndex, endIndex);

  tbody.innerHTML = "";

  paginatedPackages.forEach((user) => {
    const row = document.createElement("tr");
    const statusBadge =
      user.Status === "active"
        ? '<span style="background: #28a745; color: white; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">Aktif</span>'
        : '<span style="background: #dc3545; color: white; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">Nonaktif</span>';

    const roleBadge =
      user.Role === "admin"
        ? '<span style="background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">Admin</span>'
        : user.Role === "teknisi"
        ? '<span style="background: #17a2b8; color: white; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">Teknisi</span>'
        : '<span style="background: #6c757d; color: white; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem;">Kasir</span>';

    row.innerHTML = `
            <td>${user.ID}</td>
            <td>${user.Username}</td>
            <td>${user.Email}</td>
            <td>${user.Region}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="openEditModal(${JSON.stringify(
                user
              ).replace(/"/g, "&quot;")})">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="handleDeleteUser('${
                user.ID
              }')">
                <i class="fas fa-trash"></i> Hapus
              </button>
            </td>
          `;
    tbody.appendChild(row);
  });

  renderPagination();
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const pagination = document.getElementById("pagination");

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="btn btn-sm" onclick="changePage(${
      currentPage - 1
    })">Previous</button>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPage ? "btn-primary" : "";
    paginationHTML += `<button class="btn btn-sm ${active}" onclick="changePage(${i})">${i}</button>`;
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="btn btn-sm" onclick="changePage(${
      currentPage + 1
    })">Next</button>`;
  }

  pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  currentPage = page;
  renderUsers();
}

function renderSidebarByRole(role) {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");

  menuItems.forEach((item) => {
    const text = item.innerText.trim().toLowerCase();

    if (
      role === "kasir" &&
      !["data pelanggan", "laporan", "logout"].includes(text)
    ) {
      item.style.display = "none";
    } else if (
      role === "teknisi" &&
      !["data pelanggan", "setup mikrotik", "paket wifi", "logout"].includes(
        text
      )
    ) {
      item.style.display = "none";
    } else {
      item.style.display = "flex";
    }
  });

  const displayName = role.charAt(0).toUpperCase() + role.slice(1);
  document.querySelector(".user-name").innerText = displayName;
}

// Handle logout
function handleLogout() {
  Swal.fire({
    title: "Konfirmasi Logout",
    text: "Apakah Anda yakin ingin logout?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Logout!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      Swal.fire("Berhasil!", "Logout Berhasil", "success");
      window.location.href = "/login";
    }
  });
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("edit-modal");
  if (event.target === modal) {
    closeModal();
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");

  if (!token || !role) {
    window.location.href = "/login";
    return;
  }

  if (role !== "admin") {
    Swal.fire(
      "Akses Ditolak",
      "Anda tidak punya akses ke halaman ini",
      "error"
    ).then(() => {
      window.location.href = "/client";
    });
    return;
  }

  //Sembunyikan card form tambah user jika bukan admin
  if (role !== "admin") {
    const addPackageCard = document.getElementById("add-package-card");
    if (addPackageCard) {
      addPackageCard.style.display = "none";
    }
  }

  updateCurrentDate();
  loadusers();
  setupEventListeners(role);
  renderSidebarByRole(role);
});
