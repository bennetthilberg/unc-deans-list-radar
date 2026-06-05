(function (root) {
  function normalizeName(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[\u2018\u2019\u201b\u2032`]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const api = { normalizeName };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.UNC_DEANS_LIST_RADAR = Object.assign(
    root.UNC_DEANS_LIST_RADAR || {},
    api
  );
})(typeof globalThis !== "undefined" ? globalThis : this);
