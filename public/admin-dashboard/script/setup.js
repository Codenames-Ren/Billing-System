class MultiStepModal {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {};
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateProgressBar();
    this.updateButtons();
  }

  bindEvents() {
    // Modal controls
    const addUserBtn = document.getElementById("add-user-btn");
    const modalOverlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");

    // Password toggle
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");

    // Event listeners
    addUserBtn?.addEventListener("click", () => this.openModal());
    modalClose?.addEventListener("click", () => this.closeModal());
    modalOverlay?.addEventListener("click", (e) => {
      if (e.target === modalOverlay) this.closeModal();
    });

    nextBtn?.addEventListener("click", () => this.nextStep());
    prevBtn?.addEventListener("click", () => this.prevStep());
    submitBtn?.addEventListener("click", () => this.submitForm());

    // Password toggle
    passwordToggle?.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      const icon = passwordToggle.querySelector("i");
      icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
    });

    // Form input listeners for real-time validation
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
  }

  openModal() {
    const modalOverlay = document.getElementById("modal-overlay");
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Reset form
    this.resetForm();
    this.goToStep(1);
  }

  closeModal() {
    const modalOverlay = document.getElementById("modal-overlay");
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";

    // Reset form data
    this.formData = {};
    this.currentStep = 1;
  }

  isModalOpen() {
    const modalOverlay = document.getElementById("modal-overlay");
    return modalOverlay.classList.contains("active");
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.collectCurrentStepData();

      if (this.currentStep < this.totalSteps) {
        this.goToStep(this.currentStep + 1);

        // Update review if we're going to step 4
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
    // Hide all steps
    const steps = document.querySelectorAll(".form-step");
    steps.forEach((s) => s.classList.remove("active"));

    // Show current step
    const currentStepEl = document.querySelector(`[data-step="${step}"]`);
    currentStepEl?.classList.add("active");

    // Update progress
    this.currentStep = step;
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
    progressBar?.setAttribute("data-current", this.currentStep);
  }

  updateButtons() {
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");

    // Previous button
    if (this.currentStep === 1) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "inline-flex";
    }

    // Next/Submit buttons
    if (this.currentStep === this.totalSteps) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "inline-flex";
      submitBtn.style.display = "none";
    }
  }

  validateCurrentStep() {
    const currentStepEl = document.querySelector(
      `[data-step="${this.currentStep}"]`
    );
    const requiredFields = currentStepEl?.querySelectorAll("[required]");
    let isValid = true;

    requiredFields?.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
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

    // Clear previous errors
    this.clearFieldError(field);

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "This field is required";
    }

    // Specific field validations
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

    // Show error if invalid
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
    const currentStepEl = document.querySelector(
      `[data-step="${this.currentStep}"]`
    );
    const inputs = currentStepEl?.querySelectorAll("input, select, textarea");

    inputs?.forEach((input) => {
      if (input.type === "checkbox") {
        this.formData[input.name] = input.checked;
      } else {
        this.formData[input.name] = input.value;
      }
    });
  }

  updateReviewSection() {
    // Account Information
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

    // Member Information
    this.updateReviewField("review-full-name", this.formData.fullName);
    this.updateReviewField("review-whatsapp", this.formData.whatsapp);
    this.updateReviewField("review-address", this.formData.address);
    this.updateReviewField(
      "review-email",
      this.formData.email || "Not provided"
    );

    // Payment Information
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
    // Collect final data
    this.collectCurrentStepData();

    // Show loading state
    const submitBtn = document.getElementById("submit-btn");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
      // Simulate API call (replace with actual API call later)
      console.log("Form Data to be submitted:", this.formData);

      // Here you would normally send the data to your backend
      // const response = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(this.formData)
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      this.showNotification("User created successfully!", "success");
      this.closeModal();

      // Optionally refresh the user table
      // this.refreshUserTable();
    } catch (error) {
      console.error("Error submitting form:", error);
      this.showNotification("Error creating user. Please try again.", "error");
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  resetForm() {
    const form = document.getElementById("multistep-form");
    form?.reset();

    // Clear all error states
    const errorGroups = form?.querySelectorAll(".form-group.error");
    errorGroups?.forEach((group) => {
      group.classList.remove("error");
      const errorMsg = group.querySelector(".error-message");
      errorMsg?.remove();
    });

    // Reset form data
    this.formData = {};

    // Set default active date to today
    const activeDateInput = document.getElementById("active-date");
    if (activeDateInput) {
      const today = new Date().toISOString().split("T")[0];
      activeDateInput.value = today;
    }
  }

  showNotification(message, type = "info") {
    // Using SweetAlert2 if available, otherwise use browser alert
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

  // Method to refresh user table (to be implemented based on your table structure)
  refreshUserTable() {
    // This would typically reload the user data from the server
    // and update the table
    console.log("Refreshing user table...");
  }
}

// Initialize the modal when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.multiStepModal = new MultiStepModal();
});

// Export for use in other files if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = MultiStepModal;
}
