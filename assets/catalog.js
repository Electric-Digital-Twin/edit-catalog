/* EDiT catalog — shared front-end for both language pages.
   Each page sets window.EDIT_LANG ('en'|'sv') and window.EDIT_BASE
   ('' for /index.html, '../' for /sv/index.html).
   Two views: Data (datasets) and Code (projects), switched by tabs. */

(function () {
  var LANG = window.EDIT_LANG || "en";
  var BASE = window.EDIT_BASE || "";

  var STR = {
    en: {
      tagline: "A national, open commons for analysing, monitoring, optimising and controlling " +
               "power grids — data and code, each described by one shared, machine-readable record.",
      partnerLead: "A work package in",
      pills: ["Elflexibel industri", "led by RISE", "hosted at KTH", "funded by Vinnova"],
      tabData: "Data", tabCode: "Code",
      dfilters: { all: "All", house: "House data", linked: "Linked", contributed: "Contributed" },
      pfilters: { all: "All", concept: "Concept", experimental: "Experimental", beta: "Beta", stable: "Stable", archived: "Archived" },
      shown: function (n) { return n + " shown"; },
      loading: "Loading…",
      loadErr: "Could not load the index. Run validate.py to generate it, then reload.",
      emptyD: "No datasets yet.", emptyP: "No code projects yet.",
      dmeta: { source: "Source", license: "License", format: "Format", update: "Update", coverage: "Coverage", access: "Access" },
      pmeta: { author: "Author", license: "License", kind: "Kind", maturity: "Maturity", lang: "Languages", repo: "Repository" },
      sourceLink: "source ↗", repoLink: "repo ↗",
      show: "Show record", hide: "Hide record",
      tierLabel: { house: "House data", linked: "Linked", contributed: "Contributed" },
      ready: "playground-ready", linkhint: "link + format hint", example: "example",
      footer: "Catalog source: datasets/*.json and projects/*.json, validated against their schemas " +
              "on every change. Contribute by opening a pull request that adds one record."
    },
    sv: {
      tagline: "En nationell, öppen resurs för analys, övervakning, optimering och styrning av " +
               "elkraftsystem — data och kod, var och en beskriven av en gemensam, maskinläsbar post.",
      partnerLead: "Ett arbetspaket inom",
      pills: ["Elflexibel industri", "leds av RISE", "värd KTH", "finansierat av Vinnova"],
      tabData: "Data", tabCode: "Kod",
      dfilters: { all: "Alla", house: "Egna data", linked: "Länkade", contributed: "Bidragna" },
      pfilters: { all: "Alla", concept: "Koncept", experimental: "Experimentell", beta: "Beta", stable: "Stabil", archived: "Arkiverad" },
      shown: function (n) { return n + " visas"; },
      loading: "Laddar…",
      loadErr: "Kunde inte ladda indexet. Kör validate.py och ladda om.",
      emptyD: "Inga datamängder ännu.", emptyP: "Inga kodprojekt ännu.",
      dmeta: { source: "Källa", license: "Licens", format: "Format", update: "Uppdatering", coverage: "Täckning", access: "Åtkomst" },
      pmeta: { author: "Författare", license: "Licens", kind: "Typ", maturity: "Mognad", lang: "Språk", repo: "Källkod" },
      sourceLink: "källa ↗", repoLink: "kod ↗",
      show: "Visa post", hide: "Dölj post",
      tierLabel: { house: "Egna data", linked: "Länkade", contributed: "Bidragna" },
      ready: "redo för utvecklingsmiljö", linkhint: "länk + formattips", example: "exempel",
      footer: "Katalogkälla: datasets/*.json och projects/*.json, validerade mot sina scheman vid " +
              "varje ändring. Bidra genom att öppna en pull request som lägger till en post."
    }
  };

  var T = STR[LANG];
  var TIER_ICON = { house: "\u25C9", linked: "\u2197", contributed: "\u2191" };
  var KIND_ICON = { application: "\u25A0", prototype: "\u25C8", library: "\u25A4",
                    thesis: "\u25C9", teaching: "\u25CB", model: "\u25C9", tool: "\u25BC" };

  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function jsonHtml(o){return esc(JSON.stringify(o,null,2)).replace(/&quot;([^&]+?)&quot;(\s*:)/g,'<span class="key">&quot;$1&quot;</span>$2');}
  function fmtVal(v){ if(v===null||v===undefined) return "—"; if(Array.isArray(v)) return v.length?v.join(", "):"—"; return String(v); }
  function exampleOf(t){ return /^\[EXAMPLE\]\s*/i.test(t||""); }
  function stripExample(t){ return (t||"").replace(/^\[EXAMPLE\]\s*/i,""); }

  function applyStatic() {
    document.getElementById("tagline").textContent = T.tagline;
    document.getElementById("partnerLead").textContent = T.partnerLead;
    document.getElementById("pills").innerHTML = T.pills.map(function(p){return '<span class="pill">'+esc(p)+"</span>";}).join("");
    document.getElementById("tab-data").textContent = T.tabData;
    document.getElementById("tab-code").textContent = T.tabCode;
    document.getElementById("siteFooter").textContent = T.footer;
  }

  async function fetchJSON(path){ var r = await fetch(BASE+path,{cache:"no-store"}); if(!r.ok) throw new Error(r.status); return r.json(); }

  async function loadRecords(folder, listKey){
    var manifest = await fetchJSON(folder+"/index.json");
    var out = [];
    var arr = manifest[listKey] || [];
    for(var i=0;i<arr.length;i++){
      try{ out.push(await fetchJSON(folder+"/"+arr[i].file)); }catch(e){}
    }
    return out;
  }

  /* ---- dataset card ---- */
  function datasetCard(d){
    var dist = d.distribution || {};
    var ex = exampleOf(d.title);
    var exBadge = ex ? '<span class="tag example">'+esc(T.example)+"</span>" : "";
    var ready = dist.loader ? '<span class="tag ready">'+esc(T.ready)+"</span>"
                            : '<span class="tag link">'+esc(T.linkhint)+"</span>";
    var endpoint = dist.endpoint ? '<a class="src" href="'+esc(dist.endpoint)+'" target="_blank" rel="noopener">'+esc(T.sourceLink)+"</a>" : "—";
    var rows = [
      [T.dmeta.source,(d.publisher&&d.publisher.name)||"—"],
      [T.dmeta.license,d.license||"—"],
      [T.dmeta.format,dist.format||"—"],
      [T.dmeta.update,d.updateFrequency||"—"],
      [T.dmeta.coverage,d.spatialCoverage||"—"],
      [T.dmeta.access,endpoint]
    ].map(function(kv){var acc=kv[0]===T.dmeta.access;return '<div><span class="k">'+esc(kv[0])+'</span><span class="v">'+(acc?kv[1]:esc(fmtVal(kv[1])))+"</span></div>";}).join("");
    return '<article class="card" data-filter="'+esc(d.tier)+'">'+
      '<div class="card-top"><div class="ico '+esc(d.tier)+'">'+TIER_ICON[d.tier]+"</div>"+
      '<div style="flex:1;min-width:0"><div class="badges"><span class="tag '+esc(d.tier)+'">'+esc(T.tierLabel[d.tier])+"</span>"+exBadge+ready+"</div>"+
      '<h3 class="ctitle">'+esc(stripExample(d.title))+"</h3><p class=\"cdesc\">"+esc(d.description)+"</p></div></div>"+
      '<div class="meta">'+rows+'</div><button class="reveal">'+esc(T.show)+'</button><pre class="rec">'+jsonHtml(d)+"</pre></article>";
  }

  /* ---- project card ---- */
  function projectCard(p){
    var ex = exampleOf(p.title);
    var exBadge = ex ? '<span class="tag example">'+esc(T.example)+"</span>" : "";
    var matBadge = '<span class="tag mat-'+esc(p.maturity)+'">'+esc((T.pfilters[p.maturity]||p.maturity))+"</span>";
    var repo = p.repository ? '<a class="src" href="'+esc(p.repository)+'" target="_blank" rel="noopener">'+esc(T.repoLink)+"</a>" : "—";
    var rows = [
      [T.pmeta.author,(p.publisher&&p.publisher.name)||"—"],
      [T.pmeta.license,p.license||"—"],
      [T.pmeta.kind,p.kind||"—"],
      [T.pmeta.lang,fmtVal(p.languages)],
      [T.pmeta.repo,repo]
    ].map(function(kv){var r=kv[0]===T.pmeta.repo;return '<div><span class="k">'+esc(kv[0])+'</span><span class="v">'+(r?kv[1]:esc(fmtVal(kv[1])))+"</span></div>";}).join("");
    return '<article class="card" data-filter="'+esc(p.maturity)+'">'+
      '<div class="card-top"><div class="ico proj">'+(KIND_ICON[p.kind]||"\u25C8")+"</div>"+
      '<div style="flex:1;min-width:0"><div class="badges">'+matBadge+exBadge+"</div>"+
      '<h3 class="ctitle">'+esc(stripExample(p.title))+"</h3><p class=\"cdesc\">"+esc(p.description)+"</p></div></div>"+
      '<div class="meta">'+rows+'</div><button class="reveal">'+esc(T.show)+'</button><pre class="rec">'+jsonHtml(p)+"</pre></article>";
  }

  function wireReveal(scope){
    scope.querySelectorAll(".reveal").forEach(function(b){
      b.addEventListener("click",function(){
        var pre=b.nextElementSibling, open=pre.style.display==="block";
        pre.style.display=open?"none":"block"; b.textContent=open?T.show:T.hide;
      });
    });
  }

  function buildFilters(containerId, labels){
    var c=document.getElementById(containerId);
    c.innerHTML = Object.keys(labels).map(function(k,i){
      return '<button class="filter" data-f="'+k+'" aria-pressed="'+(i===0?"true":"false")+'">'+esc(labels[k])+' <span class="n" data-c="'+k+'">·</span></button>';
    }).join("") + '<span class="count"></span>';
  }

  function renderView(opts){
    var wrap=document.getElementById(opts.cardsId);
    wrap.innerHTML = opts.records.map(opts.cardFn).join("") || '<p class="state">'+esc(opts.empty)+"</p>";
    wireReveal(wrap);
    var counts={all:opts.records.length};
    Object.keys(opts.labels).forEach(function(k){ if(k!=="all") counts[k]=0; });
    opts.records.forEach(function(r){ var key=r[opts.filterField]; if(counts[key]!==undefined) counts[key]++; });
    var ctrl=document.getElementById(opts.controlsId);
    ctrl.querySelectorAll("[data-c]").forEach(function(s){ s.textContent = counts[s.getAttribute("data-c")]||0; });
    var active="all";
    function apply(){
      var shown=0;
      wrap.querySelectorAll(".card").forEach(function(card){
        var ok=active==="all"||card.dataset.filter===active;
        card.style.display=ok?"":"none"; if(ok) shown++;
      });
      ctrl.querySelector(".count").textContent=T.shown(shown);
    }
    ctrl.addEventListener("click",function(e){
      var b=e.target.closest(".filter"); if(!b) return;
      active=b.dataset.f;
      ctrl.querySelectorAll(".filter").forEach(function(f){ f.setAttribute("aria-pressed",f===b); });
      apply();
    });
    apply();
  }

  function switchTab(which){
    document.getElementById("tab-data").setAttribute("aria-current", which==="data");
    document.getElementById("tab-code").setAttribute("aria-current", which==="code");
    document.getElementById("view-data").style.display = which==="data"?"":"none";
    document.getElementById("view-code").style.display = which==="code"?"":"none";
  }

  async function init(){
    applyStatic();
    buildFilters("controls-data", T.dfilters);
    buildFilters("controls-code", T.pfilters);
    document.getElementById("tab-data").addEventListener("click",function(){switchTab("data");});
    document.getElementById("tab-code").addEventListener("click",function(){switchTab("code");});
    switchTab("data");

    try{
      var datasets = await loadRecords("datasets","datasets");
      renderView({records:datasets, cardFn:datasetCard, cardsId:"cards-data",
        controlsId:"controls-data", labels:T.dfilters, filterField:"tier", empty:T.emptyD});
    }catch(e){ document.getElementById("cards-data").innerHTML='<p class="state">'+esc(T.loadErr)+"</p>"; }

    try{
      var projects = await loadRecords("projects","projects");
      renderView({records:projects, cardFn:projectCard, cardsId:"cards-code",
        controlsId:"controls-code", labels:T.pfilters, filterField:"maturity", empty:T.emptyP});
    }catch(e){ document.getElementById("cards-code").innerHTML='<p class="state">'+esc(T.loadErr)+"</p>"; }
  }

  document.getElementById("cards-data").innerHTML='<p class="state">'+esc(T.loading)+"</p>";
  init();
})();
