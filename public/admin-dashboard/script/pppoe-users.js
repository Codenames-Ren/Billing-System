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

  // Initialize MultiStepModal after DOM is ready
  window.multiStepModal = new MultiStepModal();

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

  async function fetchUsers() {
    try {
      return sampleUsers;
    } catch (err) {
      Swal.fire("Gagal", err.message || "Gagal memuat data users", "error");
      return [];
    }
  }

  function initDarkMode() {
    const themeToggle = document.getElementById("theme-toggle-checkbox");
    const body = document.body;

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      body.classList.add("dark-theme");
      if (themeToggle) {
        themeToggle.checked = true;
      }
    }

    if (themeToggle) {
      themeToggle.addEventListener("change", function () {
        if (this.checked) {
          body.classList.add("dark-theme");
          localStorage.setItem("theme", "dark");
        } else {
          body.classList.remove("dark-theme");
          localStorage.setItem("theme", "light");
        }
      });
    }
  }

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

  async function renderTable(users) {
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const searchQuery = searchInput?.value.toLowerCase() || "";
    const nasFilterValue = nasFilter?.value || "";
    const statusFilterValue = statusFilter?.value || "";
    const profileFilterValue = profileFilter?.value || "";

    let filtered = users;

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

  function setupAddUserModal() {
    if (addUserBtn) {
      addUserBtn.addEventListener("click", () => {
        console.log("Add user button clicked");
        if (window.multiStepModal) {
          window.multiStepModal.openModal();
        } else {
          console.error("MultiStepModal not initialized");
        }
      });
    }
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
    const userNameElement = document.querySelector(".user-name");
    if (userNameElement) {
      userNameElement.innerText = displayName;
    }
  }

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

      allUsers = await fetchUsers();
      await renderTable(allUsers);

      setupSelectAll();
      setupSearch();
      setupFilters();
      setupAddUserModal();

      console.log("PPPoE Users Page initialized successfully");
    } catch (error) {
      console.error("Error initializing PPPoE users page:", error);
      Swal.fire("Error", "Gagal memuat halaman", "error");
    }
  }

  await initPPPoEUsersPage();
});

