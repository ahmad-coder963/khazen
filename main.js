const body = document.body;
document.documentElement.classList.add("js");
const langButtons = document.querySelectorAll("[data-lang]");
const setLang = (mode) => {
  body.classList.remove("lang-en", "lang-ar");
  body.classList.add(`lang-${mode}`);
  langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === mode);
  });
  try {
    localStorage.setItem("khazenLang", mode);
  } catch {
    // localStorage may be blocked in some environments (e.g., file://)
  }
};

let savedLang = null;
try {
  savedLang = localStorage.getItem("khazenLang");
} catch {
  savedLang = null;
}
const allowedLangs = ["en", "ar"];
if (allowedLangs.includes(savedLang)) {
  setLang(savedLang);
} else {
  setLang("ar");
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

const revealItems = document.querySelectorAll("[data-animate]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}


const setupServicesShowcase = () => {
  const section = document.querySelector(".services");
  if (!section) return;
  const cards = Array.from(section.querySelectorAll(".service-card"));
  const preview = document.getElementById("servicePreview");
  const previewImg = document.getElementById("servicePreviewImg");
  const previewTitle = document.getElementById("servicePreviewTitle");
  const previewBody = document.getElementById("servicePreviewBody");
  if (!cards.length || !preview || !previewImg || !previewTitle || !previewBody) return;

  const scrollToPreview = () => {
    const header = document.querySelector(".site-header");
    const headerOffset = header ? header.offsetHeight : 0;
    const top = window.scrollY + preview.getBoundingClientRect().top - headerOffset - 16;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    preview.classList.add("is-highlighted");
    window.setTimeout(() => preview.classList.remove("is-highlighted"), 700);
  };

  const activateCard = (card, shouldScroll = false) => {
    cards.forEach((item) => item.classList.toggle("active", item === card));
    const mediaImg = card.querySelector(".card-media img");
    const title = card.querySelector(".card-header h3");
    const detailBlock = card.querySelector(".card-detail .lang-block");

    if (mediaImg) {
      previewImg.src = mediaImg.dataset.previewSrc || mediaImg.getAttribute("src") || "";
      previewImg.alt = mediaImg.getAttribute("alt") || "";
    }
    previewTitle.innerHTML = title ? title.innerHTML : "";
    previewBody.innerHTML = detailBlock ? detailBlock.innerHTML : "";

    if (shouldScroll) window.requestAnimationFrame(scrollToPreview);
  };

  cards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", () => activateCard(card, true));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCard(card, true);
      }
    });
  });

  const activeCard = cards.find((card) => card.classList.contains("active")) || cards[0];
  activateCard(activeCard);
};

setupServicesShowcase();

const setupProductsCarousel = () => {
  const section = document.querySelector(".products");
  if (!section) return;
  const prevBtn = section.querySelector(".products-nav.prev");
  const nextBtn = section.querySelector(".products-nav.next");
  if (!prevBtn || !nextBtn) return;

  const tracks = Array.from(section.querySelectorAll(".products-grid"));
  const getActiveTrack = () =>
    tracks.find((track) => window.getComputedStyle(track).display !== "none") || tracks[0];

  const getStep = (track) => {
    const firstCard = track.querySelector(".product-card");
    if (!firstCard) return track.clientWidth * 0.85;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  const scrollTrack = (dir) => {
    const track = getActiveTrack();
    if (!track) return;
    const isArabic = body.classList.contains("lang-ar");
    const direction = isArabic ? -dir : dir;
    track.scrollBy({ left: direction * getStep(track), behavior: "smooth" });
  };

  prevBtn.addEventListener("click", () => scrollTrack(-1));
  nextBtn.addEventListener("click", () => scrollTrack(1));
};

setupProductsCarousel();

const setupMobileNav = () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
};

setupMobileNav();

