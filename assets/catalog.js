/* EDiT catalog — shared front-end logic for both language pages.
   Each page sets window.EDIT_LANG ('en' or 'sv') and window.EDIT_BASE
   (path back to repo root: '' for /index.html, '../' for /sv/index.html). */

(function () {
  var LANG = window.EDIT_LANG || "en";
  var BASE = window.EDIT_BASE || "";

  var STR = {
    en: {
      tagline: "A national, open data commons for analysing, monitoring, optimising and " +
               "controlling power grids. Every dataset — hosted, linked, or contributed — is " +
               "described by one shared, machine-readable record.",
      partnerLead: "A work package in",
      pills: ["Elflexibel industri", "led by RISE", "hosted at KTH", "funded by Vinnova"],
      demoNote: "Demonstrator — dataset endpoints shown here are illustrative and not yet live.",
      filters: { all: "All", house: "House data", linked: "Linked", contributed: "Contributed" },
      shown: function (n) { return n + " shown"; },
      loading: "Loading catalog…",
      loadErr: "Could not load the catalog index. Run validate.py to generate it, then reload.",
      empty: "No datasets yet.",
      meta: { source: "Source", license: "License", format: "Format", update: "Update",
              coverage: "Coverage", access: "Access" },
      sourceLink: "source ↗",
      show: "Show record", hide: "Hide record",
      tierLabel: { house: "House data", linked: "Linked", contributed: "Contributed" },
      ready: "playground-ready", linkhint: "link + format hint",
      footer: "Catalog source: datasets/*.json, validated against schema/dataset.schema.json " +
              "on every change. Contribute by opening a pull request that adds one record."
    },
    sv: {
      tagline: "En nationell, öppen datakälla för analys, övervakning, optimering och styrning " +
               "av elkraftsystem. Varje datamängd — egen, länkad eller bidragen — beskrivs av en " +
               "gemensam, maskinläsbar post.",
      partnerLead: "Ett arbetspaket inom",
      pills: ["Elflexibel industri", "leds av RISE", "värd KTH", "finansierat av Vinnova"],
      demoNote: "Demonstrator — datamängdernas adresser här är illustrativa och ännu inte i drift.",
      filters: { all: "Alla", house: "Egna data", linked: "Länkade", contributed: "Bidragna" },
      shown: function (n) { return n + " visas"; },
      loading: "Laddar katalog…",
      loadErr: "Kunde inte ladda katalogindexet. Kör validate.py för att generera det och ladda om.",
      empty: "Inga datamängder ännu.",
      meta: { source: "Källa", license: "Licens", format: "Format", update: "Uppdatering",
              coverage: "Täckning", access: "Åtkomst" },
      sourceLink: "källa ↗",
      show: "Visa post", hide: "Dölj post",
      tierLabel: { house: "Egna data", linked: "Länkade", contributed: "Bidragna" },
      ready: "redo för utvecklingsmiljö", linkhint: "länk + formattips",
      footer: "Katalogkälla: datasets/*.json, validerad mot schema/dataset.schema.json vid varje " +
              "ändring. Bidra genom att öppna en pull request som lägger till en post."
    }
  };

  var T = STR[LANG];
  var TIER_ICON = { house: "\u25C9", linked: "\u2197", contributed: "\u2191" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function jsonHtml(o) {
    return esc(JSON.stringify(o, null, 2))
      .replace(/&quot;([^&]+?)&quot;(\s*:)/g, '<span class="key">&quot;$1&quot;</span>$2');
  }
  function fmtVal(v) {
    if (v === null || v === undefined) return "—";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  }

  // Fill static text from the string table
  function applyStatic() {
    document.getElementById("tagline").textContent = T.tagline;
    document.getElementById("partnerLead").textContent = T.partnerLead;
    var pills = document.getElementById("pills");
    pills.innerHTML = T.pills.map(function (p) {
      return '<span class="pill">' + esc(p) + "</span>";
    }).join("");
    document.getElementById("demoNote").textContent = T.demoNote;
    var c = document.getElementById("controls");
    ["all", "house", "linked", "contributed"].forEach(function (f) {
      c.querySelector('[data-f="' + f + '"]').childNodes[0].nodeValue = T.filters[f] + " ";
    });
    document.getElementById("siteFooter").textContent = T.footer;
  }

  async function load() {
    var manifest;
    try {
      var r = await fetch(BASE + "datasets/index.json", { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      manifest = await r.json();
    } catch (e) {
      document.getElementById("cards").innerHTML = '<p class="state">' + esc(T.loadErr) + "</p>";
      return;
    }
    var records = [];
    for (var i = 0; i < manifest.datasets.length; i++) {
      try {
        var rr = await fetch(BASE + "datasets/" + manifest.datasets[i].file, { cache: "no-store" });
        records.push(await rr.json());
      } catch (e) { /* skip */ }
    }
    render(records);
  }

  function card(d) {
    var tier = d.tier, dist = d.distribution || {};
    var ready = dist.loader
      ? '<span class="tag ready">' + esc(T.ready) + "</span>"
      : '<span class="tag link">' + esc(T.linkhint) + "</span>";
    var endpoint = dist.endpoint
      ? '<a class="src" href="' + esc(dist.endpoint) + '" target="_blank" rel="noopener">' +
        esc(T.sourceLink) + "</a>"
      : "—";
    var rows = [
      [T.meta.source, (d.publisher && d.publisher.name) || "—"],
      [T.meta.license, d.license || "—"],
      [T.meta.format, dist.format || "—"],
      [T.meta.update, d.updateFrequency || "—"],
      [T.meta.coverage, d.spatialCoverage || "—"],
      [T.meta.access, endpoint]
    ].map(function (kv) {
      var isAccess = kv[0] === T.meta.access;
      return '<div><span class="k">' + esc(kv[0]) + '</span><span class="v">' +
        (isAccess ? kv[1] : esc(fmtVal(kv[1]))) + "</span></div>";
    }).join("");

    return '<article class="card" data-tier="' + esc(tier) + '">' +
      '<div class="card-top">' +
        '<div class="ico ' + esc(tier) + '">' + TIER_ICON[tier] + "</div>" +
        '<div style="flex:1;min-width:0">' +
          '<div class="badges"><span class="tag ' + esc(tier) + '">' +
            esc(T.tierLabel[tier]) + "</span>" + ready + "</div>" +
          '<h3 class="ctitle">' + esc(d.title) + "</h3>" +
          '<p class="cdesc">' + esc(d.description) + "</p>" +
        "</div>" +
      "</div>" +
      '<div class="meta">' + rows + "</div>" +
      '<button class="reveal">' + esc(T.show) + "</button>" +
      '<pre class="rec">' + jsonHtml(d) + "</pre>" +
    "</article>";
  }

  function render(records) {
    var counts = { all: records.length, house: 0, linked: 0, contributed: 0 };
    records.forEach(function (d) { counts[d.tier]++; });
    for (var k in counts) {
      var el = document.getElementById("n-" + k);
      if (el) el.textContent = counts[k];
    }
    document.getElementById("cards").innerHTML =
      records.map(card).join("") || '<p class="state">' + esc(T.empty) + "</p>";

    document.querySelectorAll(".reveal").forEach(function (b) {
      b.addEventListener("click", function () {
        var pre = b.nextElementSibling, open = pre.style.display === "block";
        pre.style.display = open ? "none" : "block";
        b.textContent = open ? T.show : T.hide;
      });
    });

    var active = "all";
    function apply() {
      var shown = 0;
      document.querySelectorAll(".card").forEach(function (c) {
        var ok = active === "all" || c.dataset.tier === active;
        c.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      document.getElementById("shown").textContent = T.shown(shown);
    }
    document.getElementById("controls").addEventListener("click", function (e) {
      var b = e.target.closest(".filter");
      if (!b) return;
      active = b.dataset.f;
      document.querySelectorAll(".filter").forEach(function (f) {
        f.setAttribute("aria-pressed", f === b);
      });
      apply();
    });
    apply();
  }

  document.getElementById("cards").innerHTML = '<p class="state">' + esc(T.loading) + "</p>";
  applyStatic();
  load();
})();
