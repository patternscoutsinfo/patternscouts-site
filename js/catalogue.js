/* =====================================================================
   The front page.

   One call to ps_catalogue() draws everything: the product cards and the
   combo offers. There is not a single price in the HTML -- if the call
   fails the page says so rather than showing a number that might be
   wrong.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.PSApi;
  var elProducts = document.getElementById("products");
  var elBundles = document.getElementById("bundles");

  function statusBadge(p) {
    if (p.status === "coming_soon") return '<span class="badge badge-soon">Coming soon</span>';
    if (p.status === "beta") return '<span class="badge badge-beta">Beta</span>';
    return "";
  }

  function productCard(p, symbol) {
    var href = window.PSPages.href(p.slug);

    /* No price on the front page. A card here answers "what is this and
       is it for me"; the number belongs on the product's own page, next
       to what you actually get for it. */
    var priceBlock = "";

    var cta = p.sellable
      ? '<a class="btn btn-primary" href="' + href + '">See plans</a>'
      : '<a class="btn btn-ghost" href="' + href + '">What it does</a>';

    return (
      '<article class="card" style="--accent:' + A.escapeHtml(p.accent_colour || "#17624F") + '">' +
        '<div class="icon" aria-hidden="true">' + A.escapeHtml(p.icon || "") + "</div>" +
        "<h3>" + A.escapeHtml(p.name) + " " + statusBadge(p) + "</h3>" +
        '<p class="tagline">' + A.escapeHtml(p.tagline || "") + "</p>" +
        '<p class="one-liner">' + A.escapeHtml(p.one_liner || "") + "</p>" +
        priceBlock +
        cta +
      "</article>"
    );
  }

  function bundleCard(b, symbol) {
    if (!b) return "";
    var price = A.money(b.price, b.currency === "INR" ? symbol : b.currency);
    var list = A.money(b.list_total, b.currency === "INR" ? symbol : b.currency);
    var saving = A.money(b.saving, b.currency === "INR" ? symbol : b.currency);

    var items = (b.items || []).map(function (i) {
      return "<li>" + A.escapeHtml(i.product_name || i.product) + "</li>";
    }).join("");

    // A bundle is only buyable when every product inside it is on sale.
    // While Eagle is still coming soon this renders as an upcoming offer,
    // with no special-casing anywhere in this file.
    var cta = b.sellable
      ? '<a class="btn btn-primary" href="#contact">Get the bundle</a>'
      : '<span class="btn" aria-disabled="true">Available when every product ships</span>';

    return (
      '<div class="combo">' +
        "<div>" +
          "<h3>" + A.escapeHtml(b.name) + "</h3>" +
          "<p>" + A.escapeHtml(b.description || "") + "</p>" +
          "<ul>" + items + "</ul>" +
        "</div>" +
        '<div class="combo-price">' +
          (list && Number(b.saving) > 0 ? '<span class="strike">' + list + "</span>" : "") +
          '<span class="price">' + (price || "—") + "</span>" +
          (saving && Number(b.saving) > 0
            ? '<span class="saving">You save ' + saving +
              (b.discount_pct ? " · " + Math.round(b.discount_pct) + "% off" : "") + "</span>"
            : "<span class='saving'></span>") +
          cta +
        "</div>" +
      "</div>"
    );
  }

  function fail(el, msg) {
    el.innerHTML = '<div class="state error">' + A.escapeHtml(msg) + "</div>";
  }

  A.rpc("ps_catalogue")
    .then(function (data) {
      if (!data) throw new Error("empty catalogue");
      var symbol = data.currency_symbol || "Rs.";

      var products = (data.products || []).filter(function (p) {
        return p.status !== "beta"; // beta products are reachable by link only
      });

      elProducts.innerHTML = products.length
        ? products.map(function (p) { return productCard(p, symbol); }).join("")
        : '<div class="state">Nothing listed yet.</div>';

      var bundles = data.bundles || [];
      elBundles.innerHTML = bundles.length
        ? bundles.map(function (b) { return bundleCard(b, symbol); }).join("")
        : '<div class="state">No combo offers at the moment.</div>';

      if (data.support_email) {
        var link = document.getElementById("support-link");
        link.href = "mailto:" + data.support_email;
        link.textContent = data.support_email;
      }
    })
    .catch(function (e) {
      // Deliberately no fallback prices. A wrong number is worse than none.
      fail(elProducts, "Could not load the catalogue just now. Please refresh, or get in touch and we will send you the details.");
      fail(elBundles, "Offers unavailable.");
      if (window.console) console.error(e);
    });
})();
