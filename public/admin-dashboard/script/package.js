// Global variables
let packages = [];
let filteredPackages = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  updateCurrentDate();
  loadPackages();
  setupEventListeners();
});

// Update current date
function updateCurrentDate() {
  const now = moment();
  document.getElementById("current-date").textContent =
    now.format("dddd, DD MMMM YYYY");
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  document
    .getElementById("package-form")
    .addEventListener("submit", handleAddPackage);
  document
    .getElementById("edit-package-form")
    .addEventListener("submit", handleEditPackage);

  // Buttons
  document
    .getElementById("reset-form-btn")
    .addEventListener("click", resetForm);
  document
    .getElementById("filter-btn")
    .addEventListener("click", filterPackages);
  document.getElementById("reset-btn").addEventListener("click", resetFilter);

  // Modal
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document
    .getElementById("cancel-edit-btn")
    .addEventListener("click", closeModal);

  // Search input
  document
    .getElementById("search-input")
    .addEventListener("input", filterPackages);

  // Logout
  document.getElementById("logout-btn").addEventListener("click", handleLogout);
}

// Load packages from API
async function loadPackages() {
  try {
    const response = await fetch("/api/packages");
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

  const formData = new FormData(e.target);
  const packageData = {
    name: formData.get("name"),
    speed: formData.get("speed"),
    price: parseInt(formData.get("price")),
  };

  try {
    const response = await fetch("/api/packages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });

    if (response.ok) {
      Swal.fire("Berhasil", "Paket berhasil ditambahkan", "success");
      resetForm();
      loadPackages();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to add package");
    }
  } catch (error) {
    console.error("Error adding package:", error);
    Swal.fire("Error", "Gagal menambahkan paket", "error");
  }
}

// Handle edit package
async function handleEditPackage(e) {
  e.preventDefault();

  const packageId = document.getElementById("edit-package-id").value;
  const formData = new FormData(e.target);
  const packageData = {
    name: formData.get("name"),
    speed: formData.get("speed"),
    price: parseInt(formData.get("price")),
  };

  try {
    const response = await fetch(`/api/packages/${packageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });

    if (response.ok) {
      Swal.fire("Berhasil", "Paket berhasil diupdate", "success");
      closeModal();
      loadPackages();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Failed to update package");
    }
  } catch (error) {
    console.error("Error updating package:", error);
    Swal.fire("Error", "Gagal mengupdate paket", "error");
  }
}

// Handle delete package
async function handleDeletePackage(packageId) {
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
      const response = await fetch(`/api/packages/${packageId}`, {
        method: "DELETE",
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
  document.getElementById("edit-package-id").value = pkg.ID;
  document.getElementById("edit-package-name").value = pkg.Name;
  document.getElementById("edit-package-speed").value = pkg.Speed || "";
  document.getElementById("edit-package-price").value = pkg.Price;
  document.getElementById("edit-modal").style.display = "block";
}

// Close modal
function closeModal() {
  document.getElementById("edit-modal").style.display = "none";
}

// Reset form
function resetForm() {
  document.getElementById("package-form").reset();
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
