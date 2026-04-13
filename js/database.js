(() => {
  let products = [];
  const CATEGORY_LABEL = {
    kanzashi: "Kanzashi", "hair-clip": "Hair Clip", "hair-tie": "Hair Tie",
    comb: "Comb", headband: "Headband", scrunchie: "Scrunchie"
  };
  const MATERIAL_LABEL = {
    lacquerware: "Lacquerware", silk: "Silk", acetate: "Acetate",
    metal: "Metal", wood: "Wood", fabric: "Fabric", resin: "Resin"
  };
  const OCCASION_LABEL = {
    everyday: "Everyday", formal: "Formal", festival: "Festival",
    wedding: "Wedding", kimono: "Kimono"
  };

  const $ = id => document.getElementById(id);

  function populateFilters() {
    const cats = [...new Set(products.map(p => p.category))].sort();
    const mats = [...new Set(products.map(p => p.material))].sort();
    const occs = [...new Set(products.map(p => p.occasion))].sort();

    cats.forEach(c => $("category").innerHTML += `<option value="${c}">${CATEGORY_LABEL[c] || c}</option>`);
    mats.forEach(m => $("material").innerHTML += `<option value="${m}">${MATERIAL_LABEL[m] || m}</option>`);
    occs.forEach(o => $("occasion").innerHTML += `<option value="${o}">${OCCASION_LABEL[o] || o}</option>`);
  }

  function getFiltered() {
    const q = $("search").value.toLowerCase();
    const cat = $("category").value;
    const mat = $("material").value;
    const occ = $("occasion").value;
    const sort = $("sort").value;

    let list = products.filter(p => {
      if (cat && p.category !== cat) return false;
      if (mat && p.material !== mat) return false;
      if (occ && p.occasion !== occ) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !(p.name_ja || "").includes(q)) return false;
      return true;
    });

    if (sort === "price-asc") list.sort((a, b) => a.price_usd - b.price_usd);
    else if (sort === "price-desc") list.sort((a, b) => b.price_usd - a.price_usd);
    else if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function renderCard(p) {
    const prosHtml = (p.pros || []).map(pr => `<li>${pr}</li>`).join("");
    const expertHtml = p.expert_note ? `<div class="expert-note">${p.expert_note}</div>` : "";
    const handmadeBadge = p.handmade ? `<span class="badge badge-handmade">Handmade</span>` : "";
    const nameJa = p.name_ja ? `<div class="name-ja">${p.name_ja}</div>` : "";
    const linkHtml = p.amazon_url ? `<div class="product-link"><a href="${p.amazon_url}" target="_blank" rel="noopener">Search on Amazon</a></div>` : "";

    return `<div class="product-card">
      <div class="brand">${p.brand}</div>
      <h3>${p.name}</h3>
      ${nameJa}
      <div class="badges">
        <span class="badge badge-cat">${CATEGORY_LABEL[p.category] || p.category}</span>
        <span class="badge badge-mat">${MATERIAL_LABEL[p.material] || p.material}</span>
        <span class="badge badge-occ">${OCCASION_LABEL[p.occasion] || p.occasion}</span>
        ${handmadeBadge}
      </div>
      <div class="product-meta">
        <span>Hair: ${p.hair_type}</span>
        <span>Origin: ${p.country === "japan" ? "Japan" : p.country}</span>
      </div>
      <div class="product-price">$${p.price_usd.toFixed(2)}</div>
      <ul class="product-pros">${prosHtml}</ul>
      <div class="product-best"><strong>Best for:</strong> ${p.best_for}</div>
      ${expertHtml}
      ${linkHtml}
    </div>`;
  }

  function render() {
    const list = getFiltered();
    $("resultCount").textContent = `${list.length} product${list.length !== 1 ? "s" : ""} found`;
    $("grid").innerHTML = list.map(renderCard).join("");
  }

  function init() {
    fetch("data/products.json")
      .then(r => r.json())
      .then(data => {
        products = data;
        populateFilters();
        render();
      })
      .catch(err => {
        $("grid").innerHTML = `<p style="padding:24px;color:#78716C">Could not load products. ${err.message}</p>`;
      });

    ["search", "category", "material", "occasion", "sort"].forEach(id => {
      $(id).addEventListener(id === "search" ? "input" : "change", render);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
