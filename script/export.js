// exported.css content embedded as a string so ZIP works offline
const EXPORTED_CSS = `
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #020617;
  color: #f5f5f5;
}
.generated-site {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 8px;
}
.generated-site header {
  margin-bottom: 24px;
}
.generated-site h1 {
  font-size: 28px;
  margin-bottom: 8px;
}
.generated-site h2 {
  margin-top: 24px;
  margin-bottom: 12px;
}
.generated-site p {
  line-height: 1.5;
}
.generated-site a {
  color: inherit;
}
.theme-modern {
  background: #f9fafb;
  color: #111827;
}
.theme-dark {
  background: #020617;
  color: #e5e7eb;
}
.theme-bright {
  background: #fef9c3;
  color: #111827;
}
.theme-scifi {
  background: radial-gradient(circle at top, #22d3ee, #020617 55%);
  color: #e0f2fe;
}
.theme-minimal {
  background: #ffffff;
  color: #111827;
}
.hero-image-box {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 2px dashed #9ca3af;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
  padding: 30px;
}
.hero-image-box img {
  display: block;
  width: 100%;
  height: auto;
  padding: 0;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 12px;
}
.gallery-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.15);
  border: 1px dashed #9ca3af;
}
.gallery-item img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.generated-site .cta-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
  display: inline-block;
  text-decoration: none;
}
.theme-modern .cta-btn {
  background: #2563eb;
  color: white;
}
.theme-dark .cta-btn {
  background: #22c55e;
  color: #020617;
}
.theme-bright .cta-btn {
  background: #f97316;
  color: #111827;
}
.theme-scifi .cta-btn {
  background: #22c55e;
  color: #020617;
}
.theme-minimal .cta-btn {
  background: #111827;
  color: #f9fafb;
}
`.trim();

function canDownload() {
  const project = getCurrentProject();
  return !!(project && project.paid);
}

async function handleDownload(downloadStatusEl) {
  if (!canDownload()) {
    return { blocked: true };
  }

  try {
    downloadStatusEl.textContent = "Generating files...";
    updateAnswersFromInputs();

    const fullHtml = generateFullHtmlDocument(answers);

    const zip = new JSZip();
    zip.file("index.html", fullHtml);
    zip.file("exported.css", EXPORTED_CSS);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    markCurrentProjectDownloaded();
    downloadStatusEl.textContent = "Downloaded successfully!";
    return { blocked: false };
  } catch (e) {
    console.error(e);
    downloadStatusEl.textContent = "Error generating site.";
    return { blocked: false, error: true };
  }
}
