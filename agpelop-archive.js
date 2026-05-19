const bridgeData = {
  ...bridgeDataArkadias,
  ...bridgeDataAchaias,
  ...bridgeDataLakonias,
  ...bridgeDataIleias,
  ...bridgeDataMessinias,
  ...bridgeDataKorintias,
  ...bridgeDataArgolidas,
};

const countySelect = document.getElementById("county-select");
const riverSelect = document.getElementById("river-select");
const bridgeSelect = document.getElementById("bridge-select");

countySelect.addEventListener("change", function (e) {
  const selectedCounty = e.target.value;
  riverSelect.innerHTML =
    '<option value="">-- Επιλέξτε --</option><option value="all">Όλα τα ποτάμια</option>';
  bridgeSelect.innerHTML = '<option value="">-- Επιλέξτε --</option>';
  bridgeSelect.disabled = true;

  if (!selectedCounty) {
    riverSelect.disabled = true;
    return;
  }

  const rivers = [
    ...new Set(
      Object.values(bridgeData)
        .filter((bridge) => bridge.county === selectedCounty)
        .map((bridge) => bridge.river),
    ),
  ].sort((a, b) => a.localeCompare(b, "el")); // Add Greek language sorting

  rivers.forEach((river) => {
    const option = document.createElement("option");
    option.value = river;
    option.textContent = river;
    riverSelect.appendChild(option);
  });

  riverSelect.disabled = false;
});

riverSelect.addEventListener("change", function (e) {
  const selectedRiver = e.target.value;
  bridgeSelect.innerHTML = '<option value="">-- Επιλέξτε --</option>';

  if (!selectedRiver) {
    bridgeSelect.disabled = true;
    return;
  }

  const bridges =
    selectedRiver === "all"
      ? Object.entries(bridgeData).filter(([key, bridge]) => bridge.county === countySelect.value)
      : Object.entries(bridgeData).filter(
          ([key, bridge]) => bridge.river === selectedRiver && bridge.county === countySelect.value,
        );

  bridges.sort((a, b) => a[1].name.localeCompare(b[1].name, "el"));

  bridges.forEach(([key, bridge]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = bridge.name;
    bridgeSelect.appendChild(option);
  });

  bridgeSelect.disabled = false;
});

