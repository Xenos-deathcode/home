import { TOTAL_STEPS, SECTIONS, answers } from "./state.js";
import { generateSiteHtml } from "./generator.js";

export const startPage = document.getElementById("start-page");
export const formPage = document.getElementById("form-page");
export const resultPage = document.getElementById("result-page");
export const authPage = document.getElementById("auth-page");
export const dashboardPage = document.getElementById("dashboard-page");
export const developerPage = document.getElementById("developer-page");
export const marketplacePage = document.getElementById("marketplace-page");

export const templateCards = document.querySelectorAll(".template-card");

export const startBtn = document.getElementById("start-btn");
export const previewContainer = document.getElementById("preview-container");
export const livePreview = document.getElementById("live-preview");

export const downloadBtn = document.getElementById("download-btn");
export const editBtn = document.getElementById("edit-btn");
export const contactBtn = document.getElementById("contact-creator-btn");
export const downloadStatus = document.getElementById("download-status");
export const successMessage = document.getElementById("success-message");

export const upgradeModal = document.getElementById("upgrade-modal");
export const closeUpgradeBtn = document.getElementById("close-upgrade-btn");

export const contactModal = document.getElementById("contact-modal");
export const closeModalBtn = document.getElementById("close-modal-btn");

export const steps = document.querySelectorAll(".step");
export const next1 = document.getElementById("next-1");
export const next2 = document.getElementById("next-2");
export const next3 = document.getElementById("next-3");
export const next4 = document.getElementById("next-4");
export const generateBtn = document.getElementById("generate-btn");
export const exampleBtn = document.getElementById("example-btn");

export const businessNameInput = document.getElementById("businessName");
export const businessTypeInput = document.getElementById("businessType");
export const businessLocationInput = document.getElementById("businessLocation");
export const businessTaglineInput = document.getElementById("businessTagline");

export const businessNameError = document.getElementById("businessName-error");
export const sectionsError = document.getElementById("sections-error");

export const sectionCheckboxes = document.querySelectorAll(".section-checkbox");

export const phoneInput = document.getElementById("phone");
export const whatsappInput = document.getElementById("whatsapp");
export const instagramInput = document.getElementById("instagram");
export const emailInput = document.getElementById("email");
export const addressInput = document.getElementById("address");

export const heroImagePathInput = document.getElementById("heroImagePath");
export const galleryImagesInput = document.getElementById("galleryImagesInput");
export const imageModeLaterRadio = document.getElementById("imageModeLater");
export const imageModeNowRadio = document.getElementById("imageModeNow");
export const imageFields = document.getElementById("image-fields");

export const stepProgressBar = document.getElementById("step-progress-bar");
export const stepLabel = document.getElementById("step-label");
export const templateTypeSelect = document.getElementById("templateType");
export const saveStatusEl = document.getElementById("save-status");

export const fullServiceBtn = document.getElementById("full-service-btn");
export const upgradeBtn = document.getElementById("upgrade-btn");
export const hostingBoxLink = document.getElementById("hosting-link");

let previewTimeout;

// helpers

export function showStep(stepNumber) {
  steps.forEach(step => {
    step.classList.toggle("active", step.dataset.step === String(stepNumber));
  });
  updateStepProgress(stepNumber);
}

export function showPage(pageId) {
  [authPage, dashboardPage, developerPage, marketplacePage, startPage, formPage, resultPage].forEach(p => {
    if (p) p.classList.remove("active");
  });
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");
}

export function updateStepProgress(step) {
  const percent = (step / TOTAL_STEPS) * 100;
  if (stepProgressBar) stepProgressBar.style.width = `${percent}%`;
  if (stepLabel) stepLabel.textContent = `Step ${step} of ${TOTAL_STEPS}`;
}

// parsing & state sync

function parseLines(str) {
  if (!str) return [];
  return str
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

// ========== PROJECT & TESTIMONIAL RENDERING ==========

export function renderProjectsList() {
  const projectsList = document.getElementById("projectsList");
  if (!projectsList) return;

  if (answers.projects.length === 0) {
    projectsList.innerHTML = '<div class="items-list empty">No projects added yet</div>';
    return;
  }

  const items = answers.projects
    .map((project, idx) => `
      <div class="item">
        <span class="item-text">${escapeHtml(project)}</span>
        <button class="item-delete" data-type="project" data-idx="${idx}">×</button>
      </div>
    `)
    .join("");

  projectsList.innerHTML = `<div class="items-list">${items}</div>`;

  // Add delete handlers
  projectsList.querySelectorAll(".item-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (idx >= 0 && idx < answers.projects.length) {
        answers.projects.splice(idx, 1);
        renderProjectsList();
        updateLivePreviewDebounced();
      }
    });
  });
}

