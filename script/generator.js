function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanPhone(number) {
  if (!number) return "";
  return number.replace(/\D/g, "");
}

function getThemeClass(style) {
  switch (style) {
    case "dark": return "theme-dark";
    case "bright": return "theme-bright";
    case "scifi": return "theme-scifi";
    case "minimal": return "theme-minimal";
    case "modern":
    default:
      return "theme-modern";
  }
}

function generateDefaultTagline(data) {
  const type = data.businessType || "business";
  const location = data.businessLocation;
  const portfolio = isPortfolio(data);

  if (data.businessTagline) return data.businessTagline;

  if (portfolio) {
    if (location) return `Portfolio of a ${type} based in ${location}`;
    return `Portfolio of a ${type}`;
  }

  if (location) return `Reliable ${type} in ${location}`;
  return `Professional ${type} services`;
}

function generateDescription(data) {
  const name = data.businessName || "Our business";
  const type = data.businessType || "business";
  const location = data.businessLocation;
  const portfolio = isPortfolio(data);

  if (portfolio) {
    let base = `${name} showcases selected projects and work as a ${type}`;
    if (location) base += ` based in ${location}`;
    base += `. Explore recent work, services, and ways to get in touch.`;
    return base;
  }

  let base = `${name} offers quality ${type} services`;
  if (location) base += ` in ${location}`;
  base += `. We focus on great service and happy customers.`;
  return base;
}

function renderContactLines(data) {
  const lines = [];

  if (data.phone) lines.push(`<p>Phone: ${escapeHtml(data.phone)}</p>`);
  if (data.whatsapp) lines.push(`<p>WhatsApp: ${escapeHtml(data.whatsapp)}</p>`);
  if (data.instagram) lines.push(`<p>Instagram: ${escapeHtml(data.instagram)}</p>`);
  if (data.email) lines.push(`<p>Email: ${escapeHtml(data.email)}</p>`);
  if (data.address) lines.push(`<p>Address: ${escapeHtml(data.address)}</p>`);

  if (!lines.length) {
    lines.push(`<p>Please add your contact details here.</p>`);
  }

  return lines.join("");
}

function renderFooter(data) {
  return `
    <div>
      ${renderContactLines(data)}
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(data.businessName || "My Site")}</p>
    </div>
  `;
}

function renderProjectsList(data) {
  if (!data.projects || data.projects.length === 0) {
    return `
      <ul>
        <li>Project 1 – short description of what you built or delivered.</li>
        <li>Project 2 – short description.</li>
        <li>Project 3 – short description.</li>
      </ul>
    `;
  }

  const items = data.projects.map(p => `<li>${escapeHtml(p)}</li>`).join("");
  return `<ul>${items}</ul>`;
}

function renderTestimonialsList(data) {
  if (!data.testimonials || data.testimonials.length === 0) {
    return `<blockquote>"Amazing work, highly recommended!"</blockquote>`;
  }
  return data.testimonials
    .map(t => `<blockquote>${escapeHtml(t)}</blockquote>`)
    .join("");
}

function renderHeroImage(data) {
  // If user chose "later", show a generic placeholder instead of hiding
  if (data.imageMode === "later") {
    return `
      <div class="hero-image-box">
        <div style="padding:40px;text-align:center;">
          Hero image spot – add your own image file later.
        </div>
      </div>
    `;
  }

  // "now" mode
  if (!data.heroImagePath) {
    return `
      <div class="hero-image-box">
        <div style="padding:40px;text-align:center;">
          Add hero image here (set a path like hero.jpg or a URL).
        </div>
      </div>
    `;
  }

  return `
    <div class="hero-image-box">
      <img src="${escapeHtml(data.heroImagePath)}" alt="Hero image">
    </div>
  `;
}

function renderGalleryImages(data) {
  // If user doesn’t want gallery section at all, we should not even call this.
  // But assuming section is present:

  // "later" mode → placeholder tiles
  if (data.imageMode === "later") {
    const placeholders = Array.from({ length: 4 }).map(() => `
      <div class="gallery-item">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#cbd5f5;">
          Your work image
        </div>
      </div>
    `).join("");

    return `
      <div class="gallery-grid">
        ${placeholders}
      </div>
    `;
  }

  // "now" mode
  if (!data.galleryImages || data.galleryImages.length === 0) {
    // show empty slots with hint
    const placeholders = Array.from({ length: 3 }).map(() => `
      <div class="gallery-item">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#cbd5f5;">
          Add image path
        </div>
      </div>
    `).join("");

    return `
      <div class="gallery-grid">
        ${placeholders}
      </div>
    `;
  }

  const items = data.galleryImages.map(path => {
    const src = escapeHtml(path);
    return `
      <div class="gallery-item">
        <img src="${src}" alt="Gallery image">
      </div>
    `;
  }).join("");

  return `
    <div class="gallery-grid">
      ${items}
    </div>
  `;
}