bridgeSelect.addEventListener("change", function (e) {
  console.log("Selection changed:", e.target.value);
  const detailsDiv = document.getElementById("bridge-details");
  if (!e.target.value) {
    detailsDiv.classList.add("hidden");
    return;
  }

  const bridge = bridgeData[e.target.value];
  let statusColor = "";
  let statusFontWeight = "normal";
  if (bridge.status === "Καλή") {
    statusColor = "green";
    statusFontWeight = "bold";
  } else if (bridge.status === "Χρειάζεται συντήρηση") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Προσθήκες τσιμέντου") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Καλυμμένο με τσιμέντο και άσφαλτο") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Καλυμμένο από άσφαλτο") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Καλυμμένο με άσφαλτο, ακαλαίσθητες επεμβάσεις") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Ακαλαίσθητες παρεμβάσεις") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Γκρεμισμένο") {
    statusColor = "black";
    statusFontWeight = "bold";
  } else if (bridge.status === "Καλυμμένο από νερό") {
    statusColor = "gray";
    statusFontWeight = "bold";
  } else if (bridge.status === "Χωμένο") {
    statusColor = "gray";
    statusFontWeight = "bold";
  } else if (bridge.status === "Γκρεμισμένο με ίχνη") {
    statusColor = "purple";
    statusFontWeight = "bold";
  } else if (bridge.status === "Σε μεγάλο κίνδυνο") {
    statusColor = "red";
    statusFontWeight = "bold";
  } else if (bridge.status === "Επένδυση με τσιμέντο") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Άσχημη, ετοιμόρροπο") {
    statusColor = "red";
    statusFontWeight = "bold";
  } else if (bridge.status === "Καλυμμένο με τσιμέντο") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Εξαφανισμένο") {
    statusColor = "black";
    statusFontWeight = "bold";
  } else if (bridge.status === "Ίχνη στηθαίων") {
    statusColor = "purple";
    statusFontWeight = "bold";
  } else if (bridge.status === "Δεν υπάρχουν ίχνη") {
    statusColor = "black";
    statusFontWeight = "bold";
  } else if (bridge.status === "Ίχνη") {
    statusColor = "purple";
    statusFontWeight = "bold";
  } else if (bridge.status === "Σκεπασμένο") {
    statusColor = "gray";
    statusFontWeight = "bold";
  } else if (bridge.status === "Φθορές σε στηθαία και επιφάνεια διάβασης") {
    statusColor = "orange";
    statusFontWeight = "bold";
  } else if (bridge.status === "Φθορές σε στηθαία και βάθρα") {
    statusColor = "orange";
    statusFontWeight = "bold";
  }

  detailsDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <h4 style="margin: 0;">${bridge.name}</h4>
          <div style="width: 15px; height: 15px; background-color: ${statusColor}; border: 1px solid #999;"></div>
        </div>
        <p><strong><i class="fas fa-map-marker-alt"></i> Νομός:</strong> ${bridge.county}</p>
        <p><strong><i class="fas fa-map-marker-alt"></i> Δήμος:</strong> ${bridge.municipal}</p>
        <p><strong><i class="fas fa-water"></i> Ποτάμι:</strong> ${bridge.river}</p>
        <p><strong><i class="fas fa-map-marker-alt"></i> Θέση:</strong> ${bridge.location}</p>
        <p><strong><i class="fas fa-calendar-alt"></i> Έτος Κατασκευής:</strong> ${bridge.year}</p>
        <p><strong><i class="fas fa-user"></i> Πρωτομάστορας:</strong> ${bridge.builder}</p>
        <p><strong><i class="fas fa-flag"></i> Κατάσταση:</strong> <span style="color: ${statusColor}; font-weight: ${statusFontWeight};">${bridge.status}</span></p>
        <p><strong><i class="fas fa-info-circle"></i> Περιγραφή:</strong> ${bridge.description}</p>
        <p><strong><i class="fas fa-link"></i> Σύνδεσμοι:</strong> ${bridge.links}</p>
    `;
  detailsDiv.classList.remove("hidden");
});

document.addEventListener("DOMContentLoaded", function () {
  const detailsDiv = document.getElementById("bridge-details");
  const searchInput = document.getElementById("bridge-search");

  // Clear search input on page load
  searchInput.value = "";

  detailsDiv.classList.add("hidden");
  countySelect.value = "";
  riverSelect.disabled = true;
  bridgeSelect.disabled = true;

  // Display total number of bridges
  const totalBridges = Object.keys(bridgeData).length;
  document.getElementById("total-bridges").textContent = totalBridges;

  // Get selector containers for graying out (only county and river)
  const countyContainer = countySelect.closest(".bridge-selector");
  const riverContainer = riverSelect.closest(".bridge-selector");

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm.length < 2) {
      // Reset the selectors if search is cleared
      countySelect.value = "";
      riverSelect.innerHTML = '<option value="">-- Επιλέξτε --</option>';
      bridgeSelect.innerHTML = '<option value="">-- Επιλέξτε --</option>';
      riverSelect.disabled = true;
      bridgeSelect.disabled = true;
      detailsDiv.classList.add("hidden");
      // Remove gray-out
      if (countyContainer) countyContainer.classList.remove("search-active");
      if (riverContainer) riverContainer.classList.remove("search-active");
      return;
    }

    // Gray out county and river selects (bridge select stays usable for results)
    if (countyContainer) countyContainer.classList.add("search-active");
    if (riverContainer) riverContainer.classList.add("search-active");

    // Filter bridges based on search term (only name and description)
    const matchingBridges = Object.entries(bridgeData).filter(([key, bridge]) => {
      return (
        bridge.name.toLowerCase().includes(searchTerm) ||
        bridge.description.toLowerCase().includes(searchTerm)
      );
    });

    // Update the bridge select with matching results
    bridgeSelect.innerHTML = '<option value="">-- Επιλέξτε --</option>';
    matchingBridges.sort((a, b) => a[1].name.localeCompare(b[1].name, "el"));

    matchingBridges.forEach(([key, bridge]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${bridge.name} (${bridge.county})`;
      bridgeSelect.appendChild(option);
    });

    // Enable bridge select if we have results
    bridgeSelect.disabled = matchingBridges.length === 0;

    if (matchingBridges.length === 1) {
      // Auto-select and display if only one result
      bridgeSelect.value = matchingBridges[0][0];
      bridgeSelect.dispatchEvent(new Event("change"));
    } else {
      // Multiple results: hide details, let user pick from bridge select
      detailsDiv.classList.add("hidden");
    }
  });
});
