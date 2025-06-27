document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname !== "/client") return;

  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");
  const tableBody = document.getElementById("client-table-body");
  const filterSelect = document.getElementById("status-filter");
  const filterBtn = document.getElementById("filter-btn");
  const resetBtn = document.getElementById("reset-btn");

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

  function paginateData(data, page = 1, rows = 8) {
    const start = (page - 1) * rows;
    return data.slice(start, start + rows);
  }

  function renderPagination(totalitems, rows = 8) {
    const totalPages = Math.ceil(totalitems / rows);
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
        renderTable(allClients, filterSelect.value);
      });

      paginationContainer.appendChild(btn);
    }
  }

  function updateCurrentDate() {
    const now = moment();
    document.getElementById("current-date").textContent =
      now.format("dddd, DD MMMM YYYY");
  }

  // Fetch clients data from API
  async function fetchClients() {
    try {
      const res = await fetch("/clients", {
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

  // Render table with client data
  async function renderTable(clients, filterStatus = "") {
    tableBody.innerHTML = "";

    const searchQuery =
      document.getElementById("search-input")?.value.toLowerCase() || "";

    let filtered = clients;

    if (filterStatus) {
      filtered = filtered.filter((c) => {
        const status = c?.Billings?.[0]?.Status || c?.billings?.[0]?.Status;
        return status && status.toLowerCase() === filterStatus;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((c) =>
        (c.Name || c.name || "").toLowerCase().includes(searchQuery)
      );
    }

    const paginated = paginateData(filtered, currentPage, rowsPerPage);

    if (filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="9" style="text-align:center;">Tidak ada data tersedia</td></tr>';
      return;
    }

    paginated.forEach((client) => {
      const billing = client.Billings?.[0] || client.billings?.[0];
      if (!billing) return;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${client.Name || client.name || "-"}</td>
        <td>${client.Address || client.address || "-"}</td>
        <td>${client.Region || client.region || "-"}</td>
        <td>${client.Whatsapp || client.whatsapp || "-"}</td>
        <td>${
          billing.Package && billing.Package.Name ? billing.Package.Name : "-"
        }</td>
        <td>
          <select data-id="${client.ID || client.id}" class="type-select">
            <option value="prepaid" ${
              (client.Type || client.type) === "prepaid" ? "selected" : ""
            }>Prepaid</option>
            <option value="postpaid" ${
              (client.Type || client.type) === "postpaid" ? "selected" : ""
            }>Postpaid</option>
          </select>
        </td>
        <td>${formatRupiah(billing.Total || billing.total || 0)}</td>
        <td>
          <select data-id="${billing.ID || billing.id}" class="status-select">
            <option value="unpaid" ${
              (billing.Status || billing.status) === "unpaid" ? "selected" : ""
            }>Unpaid</option>
            <option value="paid" ${
              (billing.Status || billing.status) === "paid" ? "selected" : ""
            }>Paid</option>
          </select>
        </td>
        <td>${moment(billing.DueDate || billing.due_date).format(
          "DD MMM YYYY"
        )}</td>
        <td>
          <button class="btn update-btn" data-client="${
            client.ID || client.id
          }" data-bill="${billing.ID || billing.id}">Update</button>
        </td>
      `;

      tableBody.appendChild(row);
      const statusSelect = row.querySelector(".status-select");
      const updateSelector = (select) => {
        const val = select.value;
        select.style.color = val === "paid" ? "green" : "red";
      };

      updateSelector(statusSelect);

      statusSelect.addEventListener("change", () => {
        updateSelectColor(statusSelect);
      });
    });

    // Add event listeners for update buttons
    document.querySelectorAll(".update-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const clientId = btn.dataset.client;
        const billingId = btn.dataset.bill;

        const type = document.querySelector(
          `select.type-select[data-id="${clientId}"]`
        ).value;

        const status = document.querySelector(
          `select.status-select[data-id="${billingId}"]`
        ).value;

        try {
          // Update client type
          const clientResponse = await fetch(`/clients/${clientId}/type`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type }),
          });

          if (!clientResponse.ok) {
            throw new Error("Gagal update tipe client");
          }

          // Update billing status
          const billingResponse = await fetch(`/billing/${billingId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          });

          if (!billingResponse.ok) {
            throw new Error("Gagal update status billing");
          }

          Swal.fire("Sukses", "Data berhasil diupdate", "success");
          const updatedClients = await fetchClients();
          renderTable(updatedClients, filterSelect.value);
        } catch (err) {
          console.error("Update error", err);
          Swal.fire("Error", err.message || "Gagal update data", "error");
        }
      });
    });
    renderPagination(filtered.length, rowsPerPage);
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
            // Hapus token & redirect hanya jika user mengonfirmasi
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
  async function initClientPage() {
    try {
      if (!token || !role) {
        if (window.location.pathname === "/client") {
          window.location.href = "/login";
          return;
        }
      }

      renderSidebarByRole(role);
      setupLogout();
      updateCurrentDate();

      // Fetch and render client data
      allClients = await fetchClients();
      await renderTable(allClients);

      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          currentPage = 1;
          renderTable(allClients, filterSelect.value);
        });
      }

      // Setup filter functionality
      if (filterBtn) {
        filterBtn.addEventListener("click", () => {
          const selected = filterSelect.value;
          renderTable(allClients, selected);
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          filterSelect.value = "";
          renderTable(allClients);
        });
      }
    } catch (error) {
      console.error("Error initializing client page:", error);
      Swal.fire("Error", "Gagal memuat halaman", "error");
    }
  }

  // Initialize the client page
  await initClientPage();
});