const setupAgentMap = () => {
  const map = document.getElementById("arabMap");
  const detail = document.getElementById("agentDetail");
  if (!map || !detail) return;

  let agentData = {};

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalizeWebsite = (website) => {
    const text = String(website || "").trim();
    if (!text) return "";
    return /^https?:\/\//i.test(text) ? text : `https://${text}`;
  };

  const formatFieldValue = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const cleaned = raw
      .replace(/<\/?span[^>]*>/gi, "")
      .replace(/span>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/&nbsp;/gi, " ")
      .replace(/\/>/g, " ")
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    return escapeHtml(cleaned).replace(/\n/g, "<br>");
  };

  const renderAgentFields = (agent) => {
    const rows = [];
    const addRow = (label, value) => {
      const text = formatFieldValue(value);
      if (!text) return;
      rows.push(
        `<div class="agent-row"><span class="agent-label">${escapeHtml(label)}</span><span>${text}</span></div>`
      );
    };

    addRow("العنوان:", agent.Address);
    addRow("الهاتف:", agent.Phone1);
    addRow("الهاتف 2:", agent.Phone2);
    addRow("الهاتف 3:", agent.Phone3);
    addRow("البريد:", agent.Email1);
    addRow("البريد 2:", agent.Email2);
    addRow("البريد 3:", agent.Email3);
    addRow("صندوق بريد:", agent.POBox);
    addRow("فاكس:", agent.Fax);

    const websiteLink = normalizeWebsite(agent.Website);
    if (websiteLink) {
      rows.push(
        `<div class="agent-row"><span class="agent-label">الموقع:</span><a href="${escapeHtml(
          websiteLink
        )}" target="_blank" rel="noopener noreferrer">${escapeHtml(agent.Website)}</a></div>`
      );
    }

    return rows.join("");
  };

  const loadAgentData = async () => {
    try {
      const response = await fetch("assets/data/agents.json");
      if (!response.ok) return;
      agentData = await response.json();
    } catch {
      agentData = {};
    }
  };

  const getTargets = (el) => {
    if (!el) return [];
    if (el.tagName && el.tagName.toLowerCase() === "path") return [el];
    return Array.from(el.querySelectorAll("path"));
  };

  const applyStyle = (el, styles) => {
    getTargets(el).forEach((target) => {
      Object.assign(target.style, styles);
    });
  };

  const countryEls = {};
  const originalStyles = new Map();

  const toFlag = (code) => {
    if (!/^[a-z]{2}$/i.test(code)) return "???";
    return code
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  };

  const renderDetail = (country) => {
    const base = agentData[country] || {};
    const labelEn = base.labelEn || country.toUpperCase();
    const labelAr = base.labelAr || `الدولة: ${country.toUpperCase()}`;
    const agents = Array.isArray(base.agents) ? base.agents : [];
    const flag = toFlag(country);
    detail.dataset.country = country;
    const hasAgents = agents.length > 0;
    const agentsHtml = hasAgents
      ? `<div class="agent-list">
          ${agents
            .map(
              (agent) => `
                <div class="agent-item">
                  <div class="agent-name">${escapeHtml(agent.Name || "")}</div>
                  <div class="agent-meta">${renderAgentFields(agent)}</div>
                </div>
              `
            )
            .join("")}
        </div>`
      : `<div class="agent-empty lang-block">
          <span class="en">No agents are currently available in this country.</span>
          <span class="ar">نعتذر، لا يوجد وكلاء حاليا في هذه الدولة.</span>
          <a class="agent-cta" href="#contact">
            <span class="en">Contact us to join Al-Khazen agents.</span>
            <span class="ar">تواصل معنا للانضمام إلى وكلاء الخازن.</span>
          </a>
        </div>`;

    detail.innerHTML = `
      <div class="detail-head">
        <span class="flag" aria-hidden="true">${flag}</span>
        <div class="detail-title">
          <span class="en">${labelEn}</span>
          <span class="ar">${labelAr}</span>
        </div>
      </div>
      ${agentsHtml}
    `;
  };

  const setActive = (country) => {
    Object.entries(countryEls).forEach(([id, el]) => {
      applyStyle(el, {
        fill: originalStyles.get(id)?.fill || "",
        opacity: originalStyles.get(id)?.opacity || "",
      });
    });
    const activeEl = countryEls[country];
    if (activeEl) {
      applyStyle(activeEl, { fill: "#6fbe9a", opacity: "1" });
    }
    renderDetail(country);
  };

  const arabIds = [
    "ma",
    "dz",
    "tn",
    "ly",
    "eg",
    "sd",
    "eh",
    "mr",
    "dj",
    "so",
    "km",
    "sa",
    "ye",
    "om",
    "ae",
    "qa",
    "bh",
    "kw",
    "iq",
    "sy",
    "lb",
    "jo",
    "ps",
  ];

  const isCountryId = (id) => arabIds.includes(id) || id === "_somaliland";

  const bindInteractive = (svgRoot) => {
    const all = Array.from(svgRoot.querySelectorAll("[id]")).filter(
      (el) => !el.closest("defs") && isCountryId(el.id)
    );

    const fitToArab = () => {
      const boxes = all
        .map((el) => el.getBBox())
        .filter((box) => Number.isFinite(box.x));
      if (!boxes.length) return;
      const minX = Math.min(...boxes.map((b) => b.x));
      const minY = Math.min(...boxes.map((b) => b.y));
      const maxX = Math.max(...boxes.map((b) => b.x + b.width));
      const maxY = Math.max(...boxes.map((b) => b.y + b.height));
      const pad = 12;
      svgRoot.setAttribute(
        "viewBox",
        `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
      );
    };

    all.forEach((el) => {
      const id = el.id === "_somaliland" ? "so" : el.id.toLowerCase();
      countryEls[id] = el;
      const target = getTargets(el)[0];
      if (!target) return;
      originalStyles.set(id, {
        fill: target?.style?.fill || target?.getAttribute("fill") || "",
        opacity: target?.style?.opacity || "",
      });
      el.style.cursor = "pointer";
      el.style.transition = "fill 0.2s ease, opacity 0.2s ease";
      el.addEventListener("mouseenter", () => {
        if (detail.dataset.country !== id) {
          applyStyle(el, { fill: "#5bbf9c", opacity: "0.95" });
        }
      });
      el.addEventListener("mouseleave", () => {
        if (detail.dataset.country !== id) {
          applyStyle(el, {
            fill: originalStyles.get(id)?.fill || "",
            opacity: originalStyles.get(id)?.opacity || "",
          });
        }
      });
      el.addEventListener("click", () => setActive(id));
    });

    fitToArab();

    const initial = detail.dataset.country || all[0]?.id?.toLowerCase();
    if (initial) setActive(initial);
  };

  const loadSvg = async () => {
    try {
      await loadAgentData();
      const response = await fetch("assets/arab-world-map.svg");
      if (!response.ok) return;
      const svgText = await response.text();
      map.innerHTML = svgText;
      const svg = map.querySelector("svg");
      if (!svg) return;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      bindInteractive(svg);
    } catch {
      // no-op
    }
  };

  loadSvg();
};

setupAgentMap();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setupAiBackground = () => {
  const canvas = document.getElementById("ai-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let width = 0;
  let height = 0;
  let t = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  window.addEventListener("resize", resize);
  resize();

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    r: Math.random() * 1.2 + 0.4,
  }));

  const nodes = Array.from({ length: 18 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.06,
  }));

  const drawGrid = () => {
    const spacing = 80;
    const offset = (t * 0.4) % spacing;
    ctx.strokeStyle = "rgba(0, 230, 167, 0.08)";
    ctx.lineWidth = 1;
    for (let x = -spacing; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset, height);
      ctx.stroke();
    }
    for (let y = -spacing; y < height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(width, y + offset);
      ctx.stroke();
    }
  };

  const drawCharts = () => {
    ctx.strokeStyle = "rgba(0, 230, 167, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 8; i += 1) {
      const x = (width / 8) * i;
      const y = height * 0.3 + Math.sin(t / 40 + i) * 30;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= 10; i += 1) {
      const x = (width / 10) * i;
      const y = height * 0.65 + Math.cos(t / 50 + i * 0.7) * 22;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(201, 162, 74, 0.18)";
    ctx.beginPath();
    for (let i = 0; i <= 9; i += 1) {
      const x = (width / 9) * i;
      const y = height * 0.45 + Math.sin(t / 60 + i * 0.8) * 18;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const sweepX = (t * 0.6) % width;
    ctx.strokeStyle = "rgba(201, 162, 74, 0.12)";
    ctx.beginPath();
    ctx.moveTo(sweepX, height * 0.12);
    ctx.lineTo(sweepX, height * 0.88);
    ctx.stroke();
  };

  const updateNodes = () => {
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -40) node.x = width + 40;
      if (node.x > width + 40) node.x = -40;
      if (node.y < -40) node.y = height + 40;
      if (node.y > height + 40) node.y = -40;
    });
  };

  const drawNetwork = () => {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          const alpha = 0.18 * (1 - dist / 180);
          ctx.strokeStyle = `rgba(0, 230, 167, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "rgba(0, 230, 167, 0.6)";
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(201, 162, 74, 0.5)";
    nodes.forEach((node, index) => {
      if (index % 5 === 0) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const updateParticles = () => {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    });
  };

  const drawParticles = () => {
    ctx.fillStyle = "rgba(242, 247, 245, 0.18)";
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawCharts();
    updateNodes();
    drawNetwork();
    updateParticles();
    drawParticles();
  };

  const animate = () => {
    t += 1;
    render();
    requestAnimationFrame(animate);
  };

  if (prefersReducedMotion) {
    render();
  } else {
    animate();
  }
};

setupAiBackground();

// Disable ripple injection to prevent button resizing on tap.
