let ticketSalesData = [];
let currentPage = 1;
const itemsPerPage = 8;

// Format currency
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// Create monthly sales chart
function createMonthlyChart() {
  // This is a placeholder since we can't render actual charts in this environment
  const chartContainer = document.getElementById("monthly-chart");
  chartContainer.innerHTML = `
        <div style="text-align: center; padding: 50px 0;">
          <p style="font-size: 16px; color: #666;">
            [Grafik Batang: Omset Penjualan Bulanan]
          </p>
          <p style="font-size: 14px; color: #888;">
            Data Bulan: Jan - Des 2025<br>
            Range Omset: Rp 125.000.000 - Rp 450.000.000
          </p>
        </div>
      `;
}

// Filter and paginate sales data
function filterAndPaginateSales() {
  const monthFilter = document.getElementById("month-filter").value;
  const dayFilter = document.getElementById("day-filter").value;
  const statusFilter = document.getElementById("status-filter").value;

  // Apply filters
  let filteredData = [...ticketSalesData];

  if (monthFilter) {
    filteredData = filteredData.filter((sale) => {
      const saleMonth = new Date(sale.date).getMonth() + 1;
      return saleMonth === parseInt(monthFilter);
    });
  }

  if (dayFilter) {
    filteredData = filteredData.filter((sale) => {
      return sale.date === dayFilter;
    });
  }

  if (statusFilter) {
    filteredData = filteredData.filter((sale) => {
      return sale.status === statusFilter;
    });
  }

  // Calculate total sales for all filtered data
  let totalSales = 0;
  filteredData.forEach((sale) => {
    totalSales += sale.quantity * sale.price;
  });
  document.getElementById(
    "total-sales"
  ).textContent = `Total Omset Penjualan: ${formatRupiah(totalSales)}`;

  // Apply pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  updatePagination(totalPages);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Update table
  populateSalesTable(paginatedData);

  return { filteredData, totalPages };
}

// Update pagination controls
function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination");

  // Clear existing pagination except arrows
  const prevArrow = document.getElementById("prev-page");
  const nextArrow = document.getElementById("next-page");
  pagination.innerHTML = "";

  // Add prev arrow
  pagination.appendChild(prevArrow.cloneNode(true));

  // Add page numbers
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const pageItem = document.createElement("div");
    pageItem.className = `pagination-item ${currentPage === i ? "active" : ""}`;
    pageItem.textContent = i;
    pageItem.addEventListener("click", () => {
      currentPage = i;
      filterAndPaginateSales();
    });
    pagination.appendChild(pageItem);
  }

  // Add next arrow
  pagination.appendChild(nextArrow.cloneNode(true));

  // Set up arrow event listeners
  pagination.querySelector("#prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAndPaginateSales();
    }
  });

  pagination.querySelector("#next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      filterAndPaginateSales();
    }
  });
}

// Populate sales table with data
function populateSalesTable(data) {
  const tableBody = document.getElementById("sales-data");
  tableBody.innerHTML = "";

  data.forEach((sale) => {
    const total = sale.quantity * sale.price;

    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${sale.id}</td>
          <td>${sale.concert}</td>
          <td>${sale.type}</td>
          <td>${sale.quantity}</td>
          <td>${formatRupiah(sale.price)}</td>
          <td>${formatRupiah(total)}</td>
          <td class="status-${sale.status.toLowerCase()}">${
      sale.status.charAt(0).toUpperCase() + sale.status.slice(1)
    }</td>
          <td>${moment(sale.date).format("DD MMM YYYY")}</td>
        `;
    tableBody.appendChild(row);
  });
}

// Export data function
function exportData() {
  alert("Data berhasil diekspor ke CSV");
  // In a real implementation, this would generate and download a CSV file
}

// Initialize the dashboard
function initDashboard() {
  // Display current date
  const now = new Date();
  document.getElementById("current-date").textContent =
    moment(now).format("dddd, DD MMMM YYYY");

  // Create chart
  createMonthlyChart();

  // Initialize table with pagination
  filterAndPaginateSales();

  // Add event listeners
  document.getElementById("filter-btn").addEventListener("click", () => {
    currentPage = 1; // Reset to first page on filter
    filterAndPaginateSales();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    document.getElementById("month-filter").value = "";
    document.getElementById("day-filter").value = "";
    document.getElementById("status-filter").value = "";
    currentPage = 1;
    filterAndPaginateSales();
  });

  document.getElementById("export-btn").addEventListener("click", exportData);
}

// Auth related functions
function setupAuth() {
  const loginBtn = document.getElementById("login-btn");
  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      Swal.fire("Error", "Username dan password wajib diisi", "error");
      return;
    }

    try {
      const res = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login Gagal");
      }

      const data = await res.json();
      const { token, role } = data;

      //save token and role via local storage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_role", role);

      document.getElementById("login-page").style.display = "none";
      document.getElementById("dashboard").style.display = "flex";

      initDashboard();
      renderSidebarByRole(role);
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire("Login Gagal!", err.message, "error");
    }
  });
}

function renderSidebarByRole(role) {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");

  menuItems.forEach((item) => {
    const text = item.innerText.trim().toLowerCase();

    if (
      role === "kasir" &&
      !["dashboard", "data pelanggan", "logout"].includes(text)
    ) {
      item.style.display = "none";
    } else if (
      role === "teknisi" &&
      !["dashboard", "setup mikrotik", "paket wifi", "logout"].includes(text)
    ) {
      item.style.display = "none";
    } else {
      item.style.display = "flex";
    }
  });

  const displayName = role.charAt(0).toUpperCase() + role.slice(1);
  document.querySelector(".user-name").innerText = displayName;
}

// Run when the page loads
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");
  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");

      document.getElementById("dashboard").style.display = "none";
      document.getElementById("login-page").style.display = "flex";
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
      Swal.fire({
        icon: "success",
        title: "Logout berhasil",
        text: "Anda akan diarahkan ke halaman Login",
      }).then(() => {
        window.location.href = "/home";
      });
    });
  }

  if (token && role) {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";
    initDashboard();
    renderSidebarByRole(role);
  } else {
    setupAuth();
  }
});
