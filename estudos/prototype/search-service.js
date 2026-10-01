(function (root) {
  "use strict";

  function flatten(value) {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(flatten).join(" ");
    if (typeof value === "object") return Object.values(value).map(flatten).join(" ");
    return String(value);
  }

  function normalize(value) {
    return flatten(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function search(items, query) {
    const needle = normalize(query);
    if (!needle) return {};
    return items.filter((item) => normalize(item.searchData || item).includes(needle)).reduce((groups, item) => {
      (groups[item.domain] ||= []).push(item);
      return groups;
    }, {});
  }

  const api = { flatten, normalize, search };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SearchService = api;
})(typeof window !== "undefined" ? window : globalThis);
