(function () {
  const root = globalThis.UNC_DEANS_LIST_RADAR || {};
  const data = globalThis.UNC_DEANS_LIST_RADAR_DATA || [];
  const normalizeName = root.normalizeName;
  const shouldShowBadgeForRole = root.shouldShowBadgeForRole;

  if (!normalizeName || !shouldShowBadgeForRole || !Array.isArray(data)) {
    return;
  }

  const badgeClass = "unc-dlr-chip";
  const lookup = new Map();

  for (const row of data) {
    const key = normalizeName(row.name);
    if (!key) {
      continue;
    }
    if (!lookup.has(key)) {
      lookup.set(key, []);
    }
    lookup.get(key).push(row);
  }

  function isPeopleRosterPage() {
    return (
      /^\/courses\/\d+\/users\/?$/.test(location.pathname) &&
      document.querySelector("table.roster") &&
      document.querySelector('[data-view="users"]')
    );
  }

  function statusFor(name) {
    return lookup.has(normalizeName(name));
  }

  function badgeText(listed) {
    return listed ? "Dean's List" : "Not listed";
  }

  function roleForRow(row) {
    const cells = Array.from(row.querySelectorAll(":scope > td"));
    const headers = Array.from(
      row.closest("table")?.querySelectorAll("thead th") || []
    );
    const roleIndex = headers.findIndex(
      (header) => normalizeName(header.textContent) === "role"
    );

    if (roleIndex >= 0 && cells[roleIndex]) {
      return cells[roleIndex].textContent.trim();
    }

    return "";
  }

  function updateBadge(anchor) {
    const row = anchor.closest("tr.rosterUser");
    const cell = anchor.closest("td");
    const name = anchor.textContent.trim();

    if (!row || !cell || !name) {
      return;
    }

    const badges = Array.from(cell.querySelectorAll(`.${badgeClass}`));

    if (!shouldShowBadgeForRole(roleForRow(row))) {
      for (const existing of badges) {
        existing.remove();
      }
      return;
    }

    const badge = badges.shift() || document.createElement("span");

    for (const extra of badges) {
      extra.remove();
    }

    const listed = statusFor(name);
    badge.className = `${badgeClass} ${
      listed ? "unc-dlr-chip--listed" : "unc-dlr-chip--missing"
    }`;
    badge.textContent = badgeText(listed);
    badge.title = listed
      ? "listed in the spring 2026 unc dean's list"
      : "not found in the spring 2026 unc dean's list";
    badge.setAttribute("aria-label", badge.title);

    if (!badge.parentNode || badge.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", badge);
    }
  }

  function renderBadges() {
    if (!isPeopleRosterPage()) {
      return;
    }

    for (const anchor of document.querySelectorAll(
      "tr.rosterUser a.roster_user_name"
    )) {
      updateBadge(anchor);
    }
  }

  let queued = false;

  function scheduleRender() {
    if (queued) {
      return;
    }

    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      renderBadges();
    });
  }

  const observer = new MutationObserver((mutations) => {
    const relevant = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          !node.classList.contains(badgeClass)
      )
    );

    if (relevant) {
      scheduleRender();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBadges, { once: true });
  } else {
    renderBadges();
  }
})();
