// Sample data for monthly sales
const monthlySalesData = [
  { month: "Jan", sales: 125000000 },
  { month: "Feb", sales: 150000000 },
  { month: "Mar", sales: 180000000 },
  { month: "Apr", sales: 210000000 },
  { month: "May", sales: 250000000 },
  { month: "Jun", sales: 200000000 },
  { month: "Jul", sales: 300000000 },
  { month: "Aug", sales: 320000000 },
  { month: "Sep", sales: 280000000 },
  { month: "Oct", sales: 350000000 },
  { month: "Nov", sales: 400000000 },
  { month: "Dec", sales: 450000000 },
];

// Expanded sample data for ticket sales
const ticketSalesData = [
  {
    id: "USR-001",
    concert: "Konser Tahun Baru",
    type: "VIP",
    quantity: 2,
    price: 1500000,
    status: "active",
    date: "2025-01-15",
  },
  {
    id: "USR-002",
    concert: "Konser Valentine",
    type: "Regular",
    quantity: 3,
    price: 750000,
    status: "active",
    date: "2025-02-14",
  },
  {
    id: "USR-003",
    concert: "Konser Musim Semi",
    type: "VVIP",
    quantity: 1,
    price: 3000000,
    status: "pending",
    date: "2025-03-21",
  },
  {
    id: "USR-004",
    concert: "Festival Musik Indie",
    type: "Regular",
    quantity: 4,
    price: 500000,
    status: "active",
    date: "2025-04-10",
  },
  {
    id: "USR-005",
    concert: "Konser Rock Klasik",
    type: "VIP",
    quantity: 2,
    price: 1750000,
    status: "active",
    date: "2025-05-05",
  },
  {
    id: "USR-006",
    concert: "Konser Pop Summer",
    type: "VVIP",
    quantity: 1,
    price: 3500000,
    status: "active",
    date: "2025-06-20",
  },
  {
    id: "USR-007",
    concert: "Festival Jazz",
    type: "Regular",
    quantity: 5,
    price: 600000,
    status: "pending",
    date: "2025-07-15",
  },
  {
    id: "USR-008",
    concert: "Konser Nostalgia 90an",
    type: "VIP",
    quantity: 3,
    price: 1200000,
    status: "active",
    date: "2025-08-30",
  },
  {
    id: "USR-009",
    concert: "Konser Musik Klasik",
    type: "VVIP",
    quantity: 2,
    price: 2500000,
    status: "active",
    date: "2025-09-12",
  },
  {
    id: "USR-010",
    concert: "Halloween Music Fest",
    type: "Regular",
    quantity: 6,
    price: 800000,
    status: "pending",
    date: "2025-10-31",
  },
  {
    id: "USR-011",
    concert: "Jazz Night",
    type: "VIP",
    quantity: 2,
    price: 1800000,
    status: "active",
    date: "2025-11-15",
  },
  {
    id: "USR-012",
    concert: "Konser Tahun Baru",
    type: "VVIP",
    quantity: 1,
    price: 4000000,
    status: "active",
    date: "2025-12-31",
  },
  {
    id: "USR-013",
    concert: "Konser Valentine",
    type: "Regular",
    quantity: 2,
    price: 750000,
    status: "pending",
    date: "2025-02-14",
  },
  {
    id: "USR-014",
    concert: "Festival Musik Indie",
    type: "VIP",
    quantity: 3,
    price: 1500000,
    status: "active",
    date: "2025-04-10",
  },
  {
    id: "USR-015",
    concert: "Konser Pop Summer",
    type: "Regular",
    quantity: 4,
    price: 600000,
    status: "active",
    date: "2025-06-20",
  },
  {
    id: "USR-016",
    concert: "Festival Jazz",
    type: "VVIP",
    quantity: 1,
    price: 3500000,
    status: "pending",
    date: "2025-07-15",
  },
  {
    id: "USR-017",
    concert: "Konser Rock Klasik",
    type: "Regular",
    quantity: 5,
    price: 500000,
    status: "active",
    date: "2025-05-05",
  },
  {
    id: "USR-018",
    concert: "Halloween Music Fest",
    type: "VIP",
    quantity: 2,
    price: 1800000,
    status: "active",
    date: "2025-10-31",
  },
  {
    id: "USR-019",
    concert: "Jazz Night",
    type: "Regular",
    quantity: 3,
    price: 800000,
    status: "pending",
    date: "2025-11-15",
  },
  {
    id: "USR-020",
    concert: "Konser Tahun Baru",
    type: "VVIP",
    quantity: 2,
    price: 3500000,
    status: "active",
    date: "2025-12-31",
  },
];

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

// Pagination variables
let currentPage = 1;
const itemsPerPage = 8;

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
  // Login button
  document.getElementById("login-btn").addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Simple validation - in real app this would check against a database
    if (username === "admin" && password === "admin123") {
      document.getElementById("login-page").style.display = "none";
      document.getElementById("dashboard").style.display = "flex";
      initDashboard();
    } else {
      alert("Username atau password salah!");
    }
  });

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", function () {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  });
}

// Run when the page loads
window.addEventListener("DOMContentLoaded", setupAuth);
