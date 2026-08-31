/* =====================================================================
   One product's page.

   Reads ?p=slug, calls ps_product(), and renders what that software is
   built for followed by its own prices. Same rule as the front page:
   every number comes from the database, and if it cannot be fetched the
   page says so instead of guessing.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.PSApi;

  var slug = new URLSearchParams(window.location.search).get("p");

  var elHead = document.getElementById("head");
  var elWhat = document.getElementById("what");
  var elAbout = document.getElementById("about");
  var elPlans = document.getElementById("plans");
  var elAlso = document.getElementById("also");
  var secAbout = document.getElementById("about-section");
  var secPlans = document.getElementById("plans-section");

  function fail(msg) {
    elHead.innerHTML = '<div class="state error">' + A.escapeHtml(msg) + "</div>";
  }

  if (!slug) {
    fail("No software chosen. Go back and pick one.");
    return;
  }

  function planCard(plan, symbol, sellable, accent) {
    var price = A.money(plan.price, symbol);
    var strike = A.money(plan.strike_price, symbol);

    var features = "";
    if (Array.isArray(plan.features) && plan.features.length) {
      features = "<ul style='margin:0 0 16px;padding-left:18px;color:var(--ink-soft);font-size:.92rem'>" +
        plan.features.map(function (f) { return "<li>" + A.escapeHtml(f) + "</li>"; }).join("") +
        "</ul>";
    }

    var cta = sellable
      ? '<a class="btn btn-primary" href="index.html#contact">Request a key</a>'
      : '<span class="btn" aria-disabled="true">Not on sale yet</span>';

    return (
      '<article class="card plan-card" style="--accent:' + A.escapeHtml(accent) + '">' +
        '<p class="plan-name">' + A.escapeHtml(plan.name) + "</p>" +
        '<div class="price-row">' +
          '<span class="price">' + (price || "—") + "</span>" +
          (strike ? '<span class="strike">' + strike + "</span>" : "") +
        "</div>" +
        '<p class="price-note">for ' + A.escapeHtml(A.planPeriod(plan.days)) +
          (plan.seat_limit > 1 ? " · " + plan.seat_limit + " machines" : "") + "</p>" +
        (plan.blurb ? '<p class="blurb">' + A.escapeHtml(plan.blurb) + "</p>" : '<p class="blurb"></p>') +
        features +
        cta +
      "</article>"
    );
  }

  function bundleNote(b, symbol) {
    var price = A.money(b.price, symbol);
    var list = A.money(b.list_total, symbol);
    var saving = A.money(b.saving, symbol);
    if (!price) return "";
    return (
      '<div class="combo" style="margin-top:22px">' +
        "<div>" +
          "<h3>" + A.escapeHtml(b.name) + "</h3>" +
          "<p>" + A.escapeHtml(b.description || "") + "</p>" +
        "</div>" +
        '<div class="combo-price">' +
          (Number(b.saving) > 0 && list ? '<span class="strike">' + list + "</span>" : "") +
          '<span class="price">' + price + "</span>" +
          (Number(b.saving) > 0 && saving
            ? '<span class="saving">You save ' + saving + "</span>" : "<span class='saving'></span>") +
          '<a class="btn btn-primary" href="index.html#combo">See the combo</a>' +
        "</div>" +
      "</div>"
    );
  }

  A.rpc("ps_product", { p_slug: slug })
    .then(function (p) {
      if (!p) {
        fail("We could not find that software. It may have been renamed.");
        return;
      }

      document.title = p.name + " — PatternScouts";
      document.documentElement.style.setProperty("--accent", p.accent_colour || "#17624F");
      var symbol = p.currency_symbol || "Rs.";
      var accent = p.accent_colour || "#17624F";

      var badge = p.status === "coming_soon"
        ? ' <span class="badge badge-soon">Coming soon</span>'
        : p.status === "beta" ? ' <span class="badge badge-beta">Beta</span>' : "";

      elHead.innerHTML =
        '<p class="eyebrow">' + A.escapeHtml(p.icon || "") + " PatternScouts</p>" +
        "<h1>" + A.escapeHtml(p.name) + badge + "</h1>" +
        '<p class="lede">' + A.escapeHtml(p.tagline || p.one_liner || "") + "</p>";

      if (p.what_it_is_for) {
        elWhat.innerHTML =
          '<div class="what"><h2>What it is built for</h2><p>' +
          A.escapeHtml(p.what_it_is_for) + "</p></div>";
      }
      elAbout.innerHTML = A.paragraphs(p.long_description);
      secAbout.hidden = false;

      var plans = p.plans || [];
      if (plans.length) {
        elPlans.innerHTML = plans.map(function (pl) {
          return planCard(pl, symbol, p.sellable, accent);
        }).join("");
        document.getElementById("plans-sub").textContent = p.sellable
          ? "Pick the one that suits you. Payment by UPI; the key arrives by email."
          : "These are the plans it will launch with.";
        secPlans.hidden = false;
      } else if (p.status !== "coming_soon") {
        elPlans.innerHTML = '<div class="state">Prices are being updated. Please get in touch.</div>';
        secPlans.hidden = false;
      }

      var bundles = (p.bundles || []).filter(Boolean);
      if (bundles.length) {
        elAlso.innerHTML = bundles.map(function (b) { return bundleNote(b, symbol); }).join("");
        secPlans.hidden = false;
      }

      if (p.support_email) {
        var link = document.getElementById("support-link");
        link.href = "mailto:" + p.support_email;
        link.textContent = p.support_email;
      }
    })
    .catch(function (e) {
      fail("Could not load this page just now. Please refresh, or get in touch.");
      if (window.console) console.error(e);
    });
})();
