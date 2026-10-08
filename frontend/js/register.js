(function () {
  "use strict";

  const form = document.getElementById("register-form");
  const submitButton = document.getElementById("register-submit");
  const notice = document.getElementById("form-notice");
  const fields = {
    name: document.getElementById("full-name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirm-password")
  };
  const validators = window.FormHelpers.validators;

  function validateAll() {
    const results = [
      window.FormHelpers.validateField(fields.name, validators.name),
      window.FormHelpers.validateField(fields.email, validators.email),
      window.FormHelpers.validateField(fields.phone, validators.phone),
      window.FormHelpers.validateField(fields.password, validators.password),
      window.FormHelpers.validateField(fields.confirmPassword, validators.confirmPassword, fields.password.value)
    ];
    return results.every(Boolean);
  }

  Object.keys(fields).forEach(function (key) {
    fields[key].addEventListener("input", function () {
      const validator = validators[key];
      if (validator) {
        window.FormHelpers.validateField(fields[key], validator, key === "confirmPassword" ? fields.password.value : undefined);
      }
      if (key === "password" && fields.confirmPassword.value) {
        window.FormHelpers.validateField(fields.confirmPassword, validators.confirmPassword, fields.password.value);
      }
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

    window.FormHelpers.setLoading(submitButton, true, "Creating account…", "Create account");
    try {
      const result = await window.AuthApi.registerUser({
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim(),
        password: fields.password.value
      });
      if (!result.success) {
        window.FormHelpers.showNotice(notice, result.message || "Registration failed. Please try again.", "error");
        return;
      }
      window.FormHelpers.showNotice(notice, result.message || "Your account has been created.", "success");
      form.reset();
      Object.values(fields).forEach(function (input) {
        window.FormHelpers.validateField(input, function () { return ""; });
      });
    } catch (error) {
      window.FormHelpers.showNotice(notice, error.message, "error");
    } finally {
      window.FormHelpers.setLoading(submitButton, false, "Creating account…", "Create account");
    }
  });
})();
