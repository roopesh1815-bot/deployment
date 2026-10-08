(function () {
  "use strict";

  // Use the forwarded backend URL instead when running in a remote Codespace.
  const BASE_URL = "http://127.0.0.1:5000";
  const MOCK_MODE = false;

  function mockResponse(data, isLogin) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        // Use error@example.com to exercise server-error handling in either form.
        if (data.email.toLowerCase() === "error@example.com") {
          resolve({ success: false, message: "The mock server rejected this request." });
          return;
        }
        resolve({
          success: true,
          message: isLogin ? "You’re logged in." : "Your account has been created.",
          ...(isLogin ? { token: "mock-token-" + Date.now() } : {})
        });
      }, 650);
    });
  }

  async function sendRequest(path, data, isLogin) {
    if (MOCK_MODE) return mockResponse(data, isLogin);

    let response;
    try {
      response = await fetch(BASE_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (error) {
      throw new Error("Could not reach the server. Check your connection and try again.");
    }

    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error("The server returned an invalid response.");
    }

    if (!result || typeof result !== "object" || typeof result.success !== "boolean") {
      throw new Error("The server returned an invalid response.");
    }
    if (!response.ok && result.success !== false) {
      throw new Error(result.message || "The request failed. Please try again.");
    }
    return result;
  }

  window.AuthApi = {
    registerUser(data) {
      return sendRequest("/api/register", data, false);
    },
    loginUser(data) {
      return sendRequest("/api/login", data, true);
    }
  };
})();
