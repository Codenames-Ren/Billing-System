document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname !== "/report") return;

  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");
  const tableBody = document.getElementById("report-table-body");
  const periodFilter = document.getElementById("period-filter");
  const dateFromInput = document.getElementById("date-from");
  const dateToInput = document.getElementById("date-to");
  const filterBtn = document.getElementById("filter-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");

  initDarkMode();

  // Format currency function
  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  let currentPage = 1;
  const rowsPerPage = 10;
  let allReportData = [];

  function paginateData(data, page = 1, rows = 10) {
    const start = (page - 1) * rows;
    return data.slice(start, start + rows);
  }

  function renderPagination(totalItems, rows = 10) {
    const totalPages = Math.ceil(totalItems / rows);
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = "btn";
      btn.style.margin = "0 5px";
      if (i === currentPage) {
        btn.style.backgroundColor = "#555";
        btn.style.color = "#fff";
      }

      btn.addEventListener("click", () => {
        currentPage = i;
        renderReportTable(allReportData);
      });

      paginationContainer.appendChild(btn);
    }
  }

  function updateCurrentDate() {
    const now = moment();
    document.getElementById("current-date").textContent =
      now.format("dddd, DD MMMM YYYY");
  }

  // Set default date range based on period
  function setDefaultDateRange(period) {
    const today = moment();
    let fromDate, toDate;

    switch (period) {
      case "daily":
        fromDate = today.clone();
        toDate = today.clone();
        break;
      case "weekly":
        fromDate = today.clone().startOf("week");
        toDate = today.clone().endOf("week");
        break;
      case "monthly":
        fromDate = today.clone().startOf("month");
        toDate = today.clone().endOf("month");
        break;
      default:
        fromDate = today.clone();
        toDate = today.clone();
    }

    dateFromInput.value = fromDate.format("YYYY-MM-DD");
    dateToInput.value = toDate.format("YYYY-MM-DD");
  }

  // Fetch payment report data from API
  async function fetchReportData(period, dateFrom, dateTo) {
    try {
      const params = new URLSearchParams({
        period: period,
        date_from: dateFrom,
        date_to: dateTo,
      });

      const res = await fetch(`/reports/payments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
        throw new Error(err.error || "Gagal memuat data laporan.");
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Fetch report error:", err);
    }
  }

  // Render report table
  function renderReportTable(reportData) {
    tableBody.innerHTML = "";

    if (reportData.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;">Tidak ada data laporan tersedia</td></tr>';
      updateSummary(0, 0);
      return;
    }

    const paginated = paginateData(reportData, currentPage, rowsPerPage);

    paginated.forEach((item, index) => {
      const row = document.createElement("tr");
      const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;

      row.innerHTML = `
        <td>${rowNumber}</td>
        <td>${item.client_name || item.Client?.Name || "-"}</td>
        <td>${item.region || item.Client?.Region || "-"}</td>
        <td>${item.package_name || item.Package?.Name || "-"}</td>
        <td>${formatRupiah(item.total || 0)}</td>
        <td>${moment(item.payment_date).format("DD MMM YYYY")}</td>
      `;

      tableBody.appendChild(row);
    });

    // Update summary
    const totalTransactions = reportData.length;
    const totalRevenue = reportData.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    updateSummary(totalTransactions, totalRevenue);

    renderPagination(reportData.length, rowsPerPage);
  }

  // Update summary information
  function updateSummary(totalTransactions, totalRevenue) {
    document.getElementById("total-transactions").textContent =
      totalTransactions;
    document.getElementById("total-revenue").textContent =
      formatRupiah(totalRevenue);

    const period = periodFilter.value;
    const periodText =
      period === "daily"
        ? "Harian"
        : period === "weekly"
        ? "Mingguan"
        : "Bulanan";

    document.getElementById(
      "report-summary"
    ).textContent = `(${periodText}: ${dateFromInput.value} - ${dateToInput.value})`;
  }

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

  // Export to PDF function
  function exportToPDF() {
    Swal.fire({
      title: "Konfirmasi Export",
      text: "Apakah Anda yakin ingin mengunduh laporan dalam format PDF?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Unduh!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading
          Swal.fire({
            title: "Mengunduh...",
            text: "Sedang menyiapkan file PDF",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const params = new URLSearchParams({
            period: periodFilter.value,
            date_from: dateFromInput.value,
            date_to: dateToInput.value,
          });

          const response = await fetch(`/reports/payments/pdf?${params}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Gagal mengunduh laporan PDF");
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `laporan_pembayaran_${dateFromInput.value}_${dateToInput.value}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          Swal.fire("Berhasil!", "Laporan PDF berhasil diunduh", "success");
        } catch (error) {
          console.error("Export PDF error:", error);
          Swal.fire(
            "Error!",
            "Gagal mengunduh laporan PDF. Fitur akan segera tersedia.",
            "error"
          );
        }
      }
    });
  }

  // Render sidebar based on user role
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
    const userNameElement = document.querySelector(".user-name");
    if (userNameElement) {
      userNameElement.innerText = displayName;
    }
  }

  // Setup logout functionality
  function setupLogout() {
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
  }

  // Initialize the page
  async function initReportPage() {
    try {
      if (!token || !role) {
        if (window.location.pathname === "/laporan") {
          window.location.href = "/login";
          return;
        }
      }

      renderSidebarByRole(role);
      setupLogout();
      updateCurrentDate();

      // Set default date range
      setDefaultDateRange(periodFilter.value);

      // Setup event listeners
      periodFilter.addEventListener("change", () => {
        setDefaultDateRange(periodFilter.value);
      });

      filterBtn.addEventListener("click", async () => {
        if (!dateFromInput.value || !dateToInput.value) {
          Swal.fire("Error", "Harap pilih tanggal dari dan sampai", "error");
          return;
        }

        currentPage = 1;
        allReportData = await fetchReportData(
          periodFilter.value,
          dateFromInput.value,
          dateToInput.value
        );
        renderReportTable(allReportData);
      });

      resetBtn.addEventListener("click", () => {
        setDefaultDateRange(periodFilter.value);
        currentPage = 1;
        allReportData = [];
        renderReportTable(allReportData);
      });

      exportPdfBtn.addEventListener("click", exportToPDF);

      // Load initial data
      allReportData = await fetchReportData(
        periodFilter.value,
        dateFromInput.value,
        dateToInput.value
      );
      renderReportTable(allReportData);
    } catch (error) {
      console.error("Error initializing report page:", error);
      Swal.fire("Error", "Gagal memuat halaman laporan", "error");
    }
  }

  // Initialize the report page
  await initReportPage();
});
