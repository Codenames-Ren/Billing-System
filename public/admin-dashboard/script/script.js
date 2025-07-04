let wifiSalesData = [];
let currentPage = 1;
const itemsPerPage = 8;

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

// Format currency
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}
let chartInstance = null;

function updateChart(data) {
  //array
  const monthlySales = Array(12).fill(0);

  data.forEach((sale) => {
    const date = new Date(sale.date);
    const monthIndex = date.getMonth();
    const amount = sale.price || 0;
    monthlySales[monthIndex] += amount;
  });

  const ctx = document.getElementById("sales-bar-chart").getContext("2d");
  if (!ctx) {
    console.warn("Canvas element for chart not found");
    return;
  }

  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  if (chartInstance) {
    chartInstance.data.datasets[0].data = monthlySales;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Omset Bulanan (Rp)",
            backgroundColor: "#8bd450",
            borderColor: "#8bd450",
            hoverBackgroundColor: "#965fd4",
            hoverBorderColor: "#965fd4",
            data: monthlySales,
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#ffffff", // Warna label legend (Omset Bulanan)
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#ffffff", // Warna label bawah (Jan, Feb, dst)
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(255,255,255,0.1)", // Garis grid horisontal tipis
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#ffffff", // Warna angka kiri (Rp ...)
              callback: function (value) {
                return "Rp " + value.toLocaleString("id-ID");
              },
            },
            grid: {
              color: "rgba(255,255,255,0.1)",
            },
          },
        },
      },
    });
  }
}

// Display placeholder chart
function createMonthlyChart() {
  console.log("Canvas chart berhasil di load");
}

// Filter and paginate sales data
function filterAndPaginateSales() {
  const monthFilter = document.getElementById("month-filter").value;
  const dayFilter = document.getElementById("day-filter").value;
  const statusFilter = document.getElementById("status-filter").value;

  let filteredData = [...wifiSalesData];

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
    totalSales += sale.price || 0;
  });
  document.getElementById(
    "total-sales"
  ).textContent = `Total Omset Penjualan: ${formatRupiah(totalSales)}`;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  updatePagination(totalPages);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  pagination.appendChild(nextArrow.cloneNode(true));

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

async function fetchAllClients() {
  try {
    const res = await fetch("/admin/clients", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      Swal.fire("Session Expired", "Silakan login ulang.", "warning").then(
        () => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          window.location.href = "/login";
        }
      );
      return [];
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal mengambil data pelanggan.");
    }

    const clients = await res.json();
    const salesData = [];

    clients.forEach((client) => {
      const billing = client.billings?.[0];
      if (!billing) return;

      //push data
      salesData.push({
        id: billing.InvoiceNo || billing.invoice_no || "-",
        name: client.Name || client.name || "-",
        package:
          billing.Package && billing.Package.Name ? billing.Package.Name : "-",
        price: billing.Total || billing.total || 0,
        type: client.Type || client.type || "-",
        status: billing.Status || billing.status || "unpaid",
        date: billing.DueDate || billing.due_date || null,
      });
    });

    return salesData;
  } catch (err) {
    Swal.fire("Error", err.message || "Gagal mengambil data", "error");
    return [];
  }
}

// Populate sales table with data
function populateSalesTable(data) {
  const tableBody = document.getElementById("sales-data");
  tableBody.innerHTML = "";

  data.forEach((rowData) => {
    const total = rowData.price;

    // Tentukan format tanggal
    let dateText = "-";
    if (rowData.date) {
      const m = moment(rowData.date);
      dateText = m.isValid() ? m.format("DD MMM YYYY") : "-";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rowData.id}</td>
      <td>${rowData.name}</td>
      <td>${rowData.package}</td>
      <td>${formatRupiah(rowData.price)}</td>
      <td>${rowData.type}</td>
      <td>${formatRupiah(total)}</td>
      <td class="status-label ${
        rowData.status.toLowerCase() === "paid"
          ? "status-paid"
          : "status-unpaid"
      }">
        ${rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1)}
      </td>
      <td>${dateText}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Export data function
function exportData() {
  Swal.fire({
    title: "Berhasil!",
    text: "Data berhasil di export!",
    icon: "success",
  });
  // In a real implementation, this would generate and download a CSV file
}

async function initDashboard() {
  const now = new Date();
  document.getElementById("current-date").textContent =
    moment(now).format("dddd, DD MMMM YYYY");

  createMonthlyChart();

  wifiSalesData = await fetchAllClients();

  filterAndPaginateSales();

  updateChart(wifiSalesData);

  document.getElementById("filter-btn").addEventListener("click", () => {
    currentPage = 1;
    filterAndPaginateSales();
    updateChart(wifiSalesData);
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    document.getElementById("month-filter").value = "";
    document.getElementById("day-filter").value = "";
    document.getElementById("status-filter").value = "";
    currentPage = 1;
    filterAndPaginateSales();
    updateChart(wifiSalesData);
  });

  document.getElementById("export-btn").addEventListener("click", exportData);
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

// Run when the page loads
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");

  initDarkMode();

  if (!token || !role) {
    window.location.href = "/login";
    return;
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
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
    });
  }

  if (token && role) {
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
      dashboard.style.display = "flex";
      initDashboard();
      renderSidebarByRole(role);
    }
  }
});
