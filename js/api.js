/* =====================================================================
   Talking to Supabase.

   No library, no CDN, no build step -- the same plain fetch the Crow
   site has always used. One function calls an RPC; everything else on
   the site is built on top of it.
   ===================================================================== */

(function (global) {
  "use strict";

  var CFG = global.PS;

  function rpc(name, args) {
    return fetch(CFG.SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CFG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY
      },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error("rpc " + name + " failed: " + r.status + " " + t);
        });
      }
      return r.json();
    });
  }

  /* ---------------------------------------------------------------
     Money formatting.

     Every number shown on this site comes out of the database, so the
     only job here is to render it. If a price is missing we return
     null and the caller shows a fallback -- never a zero, because a
     zero looks like a real price and a blank does not.
     --------------------------------------------------------------- */
  function money(value, symbol) {
    if (value === null || value === undefined || value === "") return null;
    var n = Number(value);
    if (!isFinite(n)) return null;
    var s = n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
    // 1234567 -> 12,34,567  (Indian grouping, since prices are in INR)
    var parts = s.split(".");
    var whole = parts[0];
    var last3 = whole.slice(-3);
    var rest = whole.slice(0, -3);
    if (rest) last3 = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
    return (symbol || "Rs.") + " " + last3 + (parts[1] ? "." + parts[1] : "");
  }

  function planPeriod(days) {
    if (days === null || days === undefined) return "one-time";
    if (days >= 360 && days <= 370) return "a year";
    if (days >= 28 && days <= 31) return "a month";
    return days + " days";
  }

  function escapeHtml(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Turns the blank-line-separated text stored in the database into
     paragraphs, without letting any markup through. */
  function paragraphs(text) {
    if (!text) return "";
    return String(text).split(/\n\s*\n/).map(function (p) {
      return "<p>" + escapeHtml(p.trim()).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  global.PSApi = {
    rpc: rpc,
    money: money,
    planPeriod: planPeriod,
    escapeHtml: escapeHtml,
    paragraphs: paragraphs
  };
})(window);
