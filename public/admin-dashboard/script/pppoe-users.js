document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname !== "/setup") return;

  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");
  const tableBody = document.getElementById("user-table-body");
  const nasFilter = document.getElementById("nas-filter");
  const statusFilter = document.getElementById("status-filter");
  const profileFilter = document.getElementById("profile-filter");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const addUserBtn = document.getElementById("add-user-btn");
  const selectAllCheckbox = document.getElementById("select-all");
  initDarkMode();

  let currentPage = 1;
  const rowsPerPage = 10;
  let allUsers = [];

  // Sample users data - replace with actual API call
  const sampleUsers = [
    {
      id: 1,
      type: "pppoe",
      username: "user001",
      password: "pass123",
      profile: "Paket Upto10M Rp 150 rb",
      nas: "davit.net",
      status: "active",
      internet: "online",
    },
    {
      id: 2,
      type: "pppoe",
      username: "user002",
      password: "pass456",
      profile: "Paket Upto15M Rp 175 rb",
      nas: "davit.net",
      status: "active",
      internet: "online",
    },
    {
      id: 3,
      type: "pppoe",
      username: "user003",
      password: "pass789",
      profile: "Paket Upto10M Rp 125 rb",
      nas: "davit.net",
      status: "suspend",
      internet: "offline",
    },
  ];

  function paginateData(data, page = 1, rows = 10) {
    const start = (page - 1) * rows;
    return data.slice(start, start + rows);
  }

  function renderPagination(totalItems, rows = 10) {
    const totalPages = Math.ceil(totalItems / rows);
    const paginationContainer = document.getElementById("pagination");

    if (!paginationContainer) {
      // Create pagination container if it doesn't exist
      const container = document.createElement("div");
      container.id = "pagination";
      container.className = "pagination-container";
      container.style.cssText =
        "display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 5px;";
      document.querySelector(".table-container").appendChild(container);
    }

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = "btn btn-secondary";
      btn.style.margin = "0 2px";
      btn.style.minWidth = "40px";

      if (i === currentPage) {
        btn.style.backgroundColor = "#007bff";
        btn.style.color = "#fff";
        btn.style.borderColor = "#007bff";
      }

      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable(allUsers);
      });

      pagination.appendChild(btn);
    }
  }

  // Fetch users data from API
  async function fetchUsers() {
    try {
      // Replace this with actual API call
      // const res = await fetch("/api/pppoe-users", {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // if (res.status === 401 || res.status === 403) {
      //   Swal.fire("Session Expired", "Silakan login ulang.", "warning").then(
      //     () => {
      //       localStorage.removeItem("auth_token");
      //       localStorage.removeItem("user_role");
      //       window.location.href = "/login";
      //     }
      //   );
      //   return [];
      // }

      // if (!res.ok) {
      //   const err = await res.json();
      //   throw new Error(err.error || "Gagal memuat data users.");
      // }

      // const data = await res.json();

      // For now, return sample data
      return sampleUsers;
    } catch (err) {
      Swal.fire("Gagal", err.message || "Gagal memuat data users", "error");
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

  // Update statistics
  function updateStats(users) {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const suspendUsers = users.filter((u) => u.status === "suspend").length;
    const terminateUsers = users.filter((u) => u.status === "terminate").length;
    const onlineUsers = users.filter((u) => u.internet === "online").length;

    document.getElementById("total-users").textContent = totalUsers;
    document.getElementById("active-users").textContent = activeUsers;
    document.getElementById("suspend-users").textContent = suspendUsers;
    document.getElementById("terminate-users").textContent = terminateUsers;
    document.getElementById("online-users").textContent = onlineUsers;
  }

  // Render table with user data
  async function renderTable(users) {
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const searchQuery = searchInput?.value.toLowerCase() || "";
    const nasFilterValue = nasFilter?.value || "";
    const statusFilterValue = statusFilter?.value || "";
    const profileFilterValue = profileFilter?.value || "";

    let filtered = users;

    // Apply filters
    if (nasFilterValue && nasFilterValue !== "all") {
      filtered = filtered.filter((u) => u.nas === nasFilterValue);
    }

    if (statusFilterValue) {
      filtered = filtered.filter((u) => u.status === statusFilterValue);
    }

    if (profileFilterValue) {
      filtered = filtered.filter((u) => u.profile === profileFilterValue);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery) ||
          u.profile.toLowerCase().includes(searchQuery) ||
          u.nas.toLowerCase().includes(searchQuery)
      );
    }

    const paginated = paginateData(filtered, currentPage, rowsPerPage);

    if (filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="9" style="text-align:center;">Tidak ada data tersedia</td></tr>';
      renderPagination(0);
      return;
    }

    paginated.forEach((user, index) => {
      const row = document.createElement("tr");
      const globalIndex = (currentPage - 1) * rowsPerPage + index + 1;

      // Get status class for styling
      const statusClass =
        user.status === "active"
          ? "status-active"
          : user.status === "suspend"
          ? "status-suspend"
          : "status-terminate";

      const internetClass =
        user.internet === "online" ? "internet-online" : "internet-offline";

      row.innerHTML = `
        <td class="checkbox-col">
          <input type="checkbox" class="user-checkbox" data-id="${user.id}" />
        </td>
        <td>${globalIndex}</td>
        <td>${user.type.toUpperCase()}</td>
        <td>${user.username}</td>
        <td>
          <div class="password-field">
            <span class="password-text" style="display: none;">${
              user.password
            }</span>
            <span class="password-masked">••••••••</span>
            <button class="btn-show-password" type="button">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </td>
        <td>${user.profile}</td>
        <td>${user.nas}</td>
        <td>
          <span class="status-badge ${statusClass}">${user.status}</span>
        </td>
        <td>
          <span class="internet-badge ${internetClass}">${user.internet}</span>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners for password toggle
    document.querySelectorAll(".btn-show-password").forEach((btn) => {
      btn.addEventListener("click", function () {
        const passwordField = this.closest(".password-field");
        const passwordText = passwordField.querySelector(".password-text");
        const passwordMasked = passwordField.querySelector(".password-masked");
        const icon = this.querySelector("i");

        if (passwordText.style.display === "none") {
          passwordText.style.display = "inline";
          passwordMasked.style.display = "none";
          icon.className = "fas fa-eye-slash";
        } else {
          passwordText.style.display = "none";
          passwordMasked.style.display = "inline";
          icon.className = "fas fa-eye";
        }
      });
    });

    renderPagination(filtered.length, rowsPerPage);
    updateStats(users);
  }

  // Setup select all functionality
  function setupSelectAll() {
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", function () {
        const checkboxes = document.querySelectorAll(".user-checkbox");
        checkboxes.forEach((checkbox) => {
          checkbox.checked = this.checked;
        });
      });
    }
  }

  // Setup search functionality
  function setupSearch() {
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderTable(allUsers);
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        currentPage = 1;
        renderTable(allUsers);
      });
    }
  }

  // Setup filter functionality
  function setupFilters() {
    [nasFilter, statusFilter, profileFilter].forEach((filter) => {
      if (filter) {
        filter.addEventListener("change", () => {
          currentPage = 1;
          renderTable(allUsers);
        });
      }
    });
  }

  // Setup add user modal
  function setupAddUserModal() {
    if (addUserBtn) {
      addUserBtn.addEventListener("click", () => {
        const modalOverlay = document.getElementById("modal-overlay");
        if (modalOverlay) {
          modalOverlay.style.display = "flex";
          document.body.style.overflow = "hidden";
        }
      });
    }

    // Close modal functionality
    const modalClose = document.getElementById("modal-close");
    const modalOverlay = document.getElementById("modal-overlay");

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        if (modalOverlay) {
          modalOverlay.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
    }
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
  async function initPPPoEUsersPage() {
    try {
      if (!token || !role) {
        if (window.location.pathname === "/setup") {
          window.location.href = "/login";
          return;
        }
      }

      renderSidebarByRole(role);
      setupLogout();

      // Fetch and render user data
      allUsers = await fetchUsers();
      await renderTable(allUsers);

      // Setup all functionalities
      setupSelectAll();
      setupSearch();
      setupFilters();
      setupAddUserModal();
    } catch (error) {
      console.error("Error initializing PPPoE users page:", error);
      Swal.fire("Error", "Gagal memuat halaman", "error");
    }
  }

  // Initialize the PPPoE users page
  await initPPPoEUsersPage();
});
