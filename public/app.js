(() => {
  "use strict";

  // ---------- Icons (inline SVG — no emojis used as icons) ----------
  const ICONS = {
    dj: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4 13.5v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.4"/><rect x="17.5" y="13" width="4" height="6" rx="1.4"/></svg>`,
    photographe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.132.174-1.334.222-2.304 1.365-2.304 2.717v9.19c0 1.297 1.052 2.35 2.35 2.35h15.8c1.297 0 2.35-1.052 2.35-2.35v-9.19c0-1.352-.97-2.495-2.304-2.717a41 41 0 0 0-1.132-.174 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"/></svg>`,
    videaste: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>`,
  };

  const STAR_PATH = "M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.116 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.372 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.116-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006Z";

  const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>`;
  const ALERT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>`;

  const TYPE_META = {
    dj: {
      label: "DJ",
      icon: ICONS.dj,
      avatarBg: "bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/25 ring-1 ring-inset ring-fuchsia-400/25 text-fuchsia-200",
      badge: "bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/30",
    },
    photographe: {
      label: "Photographe",
      icon: ICONS.photographe,
      avatarBg: "bg-gradient-to-br from-sky-500/25 to-cyan-500/25 ring-1 ring-inset ring-sky-400/25 text-sky-200",
      badge: "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/30",
    },
    videaste: {
      label: "Vidéaste",
      icon: ICONS.videaste,
      avatarBg: "bg-gradient-to-br from-amber-500/25 to-orange-500/25 ring-1 ring-inset ring-amber-400/25 text-amber-200",
      badge: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
    },
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
    statActiveBadge: document.getElementById("stat-active-badge"),
    statWeekendBookings: document.getElementById("stat-weekend-bookings"),
    statWeekendBadge: document.getElementById("stat-weekend-badge"),
    statUrgent: document.getElementById("stat-urgent"),
    statUrgentBadge: document.getElementById("stat-urgent-badge"),
    statUrgentCard: document.getElementById("stat-card-urgent"),
    statUrgentHairline: document.getElementById("stat-urgent-hairline"),
    statRevenue: document.getElementById("stat-revenue"),
    statRevenueBadge: document.getElementById("stat-revenue-badge"),

    typeFilters: document.getElementById("type-filters"),
    sosToggle: document.getElementById("sos-toggle"),
    sosCount: document.getElementById("sos-count"),
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
    let html = '<span class="inline-flex items-center gap-0.5" role="img" aria-label="' + note.toFixed(1) + ' sur 5">';
    for (let i = 0; i < 5; i += 1) {
      const filled = i < full;
      html += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-3.5 h-3.5 ${filled ? "text-amber-400" : "text-slate-600"}" fill="currentColor" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
    }
    html += "</span>";
    return html;
  }

  function typeBadge(type) {
    const meta = TYPE_META[type] ?? { label: type, icon: "", badge: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/30" };
    return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${meta.badge}">
      ${meta.icon}${meta.label}
    </span>`;
  }

  function bookingStatusBadge(status) {
    const meta = BOOKING_STATUS_META[status] ?? { label: status, dot: "bg-slate-400", badge: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/30" };
    const pulse = status === "urgence" ? "animate-pulse-soft" : "";
    return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${meta.badge}">
      <span class="w-1.5 h-1.5 rounded-full ${meta.dot} ${pulse}"></span>${meta.label}
    </span>`;
  }

  function contextBadge(text, tone) {
    const tones = {
      neutral: "text-slate-400",
      positive: "text-emerald-300",
      warning: "text-amber-300",
      danger: "text-rose-300",
    };
    return `<span class="${tones[tone] ?? tones.neutral}">${text}</span>`;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${url}`);
    return res.json();
  }

  // ---------- Stats ----------
  async function loadStats() {
    try {
      const [stats, sosData] = await Promise.all([
        fetchJson("/api/stats"),
        fetchJson("/api/talents?availableTonight=true"),
      ]);

      el.statActiveTalents.textContent = stats.activeTalents.toLocaleString("fr-FR");
      el.statWeekendBookings.textContent = stats.bookingsThisWeekend.toLocaleString("fr-FR");
      el.statUrgent.textContent = stats.urgentAlertsTonight.toLocaleString("fr-FR");
      el.statRevenue.textContent = formatEuro(stats.totalRevenue);
      el.sosCount.textContent = sosData.total.toLocaleString("fr-FR");

      const activePct = stats.totalTalents ? Math.round((stats.activeTalents / stats.totalTalents) * 100) : 0;
      el.statActiveBadge.innerHTML = `${CHECK_ICON}${contextBadge(`${activePct}% du vivier actif`, "positive")}`;

      const totalBookings = Object.values(stats.byBookingStatus ?? {}).reduce((a, b) => a + b, 0);
      const weekendPct = totalBookings ? Math.round((stats.bookingsThisWeekend / totalBookings) * 100) : 0;
      el.statWeekendBadge.innerHTML = contextBadge(`${weekendPct}% du volume total`, "neutral");

      const hasUrgent = stats.urgentAlertsTonight > 0;
      el.statUrgentBadge.innerHTML = hasUrgent
        ? `${ALERT_ICON}${contextBadge("Action requise", "danger")}`
        : `${CHECK_ICON}${contextBadge("Sous contrôle", "positive")}`;
      el.statUrgentCard.classList.toggle("ring-rose-500/40", hasUrgent);
      el.statUrgentCard.classList.toggle("shadow-glow-rose", hasUrgent);
      el.statUrgentHairline.classList.toggle("neon-hairline-rose", hasUrgent);
      el.statUrgentHairline.classList.toggle("animate-pulse-soft", hasUrgent);

      const dealsCount = (stats.byBookingStatus?.confirme ?? 0) + (stats.byBookingStatus?.termine ?? 0);
      el.statRevenueBadge.innerHTML = contextBadge(`${dealsCount.toLocaleString("fr-FR")} deals conclus`, "neutral");

      renderTypeFilters(stats.byTalentType, stats.totalTalents);
      renderBookingStatusFilters(stats.byBookingStatus, totalBookings);
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
          ? "bg-indigo-500/15 text-indigo-300 pill-active ring-indigo-400/40"
          : "bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] ring-white/10 hover:ring-white/20";
        return `<button data-type="${f.key}" type="button" aria-pressed="${active}"
          class="type-pill flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset transition-all duration-200 cursor-pointer ${baseClasses}">
          ${f.label} <span class="opacity-60 tabular-nums">${f.count}</span>
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
          ? "bg-indigo-500/15 text-indigo-300 pill-active ring-indigo-400/40"
          : "bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] ring-white/10 hover:ring-white/20";
        return `<button data-status="${f.key}" type="button" aria-pressed="${active}"
          class="booking-status-pill flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ring-inset transition-all duration-200 cursor-pointer ${baseClasses}">
          ${f.label} <span class="opacity-60 tabular-nums">${f.count}</span>
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

  function avatar(talent, sizeClasses) {
    const meta = TYPE_META[talent.type] ?? { avatarBg: "bg-surface-200 text-slate-300", icon: "" };
    return `<div class="${sizeClasses} rounded-full ${meta.avatarBg} flex items-center justify-center flex-shrink-0">${meta.icon}</div>`;
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
        const meta = TYPE_META[talent.type] ?? { label: talent.type, badge: "bg-slate-500/10 text-slate-300" };
        const dispoBadge = talent.availableTonight
          ? `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <span class="relative flex h-1.5 w-1.5"><span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse-soft"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              Oui
            </span>`
          : `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/[0.04] text-slate-500 ring-1 ring-inset ring-white/10">Non</span>`;

        return `<tr tabindex="0" class="group hover:bg-white/[0.04] focus-visible:bg-white/[0.05] cursor-pointer transition-colors duration-150" data-talent-id="${escapeHtml(talent.id)}">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              ${avatar(talent, "w-9 h-9")}
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-100 truncate group-hover:text-white">${escapeHtml(talent.name)}</p>
                <p class="text-xs text-slate-500 truncate">${escapeHtml(talent.city)} · ${escapeHtml(meta.label)}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 hidden md:table-cell">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/[0.04] text-slate-300 ring-1 ring-inset ring-white/10">${escapeHtml(talent.style)}</span>
          </td>
          <td class="px-4 py-3 text-sm text-slate-300 hidden lg:table-cell">${escapeHtml(talent.city)}</td>
          <td class="px-4 py-3 text-sm text-slate-300 hidden sm:table-cell whitespace-nowrap tabular-nums">${formatEuro(talent.tarif)}</td>
          <td class="px-4 py-3 text-sm whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              ${starRow(talent.note)}
              <span class="text-slate-500 text-xs tabular-nums">${talent.note.toFixed(1)} (${talent.reviewsCount})</span>
            </div>
          </td>
          <td class="px-4 py-3 text-right">${dispoBadge}</td>
        </tr>`;
      })
      .join("");

    el.talentsTbody.querySelectorAll("tr[data-talent-id]").forEach((row) => {
      row.addEventListener("click", () => openDrawer(row.dataset.talentId));
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDrawer(row.dataset.talentId);
        }
      });
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
    el.sosToggle.setAttribute("aria-pressed", String(state.availableTonight));
    el.sosToggle.classList.toggle("bg-gradient-to-br", state.availableTonight);
    el.sosToggle.classList.toggle("from-rose-500", state.availableTonight);
    el.sosToggle.classList.toggle("to-red-600", state.availableTonight);
    el.sosToggle.classList.toggle("text-white", state.availableTonight);
    el.sosToggle.classList.toggle("shadow-glow-rose", state.availableTonight);
    el.sosToggle.classList.toggle("bg-rose-500/10", !state.availableTonight);
    el.sosToggle.classList.toggle("text-rose-300", !state.availableTonight);
    loadTalents();
  });

  // ---------- Drawer ----------
  function openDrawer(talentId) {
    const talent = state.talents.find((item) => item.id === talentId);
    if (!talent) return;

    state.activeTalentId = talentId;
    const meta = TYPE_META[talent.type] ?? { label: talent.type, icon: "", avatarBg: "bg-surface-200 text-slate-200" };

    el.drawerAvatar.className = `w-12 h-12 rounded-full ${meta.avatarBg} text-sm font-display font-semibold flex items-center justify-center flex-shrink-0`;
    el.drawerAvatar.textContent = initials(talent.name);
    el.drawerName.textContent = talent.name;
    el.drawerStyle.textContent = `${meta.label} · ${talent.style}`;
    el.drawerBio.textContent = talent.bio;
    el.drawerCity.textContent = talent.city;
    el.drawerTarif.textContent = talent.tarifLabel;
    el.drawerInstagram.textContent = talent.instagram;
    el.drawerPortfolioLabel.lastChild.textContent = talent.type === "dj" ? " Mixcloud" : " Portfolio";
    el.drawerPortfolioUrl.textContent = talent.portfolioUrl;

    el.drawerBadges.innerHTML = `${typeBadge(talent.type)}
      <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white/[0.05] ring-1 ring-inset ring-white/10 text-slate-300">
        ${starRow(talent.note)} <span class="tabular-nums">${talent.note.toFixed(1)} (${talent.reviewsCount})</span>
      </span>
      ${talent.availableTonight
        ? `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30">Dispo ce soir</span>`
        : `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-slate-500 ring-1 ring-inset ring-white/10">Non dispo ce soir</span>`}`;

    el.drawerPortfolio.innerHTML = talent.portfolio
      .map(
        (item) => `<div class="flex items-center gap-3 bg-white/[0.03] ring-1 ring-inset ring-white/10 rounded-xl p-2.5 hover:bg-white/[0.06] transition-colors duration-150">
          <div class="w-8 h-8 rounded-lg ${meta.avatarBg} flex items-center justify-center flex-shrink-0">${meta.icon}</div>
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
    el.proposeDateInput.focus();
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
        return `<div class="px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150 ${urgent ? "border-l-2 border-rose-500 bg-rose-500/[0.04]" : ""}">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium text-slate-100 truncate">${escapeHtml(booking.talentName)} <span class="text-slate-500">→</span> ${escapeHtml(booking.buyerName)}</p>
          </div>
          <p class="text-xs text-slate-500 mt-1">${escapeHtml(booking.city)} · ${formatDate(booking.eventDate)} · ${escapeHtml(booking.timeSlot)}</p>
          <div class="flex items-center justify-between mt-2">
            ${bookingStatusBadge(booking.status)}
            <span class="text-xs font-semibold text-slate-300 tabular-nums">${formatEuro(booking.budget)}</span>
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
