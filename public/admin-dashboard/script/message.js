document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname !== "/message") return;

  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");
  const tableBody = document.getElementById("reminder-table-body");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("message-modal");
  const closeModal = document.getElementById("close-modal");
  const copyBtn = document.getElementById("copy-message");
  const whatsappBtn = document.getElementById("whatsapp-link");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

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
  const rowsPerPage = 8;
  let allClients = [];
  let currentFilter = "";

  function paginateData(data, page = 1, rows = 8) {
    const start = (page - 1) * rows;
    return data.slice(start, start + rows);
  }

  function renderPagination(totalItems, rows = 8) {
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
        renderTable(allClients, currentFilter);
      });

      paginationContainer.appendChild(btn);
    }
  }

  function updateCurrentDate() {
    const now = moment();
    document.getElementById("current-date").textContent =
      now.format("dddd, DD MMMM YYYY");
  }

  // Fetch clients with billing data from API
  async function fetchClientsWithBilling() {
    try {
      const res = await fetch("/api/clients-with-billing", {
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
        throw new Error(err.error || "Gagal memuat data pelanggan.");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Respon backend tidak sesuai format (bukan array)");
      }

      return data;
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
      return [];
    }
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

  // Generate WhatsApp message based on payment status
  function generateMessage(client, billing) {
    const clientName = client.Name || client.name || "Pelanggan";
    const total = formatRupiah(billing.Total || billing.total || 0);
    const dueDate = moment(billing.DueDate || billing.due_date).format(
      "DD MMMM YYYY"
    );
    const status = billing.Status || billing.status;

    if (status === "unpaid") {
      return `Halo Bapak/Ibu ${clientName}, kami ingin mengingatkan bahwa tagihan WiFi Anda sebesar ${total} masih belum dibayarkan. Mohon pembayaran dilakukan sebelum ${dueDate}. Terima kasih.`;
    } else if (status === "paid") {
      const paymentDate = billing.PaymentDate
        ? moment(billing.PaymentDate).format("DD MMMM YYYY")
        : moment().format("DD MMMM YYYY");
      return `Terima kasih Bapak/Ibu ${clientName}, pembayaran tagihan WiFi sebesar ${total} pada tanggal ${paymentDate} telah kami terima. Layanan Anda tetap aktif. 😊`;
    }

    return `Halo Bapak/Ibu ${clientName}, terima kasih atas kepercayaan Anda menggunakan layanan WiFi kami.`;
  }

  // Show message modal
  function showMessageModal(client, billing) {
    const clientName = client.Name || client.name || "Pelanggan";
    const whatsapp = client.Whatsapp || client.whatsapp || "-";
    const status = billing.Status || billing.status;

    document.getElementById("client-name").textContent = clientName;
    document.getElementById("client-whatsapp").textContent = whatsapp;
    document.getElementById("client-status").textContent =
      status === "paid" ? "Sudah Bayar" : "Belum Bayar";

    const message = generateMessage(client, billing);
    document.getElementById("message-text").value = message;

    // Setup WhatsApp link
    const whatsappNumber = whatsapp.replace(/\D/g, ""); // Remove non-digit characters
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    whatsappBtn.onclick = () => {
      window.open(whatsappUrl, "_blank");
    };

    modal.style.display = "block";
  }

  // Update statistics
  function updateStats(clients) {
    const total = clients.length;
    const paid = clients.filter((c) => {
      const billing = c.Billings?.[0] || c.billings?.[0];
      return (
        billing && (billing.Status === "paid" || billing.status === "paid")
      );
    }).length;
    const unpaid = total - paid;

    document.getElementById("total-clients").textContent = total;
    document.getElementById("paid-clients").textContent = paid;
    document.getElementById("unpaid-clients").textContent = unpaid;
  }

  // Render table with client data
  async function renderTable(clients, filterStatus = "") {
    tableBody.innerHTML = "";

    const searchQuery = searchInput?.value.toLowerCase() || "";

    let filtered = clients;

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter((c) => {
        const billing = c.Billings?.[0] || c.billings?.[0];
        const status = billing?.Status || billing?.status;
        return status && status.toLowerCase() === filterStatus;
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        (c.Name || c.name || "").toLowerCase().includes(searchQuery)
      );
    }

    const paginated = paginateData(filtered, currentPage, rowsPerPage);

    if (filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align:center;">Tidak ada data tersedia</td></tr>';
      return;
    }

    paginated.forEach((client, index) => {
      const billing = client.Billings?.[0] || client.billings?.[0];
      if (!billing) return;

      const globalIndex = (currentPage - 1) * rowsPerPage + index + 1;
      const status = billing.Status || billing.status;
      const statusClass = status === "paid" ? "status-paid" : "status-unpaid";
      const statusText = status === "paid" ? "Sudah Bayar" : "Belum Bayar";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${globalIndex}</td>
        <td>${client.Name || client.name || "-"}</td>
        <td>${client.Region || client.region || "-"}</td>
        <td>${client.Whatsapp || client.whatsapp || "-"}</td>
        <td class="${statusClass}">${statusText}</td>
        <td>${formatRupiah(billing.Total || billing.total || 0)}</td>
        <td>${moment(billing.DueDate || billing.due_date).format(
          "DD MMM YYYY"
        )}</td>
        <td>
          <button class="btn btn-whatsapp generate-message-btn" 
                  data-client-id="${client.ID || client.id}" 
                  data-billing-id="${billing.ID || billing.id}">
            <i class="fa-brands fa-whatsapp"></i> Generate Pesan
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners for generate message buttons
    document.querySelectorAll(".generate-message-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const clientId = btn.dataset.clientId;
        const billingId = btn.dataset.billingId;

        const client = allClients.find((c) => (c.ID || c.id) == clientId);

        if (client) {
          const billing = client.Billings?.[0] || client.billings?.[0];
          showMessageModal(client, billing);
        }
      });
    });

    renderPagination(filtered.length, rowsPerPage);
    updateStats(filtered);
  }

  // Setup filter buttons
  function setupFilters() {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach((b) => b.classList.remove("active"));

        // Add active class to clicked button
        btn.classList.add("active");

        // Get filter value
        currentFilter = btn.dataset.filter;
        currentPage = 1;

        // Re-render table
        renderTable(allClients, currentFilter);
      });
    });
  }

  // Setup search functionality
  function setupSearch() {
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderTable(allClients, currentFilter);
      });
    }
  }

  // Setup modal functionality
  function setupModal() {
    // Close modal when clicking X or outside
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Copy message to clipboard
    copyBtn.addEventListener("click", async () => {
      const messageText = document.getElementById("message-text").value;

      try {
        await navigator.clipboard.writeText(messageText);
        Swal.fire({
          title: "Berhasil!",
          text: "Pesan berhasil disalin ke clipboard",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.getElementById("message-text");
        textArea.select();
        document.execCommand("copy");

        Swal.fire({
          title: "Berhasil!",
          text: "Pesan berhasil disalin ke clipboard",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
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
        !["data pelanggan", "laporan", "pesan", "logout"].includes(text)
      ) {
        item.style.display = "none";
      } else if (
        role === "teknisi" &&
        ![
          "data pelanggan",
          "setup mikrotik",
          "paket wifi",
          "pesan",
          "logout",
        ].includes(text)
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
  async function initReminderPage() {
    try {
      if (!token || !role) {
        window.location.href = "/login";
        return;
      }

      if (role !== "admin") {
        Swal.fire(
          "Akses Ditolak",
          "Halaman ini hanya untuk admin",
          "error"
        ).then(() => {
          window.location.href = "/home";
        });
        return;
      }

      renderSidebarByRole(role);
      setupLogout();
      updateCurrentDate();
      setupFilters();
      setupSearch();
      setupModal();

      // Fetch and render client data
      allClients = await fetchClientsWithBilling();
      await renderTable(allClients);
    } catch (error) {
      console.error("Error initializing reminder page:", error);
      Swal.fire("Error", "Gagal memuat halaman", "error");
    }
  }

  // Initialize the reminder page
  await initReminderPage();
});