function renderSection(sectionKey, data) {
  switch (sectionKey) {
    case SECTIONS.ABOUT:
      return `
        <section>
          <h2>About</h2>
          <p>${escapeHtml(generateDescription(data))}</p>
        </section>
      `;
    case SECTIONS.PRODUCTS: {
      const portfolio = isPortfolio(data);
      if (portfolio) {
        return `
          <section>
            <h2>Projects</h2>
            <p>Highlight a few key projects, clients, or pieces of work that represent what you do best.</p>
            ${renderProjectsList(data)}
          </section>
        `;
      }
      return `
        <section>
          <h2>Our Products / Services</h2>
          <p>List your main products or services here so customers can see what you offer.</p>
          ${renderProjectsList(data)}
        </section>
      `;
    }
    case SECTIONS.GALLERY:
      return `
        <section>
          <h2>Gallery</h2>
          <p>Add photos of your work, shop, or products here.</p>
          ${renderGalleryImages(data)}
        </section>
      `;
    case SECTIONS.REVIEWS: {
      const portfolio = isPortfolio(data);
      const heading = portfolio ? "Testimonials" : "Customer Reviews";
      return `
        <section>
          <h2>${heading}</h2>
          ${renderTestimonialsList(data)}
        </section>
      `;
    }
    case SECTIONS.CONTACT:
      return `
        <section>
          <h2>Contact</h2>
          ${renderContactLines(data)}
        </section>
      `;
    default:
      return "";
  }
}

function renderPrimaryCta(data) {
  let label = "Contact";
  let href = "#";
  const portfolio = isPortfolio(data);

  if (data.primaryAction === "whatsapp") {
    if (!data.whatsapp) {
      return `<button class="cta-btn" disabled>No WhatsApp number added</button>`;
    }
    const phone = cleanPhone(data.whatsapp);
    if (!phone) {
      return `<button class="cta-btn" disabled>Invalid WhatsApp number</button>`;
    }
    const text = encodeURIComponent(portfolio
      ? "Hi, I saw your portfolio and I'm interested in working with you."
      : "Hi, I'm interested in your services."
    );
    href = `https://wa.me/${phone}?text=${text}`;
    label = portfolio ? "Request a project" : "Message us on WhatsApp";
  } else if (data.primaryAction === "call") {
    if (!data.phone) {
      return `<button class="cta-btn" disabled>No phone number added</button>`;
    }
    const phone = cleanPhone(data.phone);
    if (!phone) {
      return `<button class="cta-btn" disabled>Invalid phone number</button>`;
    }
    href = `tel:${phone}`;
    label = portfolio ? "Call to discuss work" : "Call us";
  } else if (data.primaryAction === "instagram") {
    if (!data.instagram) {
      return `<button class="cta-btn" disabled>No Instagram handle added</button>`;
    }
    const handle = data.instagram.replace("@", "").trim();
    href = `https://instagram.com/${encodeURIComponent(handle)}`;
    label = portfolio ? "DM about a project" : "DM us on Instagram";
  }

  return `<a class="cta-btn" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function generateSiteHtml(data) {
  const themeClass = getThemeClass(data.style);
  const businessName = data.businessName || "My Site";
  const tagline = generateDefaultTagline(data);

  const sectionsHtml = data.sections.map(sectionKey => {
    return renderSection(sectionKey, data);
  }).join("");

  const ctaHtml = renderPrimaryCta(data);
  const heroHtml = renderHeroImage(data);

  return `
    <div class="generated-site ${themeClass}">
      <header>
        <h1>${escapeHtml(businessName)}</h1>
        <p>${escapeHtml(tagline)}</p>
        ${ctaHtml}
      </header>
      <main>
        ${heroHtml}
        ${sectionsHtml}
      </main>
      <footer>
        ${renderFooter(data)}
      </footer>
    </div>
  `;
}

function generateFullHtmlDocument(data) {
  const bodyContent = generateSiteHtml(data);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.businessName || "My Site")}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="exported.css">
</head>
<body>
${bodyContent}
</body>
</html>
`.trim();
}
