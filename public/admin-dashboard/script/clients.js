document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("auth_token");
  const tableBody = document.getElementById("client-table-body");
  const filterSelect = document.getElementById("status-filter");
  const filterBtn = document.getElementById("filter-btn");
  const resetBtn = document.getElementById("reset-btn");

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  }

  async function fetchClients() {
    try {
      const res = await fetch("/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memuat data pelanggan.");
      }

      const data = await res.json();

      // Karena controller return langsung []Client
      if (!Array.isArray(data)) {
        throw new Error("Respon backend tidak sesuai format (bukan array)");
      }

      return data;
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
      return [];
    }
  }

  async function renderTable(clients, filterStatus = "") {
    tableBody.innerHTML = "";

    const filtered = filterStatus
      ? clients.filter((c) => {
          // Pastikan menggunakan huruf kapital sesuai dengan struktur data
          const status = c?.Billings?.[0]?.Status || c?.billings?.[0]?.Status;
          return status && status.toLowerCase() === filterStatus;
        })
      : clients;

    if (filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="9" style="text-align:center;">Tidak ada data tersedia</td></tr>';
      return;
    }

    filtered.forEach((client) => {
      // Menggunakan huruf kapital sesuai dengan struktur data dari backend
      const billing = client.Billings?.[0] || client.billings?.[0];
      if (!billing) return;

      console.log("ISI CLIENT:", client);
      console.log("ISI BILLING:", billing);

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${client.Name || client.name || "-"}</td>
        <td>${client.Address || client.address || "-"}</td>
        <td>${client.Region || client.region || "-"}</td>
        <td>${client.Whatsapp || client.whatsapp || "-"}</td>
        <td>${billing.Package || billing.package || "-"}</td>
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
    });

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
          // Update tipe client
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

          // Update status billing
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

          // Refresh data setelah update
          const updatedClients = await fetchClients();
          renderTable(updatedClients, filterSelect.value);
        } catch (err) {
          console.error("Update error", err);
          Swal.fire("Error", err.message || "Gagal update data", "error");
        }
      });
    });
  }

  const allClients = await fetchClients();
  console.log("CLIENTS:", allClients);
  renderTable(allClients);

  filterBtn.addEventListener("click", () => {
    const selected = filterSelect.value;
    renderTable(allClients, selected);
  });

  resetBtn.addEventListener("click", () => {
    filterSelect.value = "";
    renderTable(allClients);
  });
});
