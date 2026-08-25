(() => {
  "use strict";

  const TYPE_META = {
    dj: { label: "DJ", icon: "🎧", badge: "bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/30" },
    photographe: { label: "Photographe", icon: "📷", badge: "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/30" },
    videaste: { label: "Vidéaste", icon: "🎥", badge: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30" },
  };

  const BOOKING_STATUS_META = {
    en_attente: { label: "En attente", dot: "bg-amber-400", badge: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30" },
    confirme: { label: "Confirmé", dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30" },
    urgence: { label: "Urgence", dot: "bg-rose-400", badge: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/30" },
    termine: { label: "Terminé", dot: "bg-slate-400", badge: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/30" },
  };

  const state = {
    talentType: "all",
    query: "",
    availableTonight: false,
    bookingStatus: "all",
    talents: [],
    bookings: [],
    activeTalentId: null,
  };

  const el = {
    statActiveTalents: document.getElementById("stat-active-talents"),
    statWeekendBookings: document.getElementById("stat-weekend-bookings"),
    statUrgent: document.getElementById("stat-urgent"),
    statUrgentCard: document.getElementById("stat-card-urgent"),
    statRevenue: document.getElementById("stat-revenue"),

    typeFilters: document.getElementById("type-filters"),
    sosToggle: document.getElementById("sos-toggle"),
    searchInput: document.getElementById("search-input"),
    talentsTbody: document.getElementById("talents-tbody"),
    talentsCount: document.getElementById("talents-count"),
    talentsEmpty: document.getElementById("talents-empty"),
    talentsLoading: document.getElementById("talents-loading"),

    bookingStatusFilters: document.getElementById("booking-status-filters"),
    bookingsList: document.getElementById("bookings-list"),
    bookingsLoading: document.getElementById("bookings-loading"),
    bookingsCountdown: document.getElementById("bookings-refresh-countdown"),
    refreshBookings: document.getElementById("refresh-bookings"),

    refreshAll: document.getElementById("refresh-all"),
    clock: document.getElementById("clock"),

    drawer: document.getElementById("drawer"),
    drawerOverlay: document.getElementById("drawer-overlay"),
    drawerClose: document.getElementById("drawer-close"),
    drawerAvatar: document.getElementById("drawer-avatar"),
    drawerName: document.getElementById("drawer-name"),
    drawerStyle: document.getElementById("drawer-style"),
    drawerBadges: document.getElementById("drawer-badges"),
    drawerBio: document.getElementById("drawer-bio"),
    drawerCity: document.getElementById("drawer-city"),
    drawerTarif: document.getElementById("drawer-tarif"),
    drawerInstagram: document.getElementById("drawer-instagram"),
    drawerPortfolioLabel: document.getElementById("drawer-portfolio-label"),
    drawerPortfolioUrl: document.getElementById("drawer-portfolio-url"),
    drawerPortfolio: document.getElementById("drawer-portfolio"),

    proposeBtn: document.getElementById("propose-date-btn"),
    proposeForm: document.getElementById("propose-date-form"),
    proposeConfirmation: document.getElementById("propose-date-confirmation"),
    proposeDateInput: document.getElementById("propose-date-input"),
    proposeSlotInput: document.getElementById("propose-slot-input"),
    proposeBudgetInput: document.getElementById("propose-budget-input"),
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initials(name) {
    return name
      .replace(/^DJ\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function formatEuro(value) {
    return `${Math.round(value).toLocaleString("fr-FR")} €`;
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  function starRow(note) {
    const full = Math.round(note);
    let stars = "";
    for (let i = 0; i < 5; i += 1) {
      stars += i < full ? "★" : "☆";
    }
    return stars;
  }

  function typeBadge(type) {
    const meta = TYPE_META[type] ?? { label: type, icon: "•", badge: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/30" };
    return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${meta.badge}">
      <span>${meta.icon}</span>${meta.label}
    </span>`;
  }

  function bookingStatusBadge(status) {
    const meta = BOOKING_STATUS_META[status] ?? { label: status, dot: "bg-slate-400", badge: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/30" };
    const pulse = status === "urgence" ? "animate-pulse" : "";
    return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${meta.badge} ${pulse}">
      <span class="w-1.5 h-1.5 rounded-full ${meta.dot}"></span>${meta.label}
    </span>`;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${url}`);
    return res.json();
  }

  // ---------- Stats ----------
  async function loadStats() {
    try {
      const data = await fetchJson("/api/stats");
      el.statActiveTalents.textContent = data.activeTalents.toLocaleString("fr-FR");
      el.statWeekendBookings.textContent = data.bookingsThisWeekend.toLocaleString("fr-FR");
      el.statUrgent.textContent = data.urgentAlertsTonight.toLocaleString("fr-FR");
      el.statRevenue.textContent = formatEuro(data.totalRevenue);

      el.statUrgentCard.classList.toggle("bg-rose-500/10", data.urgentAlertsTonight > 0);
      el.statUrgentCard.classList.toggle("animate-pulse", data.urgentAlertsTonight > 0);

      renderTypeFilters(data.byTalentType, data.totalTalents);
      renderBookingStatusFilters(data.byBookingStatus, data.byBookingStatus ? Object.values(data.byBookingStatus).reduce((a, b) => a + b, 0) : 0);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques", err);
    }
  }

  function renderTypeFilters(byType, total) {
    const filters = [
      { key: "all", label: "Tous", count: total },
      ...Object.keys(TYPE_META).map((key) => ({ key, label: `${TYPE_META[key].label}s`, count: byType?.[key] ?? 0 })),
    ];

    el.typeFilters.innerHTML = filters
      .map((f) => {
        const active = state.talentType === f.key;
        const baseClasses = active
          ? "bg-indigo-500/15 text-indigo-300 pill-active"
          : "bg-surface-100 text-slate-400 hover:text-slate-200 hover:bg-surface-200";
        return `<button data-type="${f.key}" type="button"
          class="type-pill flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-surface-300/60 transition-colors ${baseClasses}">
          ${f.label} <span class="opacity-60">${f.count}</span>
        </button>`;
      })
      .join("");

    el.typeFilters.querySelectorAll(".type-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.talentType = btn.dataset.type;
        loadTalents();
        renderTypeFilters(byType, total);
      });
    });
  }

  function renderBookingStatusFilters(byStatus, total) {
    const filters = [
      { key: "all", label: "Tous", count: total },
      ...Object.keys(BOOKING_STATUS_META).map((key) => ({ key, label: BOOKING_STATUS_META[key].label, count: byStatus?.[key] ?? 0 })),
    ];

    el.bookingStatusFilters.innerHTML = filters
      .map((f) => {
        const active = state.bookingStatus === f.key;
        const baseClasses = active
          ? "bg-indigo-500/15 text-indigo-300 pill-active"
          : "bg-surface-100 text-slate-400 hover:text-slate-200 hover:bg-surface-200";
        return `<button data-status="${f.key}" type="button"
          class="booking-status-pill flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-surface-300/60 transition-colors ${baseClasses}">
          ${f.label} <span class="opacity-60">${f.count}</span>
        </button>`;
      })
      .join("");

    el.bookingStatusFilters.querySelectorAll(".booking-status-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.bookingStatus = btn.dataset.status;
        loadBookings();
        renderBookingStatusFilters(byStatus, total);
      });
    });
  }

  // ---------- Talents ----------
  async function loadTalents() {
    el.talentsLoading.classList.remove("hidden");
    el.talentsEmpty.classList.add("hidden");

    try {
      const params = new URLSearchParams();
      if (state.talentType !== "all") params.set("type", state.talentType);
      if (state.query) params.set("q", state.query);
      if (state.availableTonight) params.set("availableTonight", "true");

      const data = await fetchJson(`/api/talents?${params.toString()}`);
      state.talents = data.talents;
      renderTalents(data.talents);
      el.talentsCount.textContent = data.total.toLocaleString("fr-FR");
    } catch (err) {
      console.error("Erreur lors du chargement des talents", err);
    } finally {
      el.talentsLoading.classList.add("hidden");
    }
  }

  function renderTalents(talents) {
    if (!talents.length) {
      el.talentsTbody.innerHTML = "";
      el.talentsEmpty.classList.remove("hidden");
      return;
    }

    el.talentsEmpty.classList.add("hidden");
    el.talentsTbody.innerHTML = talents
      .map((talent) => {
        const meta = TYPE_META[talent.type] ?? { icon: "•", badge: "bg-slate-500/10 text-slate-300" };
        const dispoBadge = talent.availableTonight
          ? `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              Oui
            </span>`
          : `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface-200 text-slate-500">Non</span>`;

        return `<tr class="hover:bg-surface-100/60 cursor-pointer transition-colors" data-talent-id="${escapeHtml(talent.id)}">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full ${meta.badge} flex items-center justify-center flex-shrink-0 text-sm">
                ${meta.icon}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-100 truncate">${escapeHtml(talent.name)}</p>
                <p class="text-xs text-slate-500 truncate">${escapeHtml(talent.city)} · ${escapeHtml(meta.label)}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-slate-300 hidden md:table-cell">${escapeHtml(talent.style)}</td>
          <td class="px-4 py-3 text-sm text-slate-300 hidden lg:table-cell">${escapeHtml(talent.city)}</td>
          <td class="px-4 py-3 text-sm text-slate-300 hidden sm:table-cell whitespace-nowrap">${formatEuro(talent.tarif)}</td>
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            <span class="text-amber-400">${starRow(talent.note)}</span>
            <span class="text-slate-500 text-xs ml-1">${talent.note.toFixed(1)} (${talent.reviewsCount})</span>
          </td>
          <td class="px-4 py-3 text-right">${dispoBadge}</td>
        </tr>`;
      })
      .join("");

    el.talentsTbody.querySelectorAll("tr[data-talent-id]").forEach((row) => {
      row.addEventListener("click", () => openDrawer(row.dataset.talentId));
    });
  }

  let searchDebounce;
  el.searchInput.addEventListener("input", (e) => {
    state.query = e.target.value.trim();
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadTalents, 300);
  });

  el.sosToggle.addEventListener("click", () => {
    state.availableTonight = !state.availableTonight;
    el.sosToggle.classList.toggle("bg-rose-500", state.availableTonight);
    el.sosToggle.classList.toggle("text-white", state.availableTonight);
    el.sosToggle.classList.toggle("bg-rose-500/10", !state.availableTonight);
    el.sosToggle.classList.toggle("text-rose-300", !state.availableTonight);
    loadTalents();
  });

  // ---------- Drawer ----------
  function openDrawer(talentId) {
    const talent = state.talents.find((item) => item.id === talentId);
    if (!talent) return;

    state.activeTalentId = talentId;
    const meta = TYPE_META[talent.type] ?? { label: talent.type, icon: "•" };

    el.drawerAvatar.textContent = initials(talent.name);
    el.drawerName.textContent = talent.name;
    el.drawerStyle.textContent = `${meta.label} · ${talent.style}`;
    el.drawerBio.textContent = talent.bio;
    el.drawerCity.textContent = talent.city;
    el.drawerTarif.textContent = talent.tarifLabel;
    el.drawerInstagram.textContent = talent.instagram;
    el.drawerPortfolioLabel.textContent = talent.type === "dj" ? "Mixcloud" : "Portfolio";
    el.drawerPortfolioUrl.textContent = talent.portfolioUrl;

    el.drawerBadges.innerHTML = `${typeBadge(talent.type)}
      <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-surface-200 text-slate-300">
        <span class="text-amber-400">${starRow(talent.note)}</span> ${talent.note.toFixed(1)} (${talent.reviewsCount})
      </span>
      ${talent.availableTonight
        ? `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30">Dispo ce soir</span>`
        : `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-surface-200 text-slate-500">Non dispo ce soir</span>`}`;

    el.drawerPortfolio.innerHTML = talent.portfolio
      .map(
        (item) => `<div class="flex items-center gap-3 bg-surface-50 border border-surface-300/60 rounded-lg p-2.5">
          <span class="text-lg">${item.cover}</span>
          <span class="text-sm text-slate-300">${escapeHtml(item.title)}</span>
        </div>`
      )
      .join("");

    resetProposeForm();

    el.drawer.classList.remove("translate-x-full");
    el.drawerOverlay.classList.remove("hidden");
  }

  function closeDrawer() {
    el.drawer.classList.add("translate-x-full");
    el.drawerOverlay.classList.add("hidden");
    state.activeTalentId = null;
    resetProposeForm();
  }

  el.drawerClose.addEventListener("click", closeDrawer);
  el.drawerOverlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // ---------- Propose a date (client-side simulation) ----------
  function resetProposeForm() {
    el.proposeForm.classList.add("hidden");
    el.proposeConfirmation.classList.add("hidden");
    el.proposeBtn.classList.remove("hidden");
    el.proposeBtn.textContent = "Proposer une date";
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    el.proposeDateInput.value = tomorrow.toISOString().slice(0, 10);
    el.proposeBudgetInput.value = "";
  }

  el.proposeBtn.addEventListener("click", () => {
    el.proposeForm.classList.remove("hidden");
    el.proposeBtn.classList.add("hidden");
  });

  el.proposeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const talent = state.talents.find((item) => item.id === state.activeTalentId);
    if (!talent) return;

    const dateLabel = el.proposeDateInput.value
      ? new Date(`${el.proposeDateInput.value}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })
      : "date à confirmer";
    const slot = el.proposeSlotInput.value;
    const budget = el.proposeBudgetInput.value ? `${Number(el.proposeBudgetInput.value).toLocaleString("fr-FR")} €` : "budget à préciser";

    el.proposeForm.classList.add("hidden");
    el.proposeConfirmation.textContent = `Demande envoyée à ${talent.name} pour le ${dateLabel} (${slot}) — budget proposé : ${budget}. (simulation, aucune requête n'est envoyée)`;
    el.proposeConfirmation.classList.remove("hidden");
  });

  // ---------- Bookings feed ----------
  async function loadBookings() {
    try {
      const params = new URLSearchParams();
      if (state.bookingStatus !== "all") params.set("status", state.bookingStatus);
      const data = await fetchJson(`/api/bookings?${params.toString()}`);
      state.bookings = data.bookings;
      renderBookings(data.bookings);
    } catch (err) {
      console.error("Erreur lors du chargement des demandes de booking", err);
    } finally {
      el.bookingsLoading.classList.add("hidden");
    }
  }

  function renderBookings(bookings) {
    if (!bookings.length) {
      el.bookingsList.innerHTML = `<p class="text-sm text-slate-500 text-center py-10">Aucune demande de booking.</p>`;
      return;
    }

    el.bookingsList.innerHTML = bookings
      .map((booking) => {
        const urgent = booking.status === "urgence";
        return `<div class="px-4 py-3 hover:bg-surface-100/50 transition-colors ${urgent ? "border-l-2 border-rose-500 bg-rose-500/5" : ""}">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium text-slate-100 truncate">${escapeHtml(booking.talentName)} <span class="text-slate-500">→</span> ${escapeHtml(booking.buyerName)}</p>
          </div>
          <p class="text-xs text-slate-500 mt-1">${escapeHtml(booking.city)} · ${formatDate(booking.eventDate)} · ${escapeHtml(booking.timeSlot)}</p>
          <div class="flex items-center justify-between mt-2">
            ${bookingStatusBadge(booking.status)}
            <span class="text-xs font-semibold text-slate-300">${formatEuro(booking.budget)}</span>
          </div>
        </div>`;
      })
      .join("");
  }

  // ---------- Auto-refresh + clock ----------
  const BOOKINGS_REFRESH_INTERVAL = 20;
  let countdown = BOOKINGS_REFRESH_INTERVAL;

  function tickCountdown() {
    countdown -= 1;
    if (countdown <= 0) {
      loadBookings();
      loadStats();
      countdown = BOOKINGS_REFRESH_INTERVAL;
    }
    el.bookingsCountdown.textContent = `${countdown}s`;
  }

  function updateClock() {
    el.clock.textContent = new Date().toLocaleTimeString("fr-FR");
  }

  el.refreshAll.addEventListener("click", () => {
    loadStats();
    loadTalents();
    loadBookings();
    countdown = BOOKINGS_REFRESH_INTERVAL;
  });

  el.refreshBookings.addEventListener("click", () => {
    loadBookings();
    countdown = BOOKINGS_REFRESH_INTERVAL;
  });

  function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(tickCountdown, 1000);

    loadStats();
    loadTalents();
    loadBookings();
  }

  init();
})();