export function renderTestimonialsList() {
  const testimonialsList = document.getElementById("testimonialsList");
  if (!testimonialsList) return;

  if (answers.testimonials.length === 0) {
    testimonialsList.innerHTML = '<div class="items-list empty">No testimonials added yet</div>';
    return;
  }

  const items = answers.testimonials
    .map((testimonial, idx) => `
      <div class="item">
        <span class="item-text">${escapeHtml(testimonial)}</span>
        <button class="item-delete" data-type="testimonial" data-idx="${idx}">×</button>
      </div>
    `)
    .join("");

  testimonialsList.innerHTML = `<div class="items-list">${items}</div>`;

  // Add delete handlers
  testimonialsList.querySelectorAll(".item-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (idx >= 0 && idx < answers.testimonials.length) {
        answers.testimonials.splice(idx, 1);
        renderTestimonialsList();
        updateLivePreviewDebounced();
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function updateAnswersFromInputs() {
  answers.businessName = businessNameInput.value.trim();
  answers.businessType = businessTypeInput.value.trim();
  answers.businessLocation = businessLocationInput.value.trim();
  answers.businessTagline = businessTaglineInput.value.trim();

  const styleRadio = document.querySelector("input[name='style']:checked");
  answers.style = styleRadio ? styleRadio.value : "modern";

  answers.sections = Array.from(sectionCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  answers.phone = phoneInput.value.trim();
  answers.whatsapp = whatsappInput.value.trim();
  answers.instagram = instagramInput.value.trim();
  answers.email = emailInput.value.trim();
  answers.address = addressInput.value.trim();

  const actionRadio = document.querySelector("input[name='primaryAction']:checked");
  answers.primaryAction = actionRadio ? actionRadio.value : "whatsapp";

  answers.templateType = templateTypeSelect ? templateTypeSelect.value : "generic";

  // projects and testimonials are already in answers object (no need to parse from textarea)

  const imageModeRadio = document.querySelector("input[name='imageMode']:checked");
  answers.imageMode = imageModeRadio ? imageModeRadio.value : "later";

  answers.heroImagePath = heroImagePathInput.value.trim();
  answers.galleryImages = parseLines(galleryImagesInput.value);
}

export function updateInputsFromAnswers() {
  businessNameInput.value = answers.businessName;
  businessTypeInput.value = answers.businessType;
  businessLocationInput.value = answers.businessLocation;
  businessTaglineInput.value = answers.businessTagline;

  if (templateTypeSelect) templateTypeSelect.value = answers.templateType;

  const styleRadio = document.querySelector(`input[name='style'][value='${answers.style}']`);
  if (styleRadio) {
    styleRadio.checked = true;
    // Apply checked class styling
    document.querySelectorAll(".style-options label").forEach(label => {
      label.classList.remove("checked");
    });
    styleRadio.parentElement.classList.add("checked");
  }

  sectionCheckboxes.forEach(cb => {
    const isChecked = answers.sections.includes(cb.value);
    cb.checked = isChecked;
    // Apply checked class styling
    const label = cb.parentElement;
    if (isChecked) {
      label.classList.add("checked");
    } else {
      label.classList.remove("checked");
    }
  });

  phoneInput.value = answers.phone;
  whatsappInput.value = answers.whatsapp;
  instagramInput.value = answers.instagram;
  emailInput.value = answers.email;
  addressInput.value = answers.address;

  const actionRadio = document.querySelector(`input[name='primaryAction'][value='${answers.primaryAction}']`);
  if (actionRadio) {
    actionRadio.checked = true;
    document.querySelectorAll("input[name='primaryAction']").forEach(input => {
      input.parentElement.classList.toggle("checked", input.checked);
    });
  }

  // Render projects and testimonials from arrays
  renderProjectsList();
  renderTestimonialsList();

  heroImagePathInput.value = answers.heroImagePath;
  galleryImagesInput.value = answers.galleryImages.join("\n");

  if (answers.imageMode === "now") {
    if (imageModeNowRadio) imageModeNowRadio.checked = true;
    imageFields.classList.remove("hidden");
  } else {
    if (imageModeLaterRadio) imageModeLaterRadio.checked = true;
    imageFields.classList.add("hidden");
  }

  document.querySelectorAll("input[name='imageMode']").forEach(input => {
    input.parentElement.classList.toggle("checked", input.checked);
  });
}

export function updateLivePreviewDebounced() {
  clearTimeout(previewTimeout);
  previewTimeout = setTimeout(() => {
    updateAnswersFromInputs();
    const lightHtml = generateSiteHtml(answers);
    livePreview.innerHTML = lightHtml;
  }, 150);
}

// template defaults

export function applyTemplateDefaults() {
  if (!templateTypeSelect) return;
  const template = templateTypeSelect.value;

  if (template === "portfolio") {
    sectionCheckboxes.forEach(cb => cb.checked = false);
    const wanted = [
      SECTIONS.ABOUT,
      SECTIONS.PRODUCTS,
      SECTIONS.GALLERY,
      SECTIONS.REVIEWS,
      SECTIONS.CONTACT
    ];
    wanted.forEach(key => {
      const cb = Array.from(sectionCheckboxes).find(c => c.value === key);
      if (cb) cb.checked = true;
    });
  }
}
