(function () {
  "use strict";

  const form = document.getElementById("login-form");
  const submitButton = document.getElementById("login-submit");
  const notice = document.getElementById("form-notice");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const validators = window.FormHelpers.validators;

  function validateAll() {
    const emailValid = window.FormHelpers.validateField(email, validators.email);
    const passwordValid = window.FormHelpers.validateField(password, function (value) {
      return value ? "" : "Enter your password.";
    });
    return emailValid && passwordValid;
  }

  email.addEventListener("input", function () {
    window.FormHelpers.validateField(email, validators.email);
  });
  password.addEventListener("input", function () {
    window.FormHelpers.validateField(password, function (value) {
      return value ? "" : "Enter your password.";
    });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    notice.hidden = true;
    if (!validateAll()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    window.FormHelpers.setLoading(submitButton, true, "Logging in…", "Log in");
    try {
      const result = await window.AuthApi.loginUser({
        email: email.value.trim(),
        password: password.value
      });
      if (!result.success) {
        window.FormHelpers.showNotice(notice, result.message || "Login failed. Please try again.", "error");
        return;
      }
      if (!result.token) {
        throw new Error("The server did not return an authentication token.");
      }
      localStorage.setItem("authToken", result.token);
      window.location.href = "dashboard.html";
    } catch (error) {
      window.FormHelpers.showNotice(notice, error.message, "error");
    } finally {
      window.FormHelpers.setLoading(submitButton, false, "Logging in…", "Log in");
    }
  });
})();
