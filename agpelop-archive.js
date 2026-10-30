// Bridge data lives in one CSV file per county in archive-data/
const CSV_FILES = [
  "archive-data/arkadias.csv",
  "archive-data/achaias.csv",
  "archive-data/lakonias.csv",
  "archive-data/ileias.csv",
  "archive-data/messinias.csv",
  "archive-data/korintias.csv",
  "archive-data/argolidas.csv",
];

// Filled from the CSV files on page load: { "gefyri-<id>": { name, county, ... } }
const bridgeData = {};

// Parse CSV text (quoted fields may contain commas, quotes and line breaks)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  text = text.replace(/^﻿/, "");

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()])));
}

function loadBridgeData() {
  return Promise.all(
    CSV_FILES.map((file) =>
      fetch(file).then((response) => {
        if (!response.ok) throw new Error(`${file}: ${response.status}`);
        return response.text();
      }),
    ),
  ).then((texts) => {
    texts.forEach((text) => {
      parseCSV(text).forEach((bridge) => {
        if (bridge.id) bridgeData[`gefyri-${bridge.id}`] = bridge;
      });
    });
  });
}

// Lowercase and strip Greek accents/diaeresis so "γεφυρι" matches "Γεφύρι"
function normalizeText(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ς/g, "σ");
}

