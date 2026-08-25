(() => {
  "use strict";

  const STATUS_META = {
    new: { label: "Nouveau", dot: "bg-blue-400", badge: "bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/30" },
    contacted: { label: "Contacté", dot: "bg-amber-400", badge: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30" },
    qualified: { label: "Qualifié", dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30" },
    converted: { label: "Converti", dot: "bg-violet-400", badge: "bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/30" },
    lost: { label: "Perdu", dot: "bg-rose-400", badge: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/30" },
  };

  const EVENT_ICON = {
    "lead.created": "✚",
    "lead.enriched": "🔎",
    "lead.scored": "★",
    "email.sent": "✉",
    "lead.qualified": "✔",
    "meeting.scheduled": "📅",
    "lead.status_changed": "↻",
  };

  const state = {
    status: "all",
    query: "",
    leads: [],
    activeLeadId: null,
  };

  const el = {
    statTotal: document.getElementById("stat-total"),
    statQualified: document.getElementById("stat-qualified"),
    statNew: document.getElementById("stat-new"),
    statusFilters: document.getElementById("status-filters"),
    searchInput: document.getElementById("search-input"),
    leadsTbody: document.getElementById("leads-tbody"),
    leadsCount: document.getElementById("leads-count"),
    leadsEmpty: document.getElementById("leads-empty"),
    leadsLoading: document.getElementById("leads-loading"),
    eventsList: document.getElementById("events-list"),
    eventsLoading: document.getElementById("events-loading"),
    eventsCountdown: document.getElementById("events-refresh-countdown"),
    refreshAll: document.getElementById("refresh-all"),
    refreshEvents: document.getElementById("refresh-events"),
    clock: document.getElementById("clock"),
    drawer: document.getElementById("drawer"),
    drawerOverlay: document.getElementById("drawer-overlay"),
    drawerClose: document.getElementById("drawer-close"),
    drawerName: document.getElementById("drawer-name"),
    drawerCompany: document.getElementById("drawer-company"),
    drawerBadges: document.getElementById("drawer-badges"),
    drawerEmail: document.getElementById("drawer-email"),
    drawerPhone: document.getElementById("drawer-phone"),
    drawerSource: document.getElementById("drawer-source"),
    drawerCreated: document.getElementById("drawer-created"),
    drawerJson: document.getElementById("drawer-json"),
    drawerCopy: document.getElementById("drawer-copy"),
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
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatRelativeTime(timestamp) {
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `il y a ${diffHours} h`;
    const diffDays = Math.round(diffHours / 24);
    return `il y a ${diffDays} j`;
  }

  function statusBadge(status) {
    const meta = STATUS_META[status] ?? { label: status, badge: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/30", dot: "bg-slate-400" };
    return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${meta.badge}">
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
      el.statTotal.textContent = data.totalLeads.toLocaleString("fr-FR");
      el.statQualified.textContent = (data.byStatus?.qualified ?? 0).toLocaleString("fr-FR");
      el.statNew.textContent = data.todayLeads.toLocaleString("fr-FR");
      renderStatusFilters(data.byStatus, data.totalLeads);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques", err);
    }
  }

  function renderStatusFilters(byStatus, total) {
    const filters = [
      { key: "all", label: "Tous", count: total },
      ...Object.keys(STATUS_META).map((key) => ({ key, label: STATUS_META[key].label, count: byStatus?.[key] ?? 0 })),
    ];

    el.statusFilters.innerHTML = filters
      .map((f) => {
        const active = state.status === f.key;
        const baseClasses = active
          ? "bg-indigo-500/15 text-indigo-300 pill-active"
          : "bg-surface-100 text-slate-400 hover:text-slate-200 hover:bg-surface-200";
        return `<button data-status="${f.key}" type="button"
          class="status-pill flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-surface-300/60 transition-colors ${baseClasses}">
          ${f.label} <span class="opacity-60">${f.count}</span>
        </button>`;
      })
      .join("");

    el.statusFilters.querySelectorAll(".status-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.status = btn.dataset.status;
        loadLeads();
        renderStatusFilters(byStatus, total);
      });
    });
  }

  // ---------- Leads ----------
  async function loadLeads() {
    el.leadsLoading.classList.remove("hidden");
    el.leadsEmpty.classList.add("hidden");

    try {
      const params = new URLSearchParams();
      if (state.status !== "all") params.set("status", state.status);
      if (state.query) params.set("q", state.query);

      const data = await fetchJson(`/api/leads?${params.toString()}`);
      state.leads = data.leads;
      renderLeads(data.leads);
      el.leadsCount.textContent = data.total.toLocaleString("fr-FR");
    } catch (err) {
      console.error("Erreur lors du chargement des prospects", err);
    } finally {
      el.leadsLoading.classList.add("hidden");
    }
  }

  function renderLeads(leads) {
    if (!leads.length) {
      el.leadsTbody.innerHTML = "";
      el.leadsEmpty.classList.remove("hidden");
      return;
    }

    el.leadsEmpty.classList.add("hidden");
    el.leadsTbody.innerHTML = leads
      .map((lead) => {
        const scoreColor = lead.score >= 75 ? "text-emerald-400" : lead.score >= 45 ? "text-amber-400" : "text-slate-400";
        return `<tr class="hover:bg-surface-100/60 cursor-pointer transition-colors" data-lead-id="${escapeHtml(lead.id)}">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-surface-200 text-slate-300 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                ${escapeHtml(initials(lead.name))}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-100 truncate">${escapeHtml(lead.name)}</p>
                <p class="text-xs text-slate-500 truncate">${escapeHtml(lead.email)}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-slate-300 hidden md:table-cell">${escapeHtml(lead.company)}</td>
          <td class="px-4 py-3">${statusBadge(lead.status)}</td>
          <td class="px-4 py-3 text-sm font-semibold hidden sm:table-cell ${scoreColor}">${lead.score}</td>
          <td class="px-4 py-3 text-sm text-slate-400 hidden lg:table-cell capitalize">${escapeHtml(lead.source)}</td>
          <td class="px-4 py-3 text-sm text-slate-500 text-right whitespace-nowrap">${formatDate(lead.createdAt)}</td>
        </tr>`;
      })
      .join("");

    el.leadsTbody.querySelectorAll("tr[data-lead-id]").forEach((row) => {
      row.addEventListener("click", () => openDrawer(row.dataset.leadId));
    });
  }

  let searchDebounce;
  el.searchInput.addEventListener("input", (e) => {
    state.query = e.target.value.trim();
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadLeads, 300);
  });

  // ---------- Drawer ----------
  function openDrawer(leadId) {
    const lead = state.leads.find((item) => item.id === leadId);
    if (!lead) return;

    state.activeLeadId = leadId;
    el.drawerName.textContent = lead.name;
    el.drawerCompany.textContent = lead.company;
    el.drawerEmail.textContent = lead.email;
    el.drawerPhone.textContent = lead.phone;
    el.drawerSource.textContent = lead.source;
    el.drawerCreated.textContent = formatDate(lead.createdAt);
    el.drawerBadges.innerHTML = `${statusBadge(lead.status)}
      <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-surface-200 text-slate-300">Score IA · ${lead.score}</span>`;
    el.drawerJson.textContent = JSON.stringify(lead.metadata, null, 2);

    el.drawer.classList.remove("translate-x-full");
    el.drawerOverlay.classList.remove("hidden");
  }

  function closeDrawer() {
    el.drawer.classList.add("translate-x-full");
    el.drawerOverlay.classList.add("hidden");
    state.activeLeadId = null;
  }

  el.drawerClose.addEventListener("click", closeDrawer);
  el.drawerOverlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  el.drawerCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(el.drawerJson.textContent);
      el.drawerCopy.textContent = "Copié !";
      setTimeout(() => (el.drawerCopy.textContent = "Copier"), 1500);
    } catch {
      // Clipboard API unavailable, fail silently.
    }
  });

  // ---------- Events feed ----------
  async function loadEvents() {
    try {
      const data = await fetchJson("/api/events");
      renderEvents(data.events);
    } catch (err) {
      console.error("Erreur lors du chargement du flux d'activité", err);
    } finally {
      el.eventsLoading.classList.add("hidden");
    }
  }

  function renderEvents(events) {
    if (!events.length) {
      el.eventsList.innerHTML = `<p class="text-sm text-slate-500 text-center py-10">Aucun événement récent.</p>`;
      return;
    }

    el.eventsList.innerHTML = events
      .map((event) => {
        const icon = EVENT_ICON[event.type] ?? "•";
        return `<div class="px-4 py-3 flex items-start gap-3 hover:bg-surface-100/50 transition-colors">
          <div class="w-7 h-7 rounded-full bg-surface-200 text-indigo-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">${icon}</div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-slate-200 leading-snug">${escapeHtml(event.message)}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[11px] text-slate-500">${formatRelativeTime(event.createdAt)}</span>
              <span class="text-[11px] text-slate-600">·</span>
              <span class="text-[11px] text-slate-500 font-mono">${escapeHtml(event.payload?.agent ?? "agent")}</span>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  // ---------- Auto-refresh + clock ----------
  const EVENTS_REFRESH_INTERVAL = 15;
  let countdown = EVENTS_REFRESH_INTERVAL;

  function tickCountdown() {
    countdown -= 1;
    if (countdown <= 0) {
      loadEvents();
      countdown = EVENTS_REFRESH_INTERVAL;
    }
    el.eventsCountdown.textContent = `${countdown}s`;
  }

  function updateClock() {
    el.clock.textContent = new Date().toLocaleTimeString("fr-FR");
  }

  el.refreshAll.addEventListener("click", () => {
    loadStats();
    loadLeads();
    loadEvents();
    countdown = EVENTS_REFRESH_INTERVAL;
  });

  el.refreshEvents.addEventListener("click", () => {
    loadEvents();
    countdown = EVENTS_REFRESH_INTERVAL;
  });

  function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(tickCountdown, 1000);

    loadStats();
    loadLeads();
    loadEvents();
  }

  init();
})();
