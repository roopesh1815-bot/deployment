(function () {
  "use strict";

  if (!localStorage.getItem("authToken")) {
    window.location.replace("login.html");
    return;
  }

  document.getElementById("logout-button").addEventListener("click", function () {
    localStorage.removeItem("authToken");
    window.location.replace("login.html");
  });
})();
