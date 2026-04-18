const SECTIONS = {
  ABOUT: "about",
  PRODUCTS: "products",
  GALLERY: "gallery",
  REVIEWS: "reviews",
  CONTACT: "contact"
};

const TOTAL_STEPS = 5;
const STORAGE_KEY = "smart_builder_answers_v2";

function isPortfolio(data) {
  return data.templateType === "portfolio";
}

function createDefaultAnswers() {
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

const answers = createDefaultAnswers();

function resetAnswers() {
  Object.assign(answers, createDefaultAnswers());
}

// paywall state in localStorage (still front-end only, but persists)
