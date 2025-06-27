document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");

  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      Swal.fire("Error", "Username dan password wajib diisi", "error");
      return;
    }

    try {
      const res = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login Gagal");
      }

      const data = await res.json();
      const { token, role } = data;

      // Simpan token dan role
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_role", role);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Selamat datang ${role}`,
        confirmButtonText: "OK",
      }).then(() => {
        // Redirect ke halaman sesuai role
        if (role === "admin") {
          window.location.href = "/home";
        } else if (role === "kasir" || role === "teknisi") {
          window.location.href = "/client";
        } else {
          Swal.fire("Error", "Role tidak dikenali", "error");
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        title: "Warning",
        text: "Username atau Password Salah!",
        icon: "warning",
      });
    }
  });
});