function escapeHTML(text) {
  return (text || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

// Colours for the exact status wordings already in use
const STATUS_COLORS = {
  "Καλή": "green",
  "Χρειάζεται συντήρηση": "orange",
  "Προσθήκες τσιμέντου": "orange",
  "Καλυμμένο με τσιμέντο και άσφαλτο": "orange",
  "Καλυμμένο από άσφαλτο": "orange",
  "Καλυμμένο με άσφαλτο, ακαλαίσθητες επεμβάσεις": "orange",
  "Ακαλαίσθητες παρεμβάσεις": "orange",
  "Γκρεμισμένο": "black",
  "Καλυμμένο από νερό": "gray",
  "Χωμένο": "gray",
  "Γκρεμισμένο με ίχνη": "purple",
  "Σε μεγάλο κίνδυνο": "red",
  "Επένδυση με τσιμέντο": "orange",
  "Άσχημη, ετοιμόρροπο": "red",
  "Καλυμμένο με τσιμέντο": "orange",
  "Εξαφανισμένο": "black",
  "Ίχνη στηθαίων": "purple",
  "Δεν υπάρχουν ίχνη": "black",
  "Ίχνη": "purple",
  "Σκεπασμένο": "gray",
  "Φθορές σε στηθαία και επιφάνεια διάβασης": "orange",
  "Φθορές σε στηθαία και βάθρα": "orange",
};

// Any other wording is coloured by keyword (matched without accents, first match wins)
const STATUS_KEYWORDS = [
  ["κινδυν", "red"],
  ["ετοιμορ", "red"],
  ["ασχημ", "red"],
  ["ιχν", "purple"],
  ["σωζοντ", "purple"],
  ["γκρεμισ", "black"],
  ["εξαφαν", "black"],
  ["δεν υπαρχ", "black"],
  ["νερο", "gray"],
  ["χωμα", "gray"],
  ["χωμεν", "gray"],
  ["σκεπασ", "gray"],
  ["καλη", "green"],
  ["τσιμεν", "orange"],
  ["ασφαλτ", "orange"],
  ["παρεμβασ", "orange"],
  ["επεμβασ", "orange"],
  ["φθορ", "orange"],
  ["συντηρ", "orange"],
  ["επισκευ", "orange"],
  ["προσθηκ", "orange"],
];

// Muted display shades for each colour group
const STATUS_SHADES = {
  green: "#4a8c5c",
  orange: "#d4892f",
  red: "#c0473b",
  purple: "#7e5a9b",
  black: "#3b3b3b",
  gray: "#9b9b9b",
};

function statusShade(color) {
  return STATUS_SHADES[color] || "transparent";
}

// Shown when hovering over the colour square next to the bridge name
const STATUS_LABELS = {
  green: "Καλή κατάσταση",
  orange: "Χρειάζεται επισκευή ή συντήρηση, ακαλαίσθητες παρεμβάσεις, επένδυση με τσιμέντο",
  red: "Σε άσχημη κατάσταση ή σε μεγάλο κίνδυνο",
  purple: "Γκρεμισμένο με ίχνη",
  black: "Χωμένο, εξαφανισμένο ή γκρεμισμένο χωρίς ίχνη",
  gray: "Σκεπασμένο από άσφαλτο, τσιμέντο, χώμα ή νερό",
};

function getStatusColor(status) {
  if (STATUS_COLORS[status]) return STATUS_COLORS[status];
  const normalized = normalizeText(status);
  const match = STATUS_KEYWORDS.find(([keyword]) => normalized.includes(keyword));
  return match ? match[1] : "";
}

function renderLinks(bridge) {
  const links = [
    [bridge.link_url, bridge.link_title],
    [bridge.link2_url, bridge.link2_title],
  ].filter(([url]) => url);
  if (!links.length) return "";
  const label = links.length > 1 ? "Σχετικά άρθρα" : "Σχετικό άρθρο";
  const anchors = links
    .map(
      ([url, title]) =>
        `<a href="${escapeHTML(url)}" target="_blank">${escapeHTML(title || bridge.name)}</a>`,
    )
    .join(", ");
  return `${label} στο blog του Α.Γ.Π.: ${anchors}`;
}

function showBridge(key) {
  const detailsDiv = document.getElementById("bridge-details");
  const bridge = bridgeData[key];
  if (!bridge) {
    detailsDiv.classList.add("hidden");
    return;
  }

  const statusColor = getStatusColor(bridge.status);
  const statusFontWeight = statusColor ? "500" : "normal";

  detailsDiv.innerHTML = `
        <button type="button" class="print-bridge" onclick="window.print()" title="Εκτύπωση" aria-label="Εκτύπωση">
          <i class="fas fa-print"></i>
        </button>
        <div style="display: flex; align-items: center; gap: 10px;">
          <h4 style="margin: 0;">${escapeHTML(bridge.name)}</h4>
          <span class="status-dot status-dot-large" title="${STATUS_LABELS[statusColor] || ""}" style="background-color: ${statusShade(statusColor)};"></span>
        </div>
        <p><strong><i class="fas fa-map-marker-alt"></i> Νομός:</strong> ${escapeHTML(bridge.county)}</p>
        <p><strong><i class="fas fa-map-marker-alt"></i> Δήμος:</strong> ${escapeHTML(bridge.municipal)}</p>
        <p><strong><i class="fas fa-water"></i> Ποτάμι:</strong> ${escapeHTML(bridge.river)}</p>
        <p><strong><i class="fas fa-map-marker-alt"></i> Θέση:</strong> ${escapeHTML(bridge.location)}</p>
        <p><strong><i class="fas fa-calendar-alt"></i> Έτος Κατασκευής:</strong> ${escapeHTML(bridge.year)}</p>
        <p><strong><i class="fas fa-user"></i> Πρωτομάστορας:</strong> ${escapeHTML(bridge.builder)}</p>
        <p><strong><i class="fas fa-flag"></i> Κατάσταση:</strong> <span style="color: ${statusShade(statusColor)}; font-weight: ${statusFontWeight};">${escapeHTML(bridge.status)}</span></p>
        <p><strong><i class="fas fa-info-circle"></i> Περιγραφή:</strong> ${escapeHTML(bridge.description)}</p>
        <p><strong><i class="fas fa-link"></i> Σύνδεσμοι:</strong> ${renderLinks(bridge)}</p>
        <p class="print-only print-source">Πηγή: Αρχείο Γεφυριών Πελοποννήσου, Θοδωρής Χαμάκος, ${escapeHTML(`${location.origin}${location.pathname}#${key}`)}</p>
    `;

  detailsDiv.classList.remove("hidden");
}

// Status filter chips: one per colour group, in this order
const STATUS_FILTERS = [
  ["green", "Καλή"],
  ["orange", "Παρεμβάσεις / φθορές"],
  ["red", "Σε κίνδυνο"],
  ["purple", "Γκρεμισμένα με ίχνη"],
  ["black", "Χωρίς ίχνη"],
  ["gray", "Σκεπασμένα"],
];

const searchInput = document.getElementById("bridge-search");
const countySelect = document.getElementById("county-select");
const riverSelect = document.getElementById("river-select");
const statusFilter = document.getElementById("status-filter");
const bridgeList = document.getElementById("bridge-list");
const resultsCount = document.getElementById("results-count");
const clearButton = document.getElementById("clear-filters");

let selectedStatus = "";
let selectedKey = "";

function matchesSearch(bridge, words) {
  if (!words.length) return true;
  const haystack = normalizeText(
    [bridge.name, bridge.county, bridge.municipal, bridge.river, bridge.location, bridge.description].join(" "),
  );
  return words.every((word) => haystack.includes(word));
}

// Bridges matching every filter, optionally ignoring the status filter (used for the chip counts)
function filterBridges(ignoreStatus) {
  const words = normalizeText(searchInput.value.trim()).split(/\s+/).filter(Boolean);
  return Object.entries(bridgeData).filter(
    ([key, bridge]) =>
      (!countySelect.value || bridge.county === countySelect.value) &&
      (!riverSelect.value || bridge.river === riverSelect.value) &&
      (ignoreStatus || !selectedStatus || getStatusColor(bridge.status) === selectedStatus) &&
      matchesSearch(bridge, words),
  );
}

// Rivers of the chosen county (or of all counties), keeping the current choice if still valid
function updateRiverOptions() {
  const current = riverSelect.value;
  const rivers = [
    ...new Set(
      Object.values(bridgeData)
        .filter((bridge) => !countySelect.value || bridge.county === countySelect.value)
        .map((bridge) => bridge.river),
    ),
  ].sort((a, b) => a.localeCompare(b, "el"));

  riverSelect.innerHTML = '<option value="">Όλα</option>';
  rivers.forEach((river) => {
    const option = document.createElement("option");
    option.value = river;
    option.textContent = river;
    riverSelect.appendChild(option);
  });
  riverSelect.value = rivers.includes(current) ? current : "";
}

function renderStatusChips() {
  const candidates = filterBridges(true);
  const counts = {};
  candidates.forEach(([key, bridge]) => {
    const color = getStatusColor(bridge.status);
    counts[color] = (counts[color] || 0) + 1;
  });

  const chip = (value, label, count, title) => `
    <button type="button" class="status-chip${selectedStatus === value ? " active" : ""}"
      data-status="${value}" title="${escapeHTML(title)}" aria-pressed="${selectedStatus === value}">
      ${value ? `<span class="status-dot" style="background-color: ${statusShade(value)};"></span>` : ""}
      ${escapeHTML(label)} <span class="chip-count">${count}</span>
    </button>`;

  statusFilter.innerHTML =
    chip("", "Όλα", candidates.length, "Όλες οι καταστάσεις") +
    STATUS_FILTERS.map(([color, label]) => chip(color, label, counts[color] || 0, STATUS_LABELS[color])).join("");
}

function renderList() {
  const results = filterBridges(false).sort((a, b) => a[1].name.localeCompare(b[1].name, "el"));
  const total = Object.keys(bridgeData).length;

  resultsCount.textContent =
    results.length === total
      ? `Όλα τα γεφύρια (${total})`
      : results.length === 1
        ? "1 γεφύρι"
        : `${results.length} γεφύρια`;

  const filtered = searchInput.value.trim() || countySelect.value || riverSelect.value || selectedStatus;
  clearButton.classList.toggle("hidden", !filtered);

  // Close the open bridge if the new filters no longer include it
  if (selectedKey && !results.some(([key]) => key === selectedKey)) {
    selectedKey = "";
    showBridge("");
    history.replaceState(null, "", location.pathname);
  }

  if (!results.length) {
    bridgeList.innerHTML = '<li class="bridge-list-empty">Δεν βρέθηκαν γεφύρια με αυτά τα κριτήρια.</li>';
    return;
  }

  bridgeList.innerHTML = results
    .map(([key, bridge]) => {
      const color = getStatusColor(bridge.status);
      const place = [bridge.river, bridge.municipal, countySelect.value ? "" : bridge.county]
        .filter((part) => part && part !== "-")
        .join(" · ");
      return `
        <li>
          <button type="button" class="bridge-item${key === selectedKey ? " active" : ""}" data-key="${key}">
            <span class="status-dot" style="background-color: ${statusShade(color)};" title="${escapeHTML(STATUS_LABELS[color] || "")}"></span>
            <span class="bridge-item-name">${escapeHTML(bridge.name)}</span>
            <span class="bridge-item-place" title="${escapeHTML(place)}">${escapeHTML(place)}</span>
          </button>
        </li>`;
    })
    .join("");
}

function refresh() {
  renderStatusChips();
  renderList();
}

function selectBridge(key, scroll) {
  selectedKey = key;
  showBridge(key);
  bridgeList.querySelectorAll(".bridge-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.key === key);
  });
  // Keep the address bar pointing at the selected bridge so it can be shared
  history.replaceState(null, "", key ? `#${key}` : location.pathname);
  if (scroll) {
    document.getElementById("bridge-details").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

searchInput.addEventListener("input", refresh);
riverSelect.addEventListener("change", refresh);
countySelect.addEventListener("change", function () {
  updateRiverOptions();
  refresh();
});

statusFilter.addEventListener("click", function (e) {
  const chip = e.target.closest(".status-chip");
  if (!chip) return;
  selectedStatus = chip.dataset.status;
  refresh();
});

bridgeList.addEventListener("click", function (e) {
  const item = e.target.closest(".bridge-item");
  if (item) selectBridge(item.dataset.key, true);
});

clearButton.addEventListener("click", function () {
  searchInput.value = "";
  countySelect.value = "";
  selectedStatus = "";
  updateRiverOptions();
  refresh();
  searchInput.focus();
});

// Open the bridge named in the address (e.g. agpelop-archive.html#gefyri-170)
function openBridgeFromHash() {
  const key = decodeURIComponent(location.hash.slice(1));
  if (!bridgeData[key]) return;
  // Clear filters that would hide the bridge from the list
  if (!filterBridges(false).some(([k]) => k === key)) {
    searchInput.value = "";
    countySelect.value = "";
    selectedStatus = "";
    updateRiverOptions();
    refresh();
  }
  selectBridge(key, true);
  const item = bridgeList.querySelector(`[data-key="${key}"]`);
  if (item) item.scrollIntoView({ block: "nearest" });
}

document.addEventListener("DOMContentLoaded", function () {
  searchInput.value = "";
  countySelect.value = "";
  searchInput.disabled = true;
  countySelect.disabled = true;
  riverSelect.disabled = true;

  loadBridgeData()
    .then(() => {
      searchInput.disabled = false;
      countySelect.disabled = false;
      riverSelect.disabled = false;
      document.getElementById("total-bridges").textContent = Object.keys(bridgeData).length;
      updateRiverOptions();
      refresh();
      openBridgeFromHash();
      window.addEventListener("hashchange", openBridgeFromHash);
    })
    .catch((error) => {
      console.error("Failed to load bridge data:", error);
      bridgeList.innerHTML =
        '<li class="bridge-list-empty">Σφάλμα κατά τη φόρτωση του αρχείου γεφυριών. Δοκιμάστε να ανανεώσετε τη σελίδα.</li>';
    });
});