class MultiStepModal {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {};
    this.init();
  }

  init() {
    console.log("Initializing MultiStepModal");
    this.bindEvents();
    this.updateProgressBar();
    this.updateButtons();
    this.showStep(1); // Ensure step 1 is visible
  }

  bindEvents() {
    const modalOverlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");

    // Modal controls
    modalClose?.addEventListener("click", () => {
      console.log("Modal close clicked");
      this.closeModal();
    });

    modalOverlay?.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        console.log("Modal overlay clicked");
        this.closeModal();
      }
    });

    // Navigation buttons
    nextBtn?.addEventListener("click", () => {
      console.log("Next button clicked");
      this.nextStep();
    });

    prevBtn?.addEventListener("click", () => {
      console.log("Previous button clicked");
      this.prevStep();
    });

    submitBtn?.addEventListener("click", () => {
      console.log("Submit button clicked");
      this.submitForm();
    });

    // Password toggle
    passwordToggle?.addEventListener("click", () => {
      console.log("Password toggle clicked");
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      const icon = passwordToggle.querySelector("i");
      icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
    });

    // Form input listeners
    const form = document.getElementById("multistep-form");
    const inputs = form?.querySelectorAll("input, select, textarea");
    inputs?.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });

    // ESC key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isModalOpen()) {
        this.closeModal();
      }
    });

    console.log("Event listeners bound successfully");
  }

  openModal() {
    console.log("Opening modal");
    const modalOverlay = document.getElementById("modal-overlay");

    if (modalOverlay) {
      modalOverlay.style.display = "flex";
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";

      // Reset form and show first step
      this.resetForm();
      this.goToStep(1);

      console.log("Modal opened successfully");
    } else {
      console.error("Modal overlay not found");
    }
  }

  closeModal() {
    console.log("Closing modal");
    const modalOverlay = document.getElementById("modal-overlay");

    if (modalOverlay) {
      modalOverlay.style.display = "none";
      modalOverlay.classList.remove("active");
      document.body.style.overflow = "";

      this.formData = {};
      this.currentStep = 1;

      console.log("Modal closed successfully");
    }
  }

  isModalOpen() {
    const modalOverlay = document.getElementById("modal-overlay");
    return modalOverlay && modalOverlay.classList.contains("active");
  }

  showStep(step) {
    console.log(`Showing step ${step}`);

    // Hide all form steps
    const formSteps = document.querySelectorAll(".form-step");
    formSteps.forEach((s) => {
      s.classList.remove("active");
      s.style.display = "none";
    });

    // Show current form step
    const currentFormStep = document.querySelector(
      `.form-step[data-step="${step}"]`
    );
    if (currentFormStep) {
      currentFormStep.classList.add("active");
      currentFormStep.style.display = "block";
      console.log(`Form step ${step} is now visible`);
    } else {
      console.error(`Form step ${step} element not found`);
    }
  }

  nextStep() {
    console.log(`Current step: ${this.currentStep}, validating...`);

    if (this.validateCurrentStep()) {
      this.collectCurrentStepData();

      if (this.currentStep < this.totalSteps) {
        this.goToStep(this.currentStep + 1);

        if (this.currentStep === 4) {
          this.updateReviewSection();
        }
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  goToStep(step) {
    console.log(`Going to step ${step}`);

    this.currentStep = step;
    this.showStep(step);
    this.updateProgressBar();
    this.updateButtons();

    // Update progress steps
    const progressSteps = document.querySelectorAll(".progress-step");
    progressSteps.forEach((progressStep, index) => {
      const stepNumber = index + 1;
      progressStep.classList.remove("active", "completed");

      if (stepNumber === this.currentStep) {
        progressStep.classList.add("active");
      } else if (stepNumber < this.currentStep) {
        progressStep.classList.add("completed");
      }
    });
  }

  updateProgressBar() {
    const progressBar = document.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.setAttribute("data-current", this.currentStep);
    }
  }

  updateButtons() {
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");

    if (this.currentStep === 1) {
      if (prevBtn) prevBtn.style.display = "none";
    } else {
      if (prevBtn) prevBtn.style.display = "inline-flex";
    }

    if (this.currentStep === this.totalSteps) {
      if (nextBtn) nextBtn.style.display = "none";
      if (submitBtn) submitBtn.style.display = "inline-flex";
    } else {
      if (nextBtn) nextBtn.style.display = "inline-flex";
      if (submitBtn) submitBtn.style.display = "none";
    }
  }

  validateCurrentStep() {
    const currentFormStep = document.querySelector(
      `.form-step[data-step="${this.currentStep}"]`
    );
    const requiredFields = currentFormStep?.querySelectorAll("[required]");
    let isValid = true;

    console.log(
      `Validating step ${this.currentStep}, found ${
        requiredFields?.length || 0
      } required fields`
    );

    requiredFields?.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
        console.log(`Field ${field.name} is invalid`);
      }
    });

    if (!isValid) {
      this.showNotification("Please fill in all required fields", "error");
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldGroup = field.closest(".form-group");
    let isValid = true;
    let errorMessage = "";

    this.clearFieldError(field);

    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "This field is required";
    }

    if (value && field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = "Please enter a valid email address";
      }
    }

    if (value && field.name === "whatsapp") {
      const phoneRegex = /^(\+?62|0)[0-9]{9,13}$/;
      if (!phoneRegex.test(value.replace(/\s+/g, ""))) {
        isValid = false;
        errorMessage = "Please enter a valid WhatsApp number";
      }
    }

    if (value && field.name === "username") {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(value)) {
        isValid = false;
        errorMessage =
          "Username must be 3-20 characters (letters, numbers, _, -)";
      }
    }

    if (value && field.name === "password") {
      if (value.length < 6) {
        isValid = false;
        errorMessage = "Password must be at least 6 characters";
      }
    }

    if (!isValid) {
      fieldGroup?.classList.add("error");
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    const fieldGroup = field.closest(".form-group");
    let errorEl = fieldGroup?.querySelector(".error-message");

    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "error-message";
      errorEl.style.color = "red";
      errorEl.style.fontSize = "12px";
      errorEl.style.marginTop = "5px";
      errorEl.style.display = "block";
      fieldGroup?.appendChild(errorEl);
    }

    errorEl.textContent = message;
  }

  clearFieldError(field) {
    const fieldGroup = field.closest(".form-group");
    fieldGroup?.classList.remove("error");
    const errorEl = fieldGroup?.querySelector(".error-message");
    errorEl?.remove();
  }

  collectCurrentStepData() {
    const currentFormStep = document.querySelector(
      `.form-step[data-step="${this.currentStep}"]`
    );
    const inputs = currentFormStep?.querySelectorAll("input, select, textarea");

    inputs?.forEach((input) => {
      if (input.type === "checkbox") {
        this.formData[input.name] = input.checked;
      } else {
        this.formData[input.name] = input.value;
      }
    });

    console.log("Current step data collected:", this.formData);
  }

  updateReviewSection() {
    console.log("Updating review section with data:", this.formData);

    this.updateReviewField(
      "review-user-type",
      this.getSelectOptionText("user-type")
    );
    this.updateReviewField("review-username", this.formData.username);
    this.updateReviewField(
      "review-package",
      this.getSelectOptionText("package")
    );
    this.updateReviewField("review-nas", this.getSelectOptionText("nas"));
    this.updateReviewField(
      "review-ip-address",
      this.formData.ipAddress || "Auto"
    );
    this.updateReviewField(
      "review-add-to-billing",
      this.formData.addToBilling ? "Yes" : "No"
    );

    this.updateReviewField("review-full-name", this.formData.fullName);
    this.updateReviewField("review-whatsapp", this.formData.whatsapp);
    this.updateReviewField("review-address", this.formData.address);
    this.updateReviewField(
      "review-email",
      this.formData.email || "Not provided"
    );

    this.updateReviewField(
      "review-payment-type",
      this.getSelectOptionText("payment-type")
    );
    this.updateReviewField(
      "review-active-date",
      this.formatDate(this.formData.activeDate)
    );
    this.updateReviewField(
      "review-billing-period",
      this.getSelectOptionText("billing-period")
    );
    this.updateReviewField(
      "review-invoice-status",
      this.getSelectOptionText("invoice-status")
    );
    this.updateReviewField(
      "review-generate-invoice",
      this.formData.generateInvoice ? "Yes" : "No"
    );
  }

  updateReviewField(reviewId, value) {
    const reviewEl = document.getElementById(reviewId);
    if (reviewEl) {
      reviewEl.textContent = value || "-";
    }
  }

  getSelectOptionText(selectId) {
    const select = document.getElementById(selectId);
    const selectedOption = select?.options[select.selectedIndex];
    return selectedOption?.text || "-";
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async submitForm() {
    this.collectCurrentStepData();

    const submitBtn = document.getElementById("submit-btn");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
      console.log("Form Data to be submitted:", this.formData);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.showNotification("User created successfully!", "success");
      this.closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      this.showNotification("Error creating user. Please try again.", "error");
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  resetForm() {
    console.log("Resetting form");

    const form = document.getElementById("multistep-form");
    if (form) {
      form.reset();
    }

    const errorGroups = document.querySelectorAll(".form-group.error");
    errorGroups.forEach((group) => {
      group.classList.remove("error");
      const errorMsg = group.querySelector(".error-message");
      errorMsg?.remove();
    });

    this.formData = {};

    // Set default active date to today
    const activeDateInput = document.getElementById("active-date");
    if (activeDateInput) {
      const today = new Date().toISOString().split("T")[0];
      activeDateInput.value = today;
    }
  }

  showNotification(message, type = "info") {
    if (typeof Swal !== "undefined") {
      const icon =
        type === "error" ? "error" : type === "success" ? "success" : "info";
      Swal.fire({
        title:
          type === "error" ? "Error" : type === "success" ? "Success" : "Info",
        text: message,
        icon: icon,
        confirmButtonColor: "#4a90e2",
        timer: type === "success" ? 3000 : undefined,
        timerProgressBar: true,
      });
    } else {
      alert(message);
    }
  }
}
