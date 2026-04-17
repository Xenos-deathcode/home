export const SECTIONS = {
  ABOUT: "about",
  PRODUCTS: "products",
  GALLERY: "gallery",
  REVIEWS: "reviews",
  CONTACT: "contact"
};

export const TOTAL_STEPS = 5;
export const STORAGE_KEY = "smart_builder_answers_v2";

export function isPortfolio(data) {
  return data.templateType === "portfolio";
}

export function createDefaultAnswers() {
  return {
    businessName: "",
    businessType: "",
    businessLocation: "",
    businessTagline: "",
    style: "modern",
    sections: [],
    phone: "",
    whatsapp: "",
    instagram: "",
    email: "",
    address: "",
    primaryAction: "whatsapp",
    templateType: "generic",
    projects: [],
    testimonials: [],
    imageMode: "later",
    heroImagePath: "",
    galleryImages: []
  };
}

export const answers = createDefaultAnswers();

export function resetAnswers() {
  Object.assign(answers, createDefaultAnswers());
}

// paywall state in localStorage (still front-end only, but persists)
