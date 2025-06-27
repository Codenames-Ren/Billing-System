// Global variables
let packages = [];
let filteredPackages = [];
let currentPage = 1;
let editingPackageId = null;
const itemsPerPage = 10;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  updateCurrentDate();
  loadPackages();
  setupEventListeners();
});

// Dark Mode Toggle Function
function initDarkMode() {
  const themeToggle = document.getElementById("theme-toggle-checkbox");
  const body = document.body;

  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (themeToggle) {
      themeToggle.checked = true;
    }
  }

  // Add event listener for theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("change", function () {
      if (this.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }
}

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
    .addEventListener("submit", handleAddPackage);

  document
    .getElementById("reset-form-btn")
    .addEventListener("click", resetForm);

  document
    .getElementById("filter-btn")
    .addEventListener("click", filterPackages);
  document.getElementById("reset-btn").addEventListener("click", resetFilter);

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document
    .getElementById("cancel-edit-btn")
    .addEventListener("click", closeModal);

  document
    .getElementById("search-input")
    .addEventListener("input", filterPackages);

  document.getElementById("logout-btn").addEventListener("click", handleLogout);
}

// Load packages from API
async function loadPackages() {
  try {
    const response = await fetch("/package", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      Swal.fire("Session Expired", "Silakan login ulang.", "warning").then(
        () => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          window.location.href = "/login";
        }
      );
      return [];
    }

    if (response.ok) {
      packages = await response.json();
      filteredPackages = [...packages];
      renderPackages();
    } else {
      throw new Error("Failed to load packages");
    }
  } catch (error) {
    console.error("Error loading packages:", error);
    Swal.fire("Error", "Gagal memuat data paket", "error");
  }
}

// Handle add package
async function handleAddPackage(e) {
  e.preventDefault();

  const role = localStorage.getItem("user_role");
  const isEditing = editingPackageId !== null;

  // Validasi interaktif: hanya admin yang boleh tambah/edit
  if (role !== "admin") {
    Swal.fire(
      "Akses Ditolak",
      isEditing
        ? "Hanya admin yang boleh mengedit paket."
        : "Hanya admin yang boleh menambah paket.",
      "error"
    );
    return;
  }

  const formData = new FormData(e.target);
  const packageData = {
    name: formData.get("name"),
    speed: formData.get("speed"),
    price: parseInt(formData.get("price")),
  };

  const url = isEditing ? `/package/${editingPackageId}` : `/package`;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(packageData),
    });

    if (response.ok) {
      Swal.fire(
        "Berhasil",
        isEditing ? "Paket berhasil diperbarui" : "Paket berhasil ditambahkan",
        "success"
      );
      resetForm();
      loadPackages();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Gagal simpan data paket");
    }
  } catch (error) {
    console.error("Error saving package:", error);
    Swal.fire("Error", "Gagal menyimpan data paket", "error");
  }
}

// Handle delete package
async function handleDeletePackage(packageId) {
  const role = localStorage.getItem("user_role");

  if (role !== "admin") {
    Swal.fire(
      "Akses Ditolak",
      "Hanya admin yang bisa menghapus paket",
      "error"
    );
    return;
  }

  const result = await Swal.fire({
    title: "Konfirmasi Hapus",
    text: "Apakah Anda yakin ingin menghapus paket ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`/package/${packageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        Swal.fire("Berhasil", "Paket berhasil dihapus", "success");
        loadPackages();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      Swal.fire("Error", "Gagal menghapus paket", "error");
    }
  }
}

// Open edit modal
function openEditModal(pkg) {
  const role = localStorage.getItem("user_role");

  if (role !== "admin") {
    Swal.fire("Akses Ditolak", "Hanya admin yang bisa mengedit paket", "error");
    return;
  }

  editingPackageId = pkg.ID;
  document.getElementById("package-name").value = pkg.Name;
  document.getElementById("package-speed").value = pkg.Speed || "";
  document.getElementById("package-price").value = pkg.Price;

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
  submitBtn.innerHTML = `<i class="fas fa-plus"></i> Tambah Paket`;
  submitBtn.classList.remove("btn-warning");
  submitBtn.classList.add("btn-primary");

  // Fokuskan kembali ke input pertama (opsional)
  document.getElementById("package-name").focus();
}

// Filter packages
function filterPackages() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  filteredPackages = packages.filter(
    (pkg) =>
      pkg.Name.toLowerCase().includes(searchTerm) ||
      pkg.Speed.toLowerCase().includes(searchTerm) ||
      pkg.ID.toLowerCase().includes(searchTerm)
  );

  currentPage = 1;
  renderPackages();
}

// Reset filter
function resetFilter() {
  document.getElementById("search-input").value = "";
  filteredPackages = [...packages];
  currentPage = 1;
  renderPackages();
}

// Render packages table
function renderPackages() {
  const tbody = document.getElementById("package-table-body");
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  tbody.innerHTML = "";

  paginatedPackages.forEach((pkg) => {
    const row = document.createElement("tr");
    const billingCount = pkg.Billings ? pkg.Billings.length : 0;

    row.innerHTML = `
            <td>${pkg.ID}</td>
            <td>${pkg.Name}</td>
            <td>${pkg.Speed || "-"}</td>
            <td>Rp ${pkg.Price.toLocaleString("id-ID")}</td>
            <td>${billingCount} pelanggan</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="openEditModal(${JSON.stringify(
                pkg
              ).replace(/"/g, "&quot;")})">
                <i class="fas fa-edit"></i> Edit
              </button>
              </button>
            <button class="btn btn-sm btn-danger" onclick="handleDeletePackage('${
              pkg.ID
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
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
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
  renderPackages();
}

function renderSidebarByRole(role) {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");

  menuItems.forEach((item) => {
    const text = item.dataset.menu?.toLowerCase() || "";

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

      Swal.fire({
        title: "Berhasil!",
        text: "Logout Berhasil",
        icon: "success",
      }).then(() => {
        window.location.href = "/login";
      });
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

  initDarkMode();

  if (!token || !role) {
    window.location.href = "/login";
    return;
  }

  if (role !== "admin" && role !== "teknisi") {
    Swal.fire(
      "Akses Ditolak",
      "Anda tidak punya akses ke halaman ini",
      "error"
    ).then(() => {
      window.location.href = "/client";
    });
    return;
  }

  //Sembunyikan card form tambah paket jika bukan admin
  if (role !== "admin") {
    const addPackageCard = document.getElementById("add-package-card");
    if (addPackageCard) {
      addPackageCard.style.display = "none";
    }
  }

  updateCurrentDate();
  loadPackages();
  setupEventListeners(role);
  renderSidebarByRole(role);
});
