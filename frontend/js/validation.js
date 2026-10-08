(function () {
  "use strict";

  const validators = {
    name(value) {
      if (!value.trim()) return "Enter your full name.";
      if (value.trim().length < 3) return "Your name must be at least 3 characters.";
      return "";
    },
    email(value) {
      if (!value.trim()) return "Enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return "Enter a valid email address.";
      }
      return "";
    },
    phone(value) {
      if (!/^\d{10}$/.test(value.trim())) return "Enter a 10-digit phone number.";
      return "";
    },
    password(value) {
      if (value.length < 8) return "Use at least 8 characters.";
      if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
      if (!/[a-z]/.test(value)) return "Include at least one lowercase letter.";
      if (!/\d/.test(value)) return "Include at least one number.";
      if (!/[^A-Za-z0-9]/.test(value)) return "Include at least one special character.";
      return "";
    },
    confirmPassword(value, password) {
      if (!value) return "Confirm your password.";
      if (value !== password) return "Passwords do not match.";
      return "";
    }
  };

  function setFieldError(input, message) {
    const error = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
    return !message;
  }

  function validateField(input, validator, relatedValue) {
    return setFieldError(input, validator(input.value, relatedValue));
  }

  function attachPasswordToggles() {
    document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
      button.addEventListener("click", function () {
        const input = document.getElementById(button.dataset.togglePassword);
        const isVisible = input.type === "text";
        input.type = isVisible ? "password" : "text";
        button.textContent = isVisible ? "Show" : "Hide";
        button.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
        button.setAttribute("aria-pressed", String(!isVisible));
      });
    });
  }

  function setLoading(button, isLoading, loadingText, idleText) {
    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));
    button.querySelector(".button-label").textContent = isLoading ? loadingText : idleText;
  }

  function showNotice(element, message, type) {
    element.textContent = message;
    element.className = "notice notice--" + type;
    element.hidden = false;
  }

  window.FormHelpers = {
    validators,
    validateField,
    attachPasswordToggles,
    setLoading,
    showNotice
  };

  attachPasswordToggles();
})();
