import {
  templateCards,
  startBtn, previewContainer,
  downloadBtn, editBtn, contactBtn,
  downloadStatus, successMessage,
  upgradeModal, closeUpgradeBtn,
  contactModal, closeModalBtn,
  next1, next2, next3, next4,
  generateBtn, exampleBtn,
  businessNameInput, businessTypeInput, businessLocationInput, businessTaglineInput,
  businessNameError, sectionsError,
  sectionCheckboxes,
  phoneInput, whatsappInput, instagramInput, emailInput, addressInput,
  heroImagePathInput, galleryImagesInput,
  imageModeLaterRadio, imageModeNowRadio, imageFields,
  templateTypeSelect, saveStatusEl,
  fullServiceBtn, upgradeBtn, hostingBoxLink,
  updateAnswersFromInputs, updateInputsFromAnswers,
  updateLivePreviewDebounced, showPage, showStep,
  applyTemplateDefaults,
  renderProjectsList, renderTestimonialsList
} from "./ui.js";

import { SECTIONS, answers, resetAnswers } from "./state.js";
import { handleDownload, canDownload } from "./export.js";
import {
  copyProjectToUser,
  createProject,
  deleteProject,
  getCurrentProject,
  listProjects,
  loadAnswersFromStorage,
  loadProject,
  saveAnswersDebounced,
  saveCurrentProject,
  updateProject
} from "./storage.js";
import { generateSiteHtml } from "./generator.js";
import {
  clearDeveloperSession,
  findUserByIdAndAccount,
  getCurrentSession,
  getCurrentUser,
  getCurrentUserEmail,
  getCurrentUserId,
  isDeveloperSessionActive,
  isLoggedIn,
  listAllUsers,
  logIn,
  logOut,
  signUp,
  updateUserProfile,
  addToBlacklist,
  removeFromBlacklist,
  banUser,
  unbanUser,
  deleteUser,
  banUserProduct,
  unbanUserProduct,
  verifyCurrentUserPassword,
  verifyDeveloperAccess,
  isCurrentUserPro,
  upgradeToPro,
  upgradeUserToPro,
  removeUserPro
} from "./auth.js";

import { showProfilePage } from "./profile.js";

import {
  createRequest,
  getOpenRequests,
  getAllRequests,
  claimRequest,
  completeRequest,
  createAuction,
  getAllAuctions,
  placeBid,
  endAuction,
  createTradeOffer,
  getMyTrades,
  respondToTrade,
  sendMessage,
  getChatWithUser,
  getMyChats,
  markMessagesRead,
  getProUsers,
  getUserProfile,
  canAccessMarketplace
} from "./marketplace.js";

const authAccountNameInput = document.getElementById("authAccountName");
const authUsernameInput = document.getElementById("authUsername");
const authPasswordInput = document.getElementById("authPassword");
const authError = document.getElementById("auth-error");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const showSignupBtn = document.getElementById("show-signup-btn");
const showLoginBtn = document.getElementById("show-login-btn");
const accountBar = document.getElementById("account-bar");
const accountDisplay = document.getElementById("account-display");
const dashboardBtn = document.getElementById("dashboard-btn");
const profileBtn = document.getElementById("profile-btn");
const logoutBtn = document.getElementById("logout-btn");
const newProjectBtn = document.getElementById("new-project-btn");
const projectsGrid = document.getElementById("projects-grid");
const projectsEmpty = document.getElementById("projects-empty");
const upgradeBadge = document.getElementById("upgrade-badge");
const paywallBox = document.getElementById("paywall-box");
const copyMyIdBtn = document.getElementById("copy-my-id-btn");
const myIdValue = document.getElementById("my-id-value");
const contactMeBtn = document.getElementById("contact-me-btn");
const contactWhatsappBtn = document.getElementById("contact-whatsapp-btn");
const contactEmailBtn = document.getElementById("contact-email-btn");

const marketplaceBtn = document.getElementById("marketplace-btn");
const marketplacePage = document.getElementById("marketplace-page");
const tabButtons = document.querySelectorAll(".marketplace-tabs .tab-btn");
const adminTabButton = document.querySelector('.tab-btn[data-tab="admin"]');
const requestsList = document.getElementById("requests-list");
const tradesList = document.getElementById("trades-list");
const auctionsList = document.getElementById("auctions-list");
const profileForm = document.getElementById("profile-form");
const profileBio = document.getElementById("profile-bio");
const profileGender = document.getElementById("profile-gender");
const profilePicture = document.getElementById("profile-picture");
const blacklistList = document.getElementById("blacklist-list");
const addToBlacklistBtn = document.getElementById("add-to-blacklist-btn");
const chatList = document.getElementById("chat-list");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendMessageBtn = document.getElementById("send-message-btn");
const banUserInput = document.getElementById("ban-user-input");
const banUserBtn = document.getElementById("ban-user-btn");
const banProductInput = document.getElementById("ban-product-input");
const banProductBtn = document.getElementById("ban-product-btn");
const unbanUserInput = document.getElementById("unban-user-input");
const unbanUserBtn = document.getElementById("unban-user-btn");
const unbanProductInput = document.getElementById("unban-product-input");
const unbanProductBtn = document.getElementById("unban-product-btn");
const createRequestBtn = document.getElementById("create-request-btn");
const createTradeBtn = document.getElementById("create-trade-btn");
const createAuctionBtn = document.getElementById("create-auction-btn");
const createRequestModal = document.getElementById("create-request-modal");
const createTradeModal = document.getElementById("create-trade-modal");
const createAuctionModal = document.getElementById("create-auction-modal");
const addBlacklistModal = document.getElementById("add-blacklist-modal");
const createRequestForm = document.getElementById("create-request-form");
const createTradeForm = document.getElementById("create-trade-form");
const createAuctionForm = document.getElementById("create-auction-form");
const addBlacklistForm = document.getElementById("add-blacklist-form");
const blacklistUsernameInput = document.getElementById("blacklist-username");

const developerUsersGrid = document.getElementById("developer-users-grid");
const developerUsersEmpty = document.getElementById("developer-users-empty");
const developerProjectsPanel = document.getElementById("developer-projects-panel");
const developerProjectsTitle = document.getElementById("developer-projects-title");
const developerProjectsGrid = document.getElementById("developer-projects-grid");
const closeDeveloperBtn = document.getElementById("close-developer-btn");

// New fullscreen developer view elements
const developerUsersList = document.getElementById("developer-users-list");
const developerUserDetail = document.getElementById("developer-user-detail");
const developerBackBtn = document.getElementById("developer-back-btn");
const developerProjectsDetailedGrid = document.getElementById("developer-projects-detailed-grid");

const saveAnswers = saveAnswersDebounced(saveStatusEl);
const DEV_SHORTCUT_KEY = "A"; // Ctrl+Shift+A for Admin
let authMode = "signup";

function setButtonCopy() {
  if (upgradeBtn) upgradeBtn.textContent = "Upgrade Project (£5)";
  if (downloadBtn) downloadBtn.textContent = "Download Website (£1)";
  if (contactBtn) contactBtn.textContent = "Contact Me";
  if (fullServiceBtn) fullServiceBtn.textContent = "Get Help (£10+)";
  if (hostingBoxLink) hostingBoxLink.textContent = "View Hosting Options (£5)";
}

function updateCheckedRadioLabels(name) {
  document.querySelectorAll(`input[name='${name}']`).forEach(input => {
    input.parentElement.classList.toggle("checked", input.checked);
  });
}

function queuePreviewAndSave() {
  updateLivePreviewDebounced();
  if (isLoggedIn()) saveAnswers();
}

function setAuthMode(mode) {
  authMode = mode;
  authError.textContent = "";
  showSignupBtn.classList.toggle("active", mode === "signup");
  showLoginBtn.classList.toggle("active", mode === "login");
  authSubmitBtn.textContent = mode === "signup" ? "Create Account" : "Log In";
}

function formatDate(value) {
  if (!value) return "Just now";
  return new Date(value).toLocaleString();
}

function copyText(value) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }
  const temp = document.createElement("textarea");
  temp.value = value;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  return Promise.resolve();
}

function getCurrentProjectStatus(project = getCurrentProject()) {
  if (!project) return { paid: false, downloaded: false };
  return {
    paid: !!project.paid,
    downloaded: !!project.downloaded
  };
}

function updateAccountBar(session) {
  if (!session) {
    accountBar.classList.add("hidden");
    accountDisplay.textContent = "";
    return;
  }

  const user = getCurrentUser();
  const userId = user ? user.userId : "";
  accountDisplay.textContent = `${session.accountName} @${session.username}${userId ? ` • ${userId}` : ""}`;
  accountBar.classList.remove("hidden");
}

function updateMyIdBox() {
  const userId = getCurrentUserId();
  if (myIdValue) {
    myIdValue.textContent = `My ID: ${userId || "-"}`;
  }
}

function updateProjectUi(project = getCurrentProject()) {
  const { paid } = getCurrentProjectStatus(project);
  if (upgradeBadge) {
    upgradeBadge.classList.toggle("hidden", !paid);
    upgradeBadge.textContent = paid ? "Current project upgraded" : "Current project not upgraded";
  }
  if (upgradeBtn) {
    upgradeBtn.disabled = paid;
    upgradeBtn.textContent = paid ? "Project Upgraded" : "Upgrade Project (£5)";
  }
  if (paywallBox) {
    paywallBox.classList.toggle("hidden", paid);
  }
}

function openBuilder(projectId) {
  if (projectId) {
    loadProject(projectId);
  }
  updateProjectUi();
  showPage("form-page");
  showStep(1);
  queuePreviewAndSave();
}

function buildWhatsAppUrl(lines) {
  const yourNumber = "447743754159";
  return `https://wa.me/${yourNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function openWhatsApp(lines) {
  window.open(buildWhatsAppUrl(lines), "_blank", "noopener");
}

function openContactModal() {
  contactModal.classList.remove("hidden");
}

function buildHelpMessage() {
  const user = getCurrentUser();
  return [
    "Hello am contacting you so you can help me build a website",
    "",
    `Account Name: ${user?.accountName || "-"}`,
    `User Name: ${user?.username || "-"}`,
    `User ID: ${user?.userId || "-"}`,
    `Email: ${user?.email || "-"}`
  ];
}

function renderProjectCard(project) {
  const card = document.createElement("div");
  card.className = "project-card";
  if (project.paid) {
    card.classList.add("highlight-card");
  }
  const shareFee = project.paid ? "" : "Share fee: £0.50";
  const statusText = project.paid ? "Paid project" : "Unpaid project";
  const downloadText = project.downloaded ? "Downloaded" : "Not downloaded";

  card.innerHTML = `
    <h3>${project.name || "Untitled website"}</h3>
    <p class="project-meta">Project ID: ${project.id}</p>
    <p class="project-meta">${statusText} • ${downloadText}</p>
    <p class="project-meta">Last updated ${formatDate(project.updatedAt)}</p>
    <p class="project-meta">${shareFee}</p>
    <button type="button" class="btn-secondary continue-btn">Continue Project</button>
    <button type="button" class="btn-secondary share-btn">Share</button>
    <button type="button" class="btn-secondary delete-btn"${project.downloaded ? " disabled" : ""}>Delete</button>
  `;

  card.querySelector(".continue-btn").addEventListener("click", () => {
    resetAnswers();
    openBuilder(project.id);
  });

  card.querySelector(".share-btn").addEventListener("click", () => {
    handleShareProject(project);
  });

  card.querySelector(".delete-btn").addEventListener("click", () => {
    if (!deleteProject(project.id)) {
      window.alert("Downloaded websites cannot be deleted.");
      return;
    }
    renderDashboard();
  });

  return card;
}

function renderDashboard() {
  const projects = listProjects();
  projectsGrid.innerHTML = "";
  projectsEmpty.classList.toggle("hidden", projects.length > 0);
  updateMyIdBox();

  projects.forEach(project => {
    projectsGrid.appendChild(renderProjectCard(project));
  });
}

function renderDeveloperProjects(user) {
  console.log("renderDeveloperProjects called for user:", user.accountName);
  console.log("developerUsersList:", developerUsersList);
  console.log("developerUserDetail:", developerUserDetail);
  
  const projects = listProjects(user.userId);
  
  // Count statistics
  const upgradedCount = projects.filter(p => p.paid).length;
  const downloadedCount = projects.filter(p => p.downloaded).length;

  // Show fullscreen detail view
  if (developerUsersList) {
    developerUsersList.classList.add("hidden");
    console.log("Hid users list");
  }
  if (developerUserDetail) {
    developerUserDetail.classList.remove("hidden");
    console.log("Showed user detail");
  }
  
  // Update header
  if (document.getElementById("developer-user-name")) {
    document.getElementById("developer-user-name").textContent = `${user.accountName} (@${user.username})`;
  }

  // Update user info
  document.getElementById("dev-info-account-name").textContent = user.accountName;
  document.getElementById("dev-info-username").textContent = user.username;
  document.getElementById("dev-info-user-id").textContent = user.userId;
  document.getElementById("dev-info-email").textContent = user.email || "-";
  document.getElementById("dev-info-joined").textContent = formatDate(user.createdAt);
  document.getElementById("dev-info-pro-status").textContent = user.isPro ? "✓ Pro User" : "Free User";

  // Update profile
  const profile = user.profile || {};
  document.getElementById("dev-info-bio").textContent = profile.bio || "Not set";
  document.getElementById("dev-info-gender").textContent = profile.gender || "Not specified";
  document.getElementById("dev-info-picture").textContent = profile.picture ? "✓ Set" : "Not set";
  document.getElementById("dev-info-trust").textContent = profile.trustLevel || "0";

  // Update statistics
  document.getElementById("dev-info-project-count").textContent = projects.length;
  document.getElementById("dev-info-upgraded-count").textContent = upgradedCount;
  document.getElementById("dev-info-downloaded-count").textContent = downloadedCount;

  // Update blacklist
  const blacklistContainer = document.getElementById("dev-info-blacklist");
  const blacklist = user.blacklist || [];
  if (blacklist.length === 0) {
    blacklistContainer.innerHTML = "<p>No users blacklisted</p>";
  } else {
    blacklistContainer.innerHTML = blacklist.map(userId => `<div><span>${userId}</span></div>`).join("");
  }

  // Update ban/pro buttons
  const banBtn = document.getElementById("dev-action-ban-btn");
  const unbanBtn = document.getElementById("dev-action-unban-btn");
  const proBtn = document.getElementById("dev-action-upgrade-pro-btn");
  const removeProBtn = document.getElementById("dev-action-remove-pro-btn");

  if (user.banned) {
    banBtn.classList.add("hidden");
    unbanBtn.classList.remove("hidden");
  } else {
    banBtn.classList.remove("hidden");
    unbanBtn.classList.add("hidden");
  }

  if (user.isPro) {
    proBtn.classList.add("hidden");
    removeProBtn.classList.remove("hidden");
  } else {
    proBtn.classList.remove("hidden");
    removeProBtn.classList.add("hidden");
  }

  // Setup action buttons
  banBtn.onclick = () => {
    if (confirm(`Ban ${user.accountName}?`)) {
      banUser(user.userId);
      document.getElementById("dev-action-status").textContent = "✓ User banned";
      setTimeout(() => renderDeveloperProjects(user), 500);
    }
  };

  unbanBtn.onclick = () => {
    if (confirm(`Unban ${user.accountName}?`)) {
      unbanUser(user.userId);
      document.getElementById("dev-action-status").textContent = "✓ User unbanned";
      setTimeout(() => renderDeveloperProjects(user), 500);
    }
  };

  proBtn.onclick = () => {
    if (confirm(`Upgrade ${user.accountName} to Pro?`)) {
      const users = readUsers();
      const key = `${normalize(user.accountName)}::${normalize(user.username)}`;
      if (users[key]) {
        users[key].isPro = true;
        users[key].proSince = new Date().toISOString();
        writeUsers(users);
        document.getElementById("dev-action-status").textContent = "✓ User upgraded to Pro";
        setTimeout(() => renderDeveloperProjects(user), 500);
      }
    }
  };

  removeProBtn.onclick = () => {
    if (confirm(`Remove Pro from ${user.accountName}?`)) {
      const users = readUsers();
      const key = `${normalize(user.accountName)}::${normalize(user.username)}`;
      if (users[key]) {
        users[key].isPro = false;
        users[key].proSince = null;
        writeUsers(users);
        document.getElementById("dev-action-status").textContent = "✓ Pro removed";
        setTimeout(() => renderDeveloperProjects(user), 500);
      }
    }
  };

  // Setup delete button
  const deleteBtn = document.getElementById("dev-action-delete-btn");
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm(`⚠️ PERMANENTLY DELETE ${user.accountName}? This cannot be undone!`)) {
        if (confirm("Are you absolutely sure? This will remove the user account and all their data.")) {
          deleteUser(user.userId);
          document.getElementById("dev-action-status").textContent = "✓ User permanently deleted";
          setTimeout(() => {
            // Return to users list after deletion
            if (developerUsersList) developerUsersList.classList.remove("hidden");
            if (developerUserDetail) developerUserDetail.classList.add("hidden");
            renderDeveloperUsers();
          }, 500);
        }
      }
    };
  }

  // Display user requests
  const allRequests = getOpenRequests();
  const userRequests = allRequests.filter(req => req.createdBy === user.userId);
  const requestsContainer = document.getElementById("dev-info-requests");
  if (requestsContainer) {
    if (userRequests.length === 0) {
      requestsContainer.innerHTML = "<p>No help requests made yet</p>";
    } else {
      requestsContainer.innerHTML = userRequests.map(req => `
        <div>
          <strong>${req.title}</strong>
          <p>${req.description}</p>
          <small>Budget: £${req.budget} | Created: ${formatDate(req.createdAt)}</small>
        </div>
      `).join("");
    }
  }

  // Render projects
  developerProjectsDetailedGrid.innerHTML = "";
  if (projects.length === 0) {
    developerProjectsDetailedGrid.innerHTML = '<div class="dashboard-empty">No projects for this user yet.</div>';
    return;
  }

  projects.forEach(project => {
    const card = document.createElement("div");
    card.className = "admin-card";
    if (project.paid) {
      card.classList.add("highlight-card");
    }
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>Project ID: ${project.id}</p>
      <p>Created: ${formatDate(project.createdAt)}</p>
      <div class="admin-status ${project.paid ? "upgraded" : ""}">
        ${project.paid ? "✓ Upgraded" : "Not upgraded"}
      </div>
      <div class="admin-status ${project.downloaded ? "upgraded" : ""}">
        ${project.downloaded ? "✓ Downloaded" : "Not downloaded"}
      </div>
      <button type="button" class="btn-primary">${project.paid ? "Remove Upgrade" : "Upgrade Project"}</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      updateProject(project.id, { paid: !project.paid }, user.userId);
      renderDeveloperProjects(user);
    });

    developerProjectsDetailedGrid.appendChild(card);
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function renderDeveloperUsers() {
  if (!developerUsersGrid) {
    console.error("Developer users grid element not found");
    return;
  }
  const users = listAllUsers();
  developerUsersGrid.innerHTML = "";
  if (developerUsersEmpty) {
    developerUsersEmpty.classList.toggle("hidden", users.length > 0);
  }

  users.forEach(user => {
    const card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML = `
      <h3>${user.accountName}</h3>
      <p>@${user.username}</p>
      <p>User ID: ${user.userId}</p>
      <p>Email: ${user.email || "-"}</p>
      <p>Joined ${formatDate(user.createdAt)}</p>
      <button type="button" class="btn-primary">View</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      renderDeveloperProjects(user);
    });

    developerUsersGrid.appendChild(card);
  });
}

function openDashboard(session) {
  updateAccountBar(session);
  renderDashboard();
  showPage("dashboard-page");
}

function openDeveloperPage() {
  showPage("developer-page");
  // Show users list, hide detail view
  if (developerUsersList) developerUsersList.classList.remove("hidden");
  if (developerUserDetail) developerUserDetail.classList.add("hidden");
  renderDeveloperUsers();
}

function openMarketplace() {
  renderMarketplace();
  showPage("marketplace-page");
}

function renderMarketplace() {
  const tabButtons = document.querySelectorAll(".marketplace-tabs .tab-btn");
  const tabContents = document.querySelectorAll(".marketplace-container .tab-content");

  // Hide all tabs
  tabContents.forEach(tab => tab.classList.remove("active"));
  tabButtons.forEach(btn => btn.classList.remove("active"));

  // Show requests tab by default
  const requestsTab = document.getElementById("requests-tab");
  if (requestsTab) {
    requestsTab.classList.add("active");
    const firstBtn = tabButtons[0];
    if (firstBtn) firstBtn.classList.add("active");
  }

  // Setup tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");

      const targetTab = document.getElementById(`${tabName}-tab`);
      if (targetTab) {
        targetTab.classList.add("active");
        
        // Render content for each tab
        if (tabName === "requests") renderRequestsTab();
        else if (tabName === "trader") renderTraderTab();
        else if (tabName === "auctions") renderAuctionsTab();
        else if (tabName === "profile") renderProfileTabContent();
        else if (tabName === "chat") renderChatTabContent();
        else if (tabName === "admin") renderAdminTabContent();
      }
    });
  });

  // Initial render
  renderRequestsTab();
}

function renderRequestsTab() {
  const requestsList = document.getElementById("requests-list");
  if (!requestsList) return;

  const currentUser = getCurrentUser();
  const allRequests = getOpenRequests() || [];
  
  // Filter: exclude blacklisted users' requests and banned users
  const visibleRequests = allRequests.filter(req => {
    const requester = getUserProfile(req.userId);
    if (!requester || requester.banned) return false;
    if (currentUser && currentUser.blacklist && currentUser.blacklist.includes(req.userId)) return false;
    return true;
  });

  if (visibleRequests.length === 0) {
    requestsList.innerHTML = `<p class="empty-state">No help requests available right now.</p>`;
    return;
  }

  requestsList.innerHTML = visibleRequests.map(req => {
    const requester = getUserProfile(req.userId);
    const isClaimed = req.status === "in_progress";
    const isMyRequest = req.userId === getCurrentUserId();

    return `
      <div class="item-card request-card">
        <h4>${req.title || "Untitled"}</h4>
        <p class="description">${req.description || ""}</p>
        <div class="meta">
          <span class="budget">Budget: £${req.budget || 0}</span>
          <span class="status">${isClaimed ? "In Progress" : "Open"}</span>
          <span class="requester">by ${requester?.username || "Unknown"}</span>
        </div>
        ${!isMyRequest && !isClaimed ? `
          <button class="btn-primary claim-request-btn" data-request-id="${req.id}">Claim Request</button>
        ` : ""}
        ${isMyRequest ? `
          <p class="my-request-badge">Your request</p>
        ` : ""}
      </div>
    `;
  }).join("");

  // Wire claim buttons
  document.querySelectorAll(".claim-request-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const requestId = btn.getAttribute("data-request-id");
      if (claimRequest(requestId)) {
        window.alert("Request claimed! You can now work on it.");
        renderRequestsTab();
      } else {
        window.alert("Failed to claim request.");
      }
    });
  });
}

function renderTraderTab() {
  const tradesList = document.getElementById("trades-list");
  if (!tradesList) return;

  const proUsers = getProUsers() || [];
  const currentUser = getCurrentUser();
  
  // Filter: exclude blacklisted and self
  const otherProUsers = proUsers.filter(u => 
    u.userId !== currentUser?.userId && 
    (!currentUser?.blacklist || !currentUser.blacklist.includes(u.userId))
  );

  if (otherProUsers.length === 0) {
    tradesList.innerHTML = `<p class="empty-state">No other pro users available yet.</p>`;
    return;
  }

  tradesList.innerHTML = otherProUsers.map(user => {
    return `
      <div class="item-card trader-card">
        <h4>${user.username || user.accountName}</h4>
        <p class="description">${user.profile?.bio || "No bio"}</p>
        <div class="meta">
          <span class="trust-level">Trust: ${user.profile?.trustLevel || 0}</span>
          <span class="gender">${user.profile?.gender ? `(${user.profile.gender})` : ""}</span>
        </div>
        ${user.profile?.picture ? `<img src="${user.profile.picture}" alt="${user.username}" class="trader-picture">` : ""}
        <button class="btn-primary create-trade-btn" data-user-id="${user.userId}">Create Trade with this User</button>
      </div>
    `;
  }).join("");

  // Wire create trade buttons
  document.querySelectorAll(".create-trade-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.getAttribute("data-user-id");
      openCreateTradeModal(userId);
    });
  });
}

function renderAuctionsTab() {
  const auctionsList = document.getElementById("auctions-list");
  if (!auctionsList) return;

  const allAuctions = getAllAuctions() || [];
  const currentUser = getCurrentUser();
  
  // Filter: exclude seller's own auctions, blacklisted users, and banned users
  const visibleAuctions = allAuctions.filter(auction => {
    const seller = getUserProfile(auction.sellerId);
    if (!seller || seller.banned) return false;
    if (auction.sellerId === currentUser?.userId) return false;
    if (currentUser?.blacklist && currentUser.blacklist.includes(auction.sellerId)) return false;
    return true;
  });

  if (visibleAuctions.length === 0) {
    auctionsList.innerHTML = `<p class="empty-state">No active auctions right now.</p>`;
    return;
  }

  auctionsList.innerHTML = visibleAuctions.map(auction => {
    const seller = getUserProfile(auction.sellerId);
    const highestBid = auction.bids && auction.bids.length > 0 ? auction.bids[0].amount : auction.startingPrice;
    const nextMinBid = auction.bidType === "fixed" 
      ? (highestBid + auction.minIncrement).toFixed(2)
      : (highestBid + 0.01).toFixed(2);

    return `
      <div class="item-card auction-card">
        <h4>${auction.title || "Untitled"}</h4>
        <p class="description">${auction.description || ""}</p>
        <div class="auction-details">
          <div class="price-info">
            <span>Starting Price: £${auction.startingPrice?.toFixed(2) || "0.00"}</span>
            <span>Current Highest Bid: £${highestBid?.toFixed(2) || "0.00"}</span>
            <span class="bid-type">${auction.bidType === "fixed" ? "Fixed Increment" : "Partial Bids"}</span>
          </div>
          <div class="bid-count">${auction.bids?.length || 0} bids</div>
          <input type="number" class="bid-amount-input" placeholder="Enter bid amount (£${nextMinBid}+)" step="0.01" min="${nextMinBid}" data-auction-id="${auction.id}">
          <button class="btn-primary place-bid-btn" data-auction-id="${auction.id}">Place Bid</button>
        </div>
        <p class="seller-info">Seller: ${seller?.username || "Unknown"}</p>
      </div>
    `;
  }).join("");

  // Wire bid buttons
  document.querySelectorAll(".place-bid-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const auctionId = btn.getAttribute("data-auction-id");
      const input = document.querySelector(`.bid-amount-input[data-auction-id="${auctionId}"]`);
      const amount = parseFloat(input?.value) || 0;

      if (amount <= 0) {
        window.alert("Enter a valid bid amount.");
        return;
      }

      if (placeBid(auctionId, amount)) {
        window.alert("Bid placed successfully!");
        renderAuctionsTab();
      } else {
        window.alert("Bid rejected. Make sure it meets minimum requirements.");
      }
    });
  });
}

function renderProfileTabContent() {
  const profileTab = document.getElementById("profile-tab");
  if (!profileTab) return;

  const currentUser = getCurrentUser();
  const form = document.getElementById("profile-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bio = document.getElementById("profile-bio")?.value || "";
      const gender = document.getElementById("profile-gender")?.value || "";
      const picture = document.getElementById("profile-picture")?.value || "";

      if (updateUserProfile({ bio, gender, picture })) {
        window.alert("Profile updated!");
      }
    });
  }

  renderProfileBlacklist();
}

function renderProfileBlacklist() {
  const blacklistList = document.getElementById("blacklist-list");
  if (!blacklistList) return;

  const currentUser = getCurrentUser();
  const blacklistedUsers = currentUser?.blacklist || [];

  if (blacklistedUsers.length === 0) {
    blacklistList.innerHTML = `<p>No users blacklisted</p>`;
    return;
  }

  blacklistList.innerHTML = blacklistedUsers.map(userId => {
    const user = getUserProfile(userId);
    return `
      <div class="blacklist-item">
        <span>${user?.username || user?.accountName || userId}</span>
        <button class="btn-danger remove-blacklist-btn" data-user-id="${userId}">Remove</button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".remove-blacklist-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.getAttribute("data-user-id");
      if (removeFromBlacklist(userId)) {
        window.alert("User removed from blacklist.");
        renderProfileBlacklist();
      }
    });
  });
}

function renderChatTabContent() {
  const chatList = document.getElementById("chat-list");
  const chatMessages = document.getElementById("chat-messages");
  
  if (!chatList || !chatMessages) return;

  const myChats = getMyChats() || [];
  const currentUser = getCurrentUser();

  if (myChats.length === 0) {
    chatList.innerHTML = `<p>No conversations yet</p>`;
    chatMessages.innerHTML = `<div class="no-chat-selected">Start a conversation with another pro user</div>`;
    return;
  }

  chatList.innerHTML = myChats.map(chat => {
    const otherUserId = chat.participants.find(id => id !== currentUser?.userId);
    const otherUser = getUserProfile(otherUserId);
    return `
      <div class="chat-item" data-chat-user="${otherUserId}">
        <strong>${otherUser?.username || "Unknown"}</strong>
        <small>${chat.messages?.length || 0} messages</small>
      </div>
    `;
  }).join("");

  // Wire chat item clicks
  document.querySelectorAll(".chat-item").forEach(item => {
    item.addEventListener("click", () => {
      const userId = item.getAttribute("data-chat-user");
      renderChatMessages(userId);
    });
  });
}

function renderChatMessages(userId) {
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-message-btn");

  if (!chatMessages || !chatInput || !sendBtn) return;

  const chat = getChatWithUser(userId);
  const otherUser = getUserProfile(userId);

  chatMessages.innerHTML = `<h4>Chat with ${otherUser?.username || "Unknown"}</h4>` + (chat.messages || []).map(msg => {
    const sender = msg.senderId === getCurrentUserId() ? "You" : otherUser?.username;
    const direction = msg.senderId === getCurrentUserId() ? "sent" : "received";
    return `
      <div class="message ${direction}">
        <strong>${sender}</strong>: ${msg.message}
        <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
      </div>
    `;
  }).join("");

  chatInput.disabled = false;
  chatInput.value = "";
  sendBtn.disabled = false;

  sendBtn.onclick = () => {
    const message = chatInput.value.trim();
    if (!message) return;

    sendMessage(userId, message);
    chatInput.value = "";
    renderChatMessages(userId);
  };

  chatInput.onkeypress = (e) => {
    if (e.key === "Enter") sendBtn.click();
  };
}

function renderAdminTabContent() {
  const adminTab = document.getElementById("admin-tab");
  if (!adminTab || !isDeveloperSessionActive()) {
    if (adminTab) adminTab.innerHTML = `<p>Developer access required</p>`;
    return;
  }

  adminTab.innerHTML = `
    <div class="admin-container">
      <h3>Developer Admin Panel</h3>

      <div class="admin-section">
        <h4>Ban User</h4>
        <div class="admin-form">
          <input type="text" id="dev-ban-user-input" placeholder="Enter username to ban">
          <button id="dev-ban-user-btn" class="btn-danger">Ban User</button>
        </div>
      </div>

      <div class="admin-section">
        <h4>Ban Product</h4>
        <div class="admin-form">
          <input type="text" id="dev-ban-product-input" placeholder="Enter product ID">
          <input type="text" id="dev-ban-product-user-input" placeholder="Enter user ID">
          <button id="dev-ban-product-btn" class="btn-danger">Ban Product</button>
        </div>
      </div>

      <div class="admin-section">
        <h4>View All Requests</h4>
        <div id="dev-all-requests" class="items-list">
          ${renderAllRequestsForAdmin()}
        </div>
      </div>

      <div class="admin-section">
        <h4>View All Auctions</h4>
        <div id="dev-all-auctions" class="items-list">
          ${renderAllAuctionsForAdmin()}
        </div>
      </div>
    </div>
  `;

  // Populate admin views
  const allRequestsDiv = document.getElementById("dev-all-requests");
  const allAuctionsDiv = document.getElementById("dev-all-auctions");

  if (allRequestsDiv) {
    allRequestsDiv.innerHTML = renderAllRequestsForAdmin();
  }

  if (allAuctionsDiv) {
    allAuctionsDiv.innerHTML = renderAllAuctionsForAdmin();
  }
  const banUserBtn = document.getElementById("dev-ban-user-btn");
  const banProductBtn = document.getElementById("dev-ban-product-btn");
  const unbanUserBtn = document.getElementById("dev-unban-user-btn");
  const unbanProductBtn = document.getElementById("dev-unban-product-btn");
  const deleteUserBtn = document.getElementById("dev-action-delete-btn");
  const upgradeProBtn = document.getElementById("dev-action-upgrade-pro-btn");
  const removeProBtn = document.getElementById("dev-action-remove-pro-btn");

  if (banUserBtn) {
    banUserBtn.addEventListener("click", () => {
      const username = document.getElementById("dev-ban-user-input")?.value;
      if (!username) {
        window.alert("Enter a username to ban.");
        return;
      }
      const users = listAllUsers();
      const targetUser = users.find(u => u.username === username);
      if (targetUser) {
        if (banUser(targetUser.userId)) {
          window.alert(`User ${username} has been banned.`);
          renderAdminTabContent(); // Refresh the admin panel
        } else {
          window.alert("Failed to ban user.");
        }
      } else {
        window.alert("User not found.");
      }
    });
  }

  if (banProductBtn) {
    banProductBtn.addEventListener("click", () => {
      const productId = document.getElementById("dev-ban-product-input")?.value;
      const userId = document.getElementById("dev-ban-product-user-input")?.value;
      if (!productId || !userId) {
        window.alert("Enter both product ID and user ID.");
        return;
      }
      if (banUserProduct(userId, productId)) {
        window.alert(`Product ${productId} banned for user ${userId}.`);
        renderAdminTabContent(); // Refresh the admin panel
      } else {
        window.alert("Failed to ban product.");
      }
    });
  }

  if (unbanUserBtn) {
    unbanUserBtn.addEventListener("click", () => {
      const username = document.getElementById("dev-unban-user-input")?.value;
      if (!username) {
        window.alert("Enter a username to unban.");
        return;
      }
      const users = listAllUsers();
      const targetUser = users.find(u => u.username === username);
      if (targetUser) {
        if (unbanUser(targetUser.userId)) {
          window.alert(`User ${username} has been unbanned.`);
          renderAdminTabContent(); // Refresh the admin panel
        } else {
          window.alert("Failed to unban user.");
        }
      } else {
        window.alert("User not found.");
      }
    });
  }

  if (unbanProductBtn) {
    unbanProductBtn.addEventListener("click", () => {
      const productId = document.getElementById("dev-unban-product-input")?.value;
      const userId = document.getElementById("dev-unban-product-user-input")?.value;
      if (!productId || !userId) {
        window.alert("Enter both product ID and user ID.");
        return;
      }
      if (unbanUserProduct(userId, productId)) {
        window.alert(`Product ${productId} unbanned for user ${userId}.`);
        renderAdminTabContent(); // Refresh the admin panel
      } else {
        window.alert("Failed to unban product.");
      }
    });
  }

  if (deleteUserBtn) {
    deleteUserBtn.addEventListener("click", () => {
      const username = document.getElementById("dev-delete-user-input")?.value;
      if (!username) {
        window.alert("Enter a username to delete.");
        return;
      }
      if (window.confirm(`Are you sure you want to permanently delete user ${username}? This action cannot be undone.`)) {
        const users = listAllUsers();
        const targetUser = users.find(u => u.username === username);
        if (targetUser) {
          if (deleteUser(targetUser.userId)) {
            window.alert(`User ${username} has been permanently deleted.`);
            renderAdminTabContent(); // Refresh the admin panel
          } else {
            window.alert("Failed to delete user.");
          }
        } else {
          window.alert("User not found.");
        }
      }
    });
  }

  if (upgradeProBtn) {
    upgradeProBtn.addEventListener("click", () => {
      const username = document.getElementById("dev-upgrade-pro-input")?.value;
      if (!username) {
        window.alert("Enter a username to upgrade to Pro.");
        return;
      }
      const users = listAllUsers();
      const targetUser = users.find(u => u.username === username);
      if (targetUser) {
        if (upgradeUserToPro(targetUser.userId)) {
          window.alert(`User ${username} has been upgraded to Pro status.`);
          renderAdminTabContent(); // Refresh the admin panel
        } else {
          window.alert("Failed to upgrade user to Pro.");
        }
      } else {
        window.alert("User not found.");
      }
    });
  }

  if (removeProBtn) {
    removeProBtn.addEventListener("click", () => {
      const username = document.getElementById("dev-remove-pro-input")?.value;
      if (!username) {
        window.alert("Enter a username to remove Pro status from.");
        return;
      }
      const users = listAllUsers();
      const targetUser = users.find(u => u.username === username);
      if (targetUser) {
        if (removeUserPro(targetUser.userId)) {
          window.alert(`Pro status removed from user ${username}.`);
          renderAdminTabContent(); // Refresh the admin panel
        } else {
          window.alert("Failed to remove Pro status.");
        }
      } else {
        window.alert("User not found.");
      }
    });
  }
}

function renderAllRequestsForAdmin() {
  const allRequests = getAllRequests() || [];
  if (allRequests.length === 0) return "<p>No requests yet</p>";

  return allRequests.map(req => {
    const requester = getUserProfile(req.userId);
    return `
      <div class="admin-item">
        <strong>${req.title}</strong> - by ${requester?.username || "Unknown"} (Budget: £${req.budget})
        <small>${req.status}</small>
      </div>
    `;
  }).join("");
}

function renderAllAuctionsForAdmin() {
  const allAuctions = getAllAuctions() || [];
  if (allAuctions.length === 0) return "<p>No auctions yet</p>";

  return allAuctions.map(auction => {
    const seller = getUserProfile(auction.sellerId);
    return `
      <div class="admin-item">
        <strong>${auction.title}</strong> - by ${seller?.username || "Unknown"} (£${auction.startingPrice})
        <small>${auction.status} - ${auction.bids?.length || 0} bids</small>
      </div>
    `;
  }).join("");
}

function openCreateTradeModal(userId) {
  const modal = document.getElementById("create-trade-modal");
  const form = document.getElementById("create-trade-form");
  
  if (!modal || !form) return;

  modal.classList.remove("hidden");

  form.onsubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById("trade-title")?.value || "";
    const description = document.getElementById("trade-description")?.value || "";
    const offering = document.getElementById("trade-offer")?.value || "";
    const wanting = document.getElementById("trade-want")?.value || "";

    if (createTradeOffer(userId, title, description, offering, wanting)) {
      window.alert("Trade offer created!");
      modal.classList.add("hidden");
      form.reset();
    }
  };
}

function maybeOpenDeveloperPage() {
  if (isDeveloperSessionActive()) {
    openDeveloperPage();
    return;
  }

  const code = window.prompt("Developer access code");
  if (!code) return;

  if (verifyDeveloperAccess(code)) {
    openDeveloperPage();
    return;
  }

  window.alert("Access denied.");
}

function handleAuthSubmit() {
  try {
    const accountName = authAccountNameInput.value.trim();
    const username = authUsernameInput.value.trim();
    const password = authPasswordInput.value.trim();

    authError.textContent = "";

    if (!accountName || !username || !password) {
      authError.textContent = "Enter email, user name, and password.";
      return;
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = authMode === "signup" ? "Creating..." : "Logging in...";

    const result = authMode === "signup"
      ? signUp(accountName, username, password)
      : logIn(accountName, username, password);

    if (!result.ok) {
      authError.textContent = result.message;
      return;
    }

    authPasswordInput.value = "";
    loadAnswersFromStorage();
    openDashboard(result.session);
  } catch (error) {
    console.error("Auth submit failed", error);
    authError.textContent = "Something went wrong while signing in. Reload and try again.";
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = authMode === "signup" ? "Create Account" : "Log In";
  }
}

function handleShareProject(project) {
  const password = window.prompt("Enter your password to share this website");
  if (!password || !verifyCurrentUserPassword(password)) {
    window.alert("Wrong password.");
    return;
  }

  const targetUserId = window.prompt("Enter the ID of the person you want to share to");
  if (!targetUserId) return;

  const targetAccountName = window.prompt("Enter that person's account name");
  if (!targetAccountName) return;

  const recipient = findUserByIdAndAccount(targetUserId, targetAccountName);
  if (!recipient) {
    window.alert("No user matched that account name and ID.");
    return;
  }

  if (!project.paid) {
    openWhatsApp([
      "Project Share Request (£0.50)",
      "",
      `Sender User ID: ${getCurrentUserId() || "-"}`,
      `Sender Account: ${getCurrentUser()?.accountName || "-"}`,
      `Project ID: ${project.id}`,
      `Recipient User ID: ${recipient.userId}`,
      `Recipient Account: ${recipient.accountName}`,
      "",
      "I want to pay the £0.50 share fee for this unpaid project."
    ]);
    return;
  }

  copyProjectToUser(project, recipient.userId);
  window.alert(`Project shared to ${recipient.accountName} (${recipient.userId}).`);
}

function seedExamplePortfolio() {
  if (templateTypeSelect) templateTypeSelect.value = "portfolio";
  answers.templateType = "portfolio";

  businessNameInput.value = "Xenos Dev";
  businessTypeInput.value = "software developer";
  businessLocationInput.value = "London, UK";
  businessTaglineInput.value = "Building clean, fast apps and tools.";

  phoneInput.value = "07123 456789";
  whatsappInput.value = "07123 456789";
  instagramInput.value = "@xenos_dev";
  emailInput.value = "you@example.com";

  sectionCheckboxes.forEach(cb => {
    cb.checked = false;
    cb.parentElement.classList.remove("checked");
  });

  [
    SECTIONS.ABOUT,
    SECTIONS.PRODUCTS,
    SECTIONS.GALLERY,
    SECTIONS.REVIEWS,
    SECTIONS.CONTACT
  ].forEach(key => {
    const cb = Array.from(sectionCheckboxes).find(item => item.value === key);
    if (cb) {
      cb.checked = true;
      cb.parentElement.classList.add("checked");
    }
  });

  answers.projects = [
    "Website redesign - for Client X",
    "Mobile app - for Company Y",
    "Internal tool - for Startup Z"
  ];
  answers.testimonials = [
    "\"They shipped fast and communicated clearly.\" - Client X",
    "\"Great work and attention to detail.\" - Client Y"
  ];

  renderProjectsList();
  renderTestimonialsList();

  if (imageModeNowRadio) imageModeNowRadio.checked = true;
  updateCheckedRadioLabels("imageMode");
  imageFields.classList.remove("hidden");
  heroImagePathInput.value = "hero.jpg";
  galleryImagesInput.value = "project1.jpg\nproject2.jpg\nproject3.jpg";

  queuePreviewAndSave();
}

templateCards.forEach(card => {
  card.addEventListener("click", () => {
    templateCards.forEach(item => item.classList.remove("active"));
    card.classList.add("active");
    answers.templateType = card.dataset.template || "generic";
    if (templateTypeSelect) templateTypeSelect.value = answers.templateType;
    applyTemplateDefaults();
    queuePreviewAndSave();
  });
});

startBtn.addEventListener("click", () => {
  showPage("form-page");
  showStep(1);
  queuePreviewAndSave();
});

document.querySelectorAll(".prev-btn").forEach(btn => {
  btn.addEventListener("click", () => showStep(btn.dataset.prev));
});

if (templateTypeSelect) {
  templateTypeSelect.addEventListener("change", () => {
    answers.templateType = templateTypeSelect.value;
    applyTemplateDefaults();
    queuePreviewAndSave();
  });
}

if (imageModeLaterRadio) {
  imageModeLaterRadio.addEventListener("change", () => {
    if (imageModeLaterRadio.checked) {
      imageFields.classList.add("hidden");
      updateCheckedRadioLabels("imageMode");
      queuePreviewAndSave();
    }
  });
}

if (imageModeNowRadio) {
  imageModeNowRadio.addEventListener("change", () => {
    if (imageModeNowRadio.checked) {
      imageFields.classList.remove("hidden");
      updateCheckedRadioLabels("imageMode");
      queuePreviewAndSave();
    }
  });
}

next1.addEventListener("click", () => {
  businessNameError.textContent = "";
  if (!businessNameInput.value.trim()) {
    businessNameError.textContent = "Please enter your name / brand.";
    return;
  }
  updateAnswersFromInputs();
  showStep(2);
});

next2.addEventListener("click", () => {
  updateAnswersFromInputs();
  showStep(3);
});

next3.addEventListener("click", () => {
  updateAnswersFromInputs();
  sectionsError.textContent = "";
  if (answers.sections.length === 0) {
    sectionsError.textContent = "Select at least one section.";
    return;
  }
  showStep(4);
});

next4.addEventListener("click", () => {
  updateAnswersFromInputs();
  showStep(5);
});

exampleBtn.addEventListener("click", seedExamplePortfolio);

[
  businessNameInput,
  businessTypeInput,
  businessLocationInput,
  businessTaglineInput,
  phoneInput,
  whatsappInput,
  instagramInput,
  emailInput,
  addressInput,
  heroImagePathInput,
  galleryImagesInput
].forEach(input => {
  input.addEventListener("input", queuePreviewAndSave);
});

document.querySelectorAll("input[name='style']").forEach(input => {
  input.addEventListener("change", () => {
    updateCheckedRadioLabels("style");
    queuePreviewAndSave();
  });
});

sectionCheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    cb.parentElement.classList.toggle("checked", cb.checked);
    queuePreviewAndSave();
  });
});

document.querySelectorAll("input[name='primaryAction']").forEach(input => {
  input.addEventListener("change", () => {
    updateCheckedRadioLabels("primaryAction");
    queuePreviewAndSave();
  });
});

const projectNameInput = document.querySelector(".project-name-input");
const projectClientInput = document.querySelector(".project-client-input");
const btnSaveProject = document.querySelector(".btn-save-project");

if (btnSaveProject && projectNameInput && projectClientInput) {
  btnSaveProject.addEventListener("click", () => {
    const projectName = projectNameInput.value.trim();
    const projectClient = projectClientInput.value.trim();
    if (!projectName || !projectClient) return;

    answers.projects.push(`${projectName} - for ${projectClient}`);
    projectNameInput.value = "";
    projectClientInput.value = "";
    renderProjectsList();
    queuePreviewAndSave();
  });

  [projectNameInput, projectClientInput].forEach(input => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") btnSaveProject.click();
    });
  });
}

const testimonialFromInput = document.querySelector(".testimonial-from-input");
const testimonialTextInput = document.querySelector(".testimonial-text-input");
const btnSaveTestimonial = document.querySelector(".btn-save-testimonial");

if (btnSaveTestimonial && testimonialFromInput && testimonialTextInput) {
  btnSaveTestimonial.addEventListener("click", () => {
    const from = testimonialFromInput.value.trim();
    const text = testimonialTextInput.value.trim();
    if (!from || !text) return;

    answers.testimonials.push(`"${text}" - ${from}`);
    testimonialFromInput.value = "";
    testimonialTextInput.value = "";
    renderTestimonialsList();
    queuePreviewAndSave();
  });

  [testimonialFromInput, testimonialTextInput].forEach(input => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") btnSaveTestimonial.click();
    });
  });
}

if (upgradeBtn) {
  upgradeBtn.addEventListener("click", () => {
    const project = saveCurrentProject();
    if (!project || project.paid) return;

    const user = getCurrentUser();
    openWhatsApp([
      "Project Upgrade Request (£5)",
      "",
      `Account Name: ${user?.accountName || "-"}`,
      `User Name: ${user?.username || "-"}`,
      `User ID: ${user?.userId || "-"}`,
      `Project Name: ${project.name || "-"}`,
      `Project ID: ${project.id}`,
      "",
      "I want to upgrade this project."
    ]);

    if (upgradeModal) upgradeModal.classList.remove("hidden");
  });
}

if (fullServiceBtn) {
  fullServiceBtn.addEventListener("click", openContactModal);
}

if (hostingBoxLink) {
  hostingBoxLink.href = "https://your-affiliate-link.com";
}

downloadBtn.addEventListener("click", async () => {
  const result = await handleDownload(downloadStatus);
  if (result.blocked && upgradeModal) {
    upgradeModal.classList.remove("hidden");
  } else {
    renderDashboard();
  }
});

if (closeUpgradeBtn) {
  closeUpgradeBtn.addEventListener("click", () => upgradeModal.classList.add("hidden"));
}

editBtn.addEventListener("click", () => {
  showPage("form-page");
  showStep(1);
  queuePreviewAndSave();
});

if (contactBtn) {
  contactBtn.addEventListener("click", openContactModal);
}

if (contactMeBtn) {
  contactMeBtn.addEventListener("click", openContactModal);
}

if (contactWhatsappBtn) {
  contactWhatsappBtn.addEventListener("click", () => {
    openWhatsApp(buildHelpMessage());
  });
}

if (contactEmailBtn) {
  contactEmailBtn.addEventListener("click", () => {
    const subject = encodeURIComponent("Help me build a website");
    const body = encodeURIComponent(buildHelpMessage().join("\n"));
    const fromEmail = encodeURIComponent(getCurrentUserEmail());
    window.location.href = `mailto:hackerxenos06@gmail.com?subject=${subject}&body=${body}%0A%0AFrom:%20${fromEmail}`;
  });
}

closeModalBtn.addEventListener("click", () => {
  contactModal.classList.add("hidden");
});

generateBtn.addEventListener("click", () => {
  const project = saveCurrentProject();
  const html = generateSiteHtml(answers);
  previewContainer.innerHTML = html;
  successMessage.classList.remove("hidden");
  updateProjectUi(project);
  showPage("result-page");

  setTimeout(() => {
    if (upgradeModal && !canDownload()) {
      upgradeModal.classList.remove("hidden");
    }
  }, 1500);
});

if (showSignupBtn) {
  showSignupBtn.addEventListener("click", () => setAuthMode("signup"));
}

if (showLoginBtn) {
  showLoginBtn.addEventListener("click", () => setAuthMode("login"));
}

if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {
    resetAnswers();
    updateInputsFromAnswers();
    const project = createProject();
    openBuilder(project.id);
  });
}

if (dashboardBtn) {
  dashboardBtn.addEventListener("click", () => {
    if (!isLoggedIn()) return;
    saveCurrentProject();
    openDashboard(getCurrentSession());
  });
}

if (marketplaceBtn) {
  marketplaceBtn.addEventListener("click", () => {
    if (!isLoggedIn()) return;
    if (!isCurrentUserPro()) {
      window.alert("You need to be a Pro user to access the marketplace. Upgrade to Pro for £20.");
      return;
    }
    openMarketplace();
  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    if (!isLoggedIn()) return;
    showProfilePage();
  });
}

if (copyMyIdBtn) {
  copyMyIdBtn.addEventListener("click", async () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    await copyText(userId);
    copyMyIdBtn.textContent = "Copied";
    setTimeout(() => {
      copyMyIdBtn.textContent = "Copy";
    }, 1200);
  });
}

if (closeDeveloperBtn) {
  closeDeveloperBtn.addEventListener("click", () => {
    clearDeveloperSession();
    if (isLoggedIn()) {
      openDashboard(getCurrentSession());
    } else {
      showPage("auth-page");
    }
  });
}

if (developerBackBtn) {
  developerBackBtn.addEventListener("click", () => {
    developerUsersList.classList.remove("hidden");
    developerUserDetail.classList.add("hidden");
  });
}

if (authSubmitBtn) {
  authSubmitBtn.addEventListener("click", handleAuthSubmit);
  window.__authSubmitBound = true;
} else {
  window.__authSubmitBound = false;
}

// Marketplace modal handlers
document.querySelectorAll(".modal-close, .modal .btn-primary").forEach(btn => {
  if (btn.className.includes("modal-close")) {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) modal.classList.add("hidden");
    });
  }
});

const createRequestBtn = document.getElementById("create-request-btn");
const createRequestModal = document.getElementById("create-request-modal");
const createRequestForm = document.getElementById("create-request-form");

if (createRequestBtn && createRequestModal) {
  createRequestBtn.addEventListener("click", () => {
    createRequestModal.classList.remove("hidden");
  });
}

if (createRequestForm) {
  createRequestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("request-title")?.value || "";
    const description = document.getElementById("request-description")?.value || "";
    const budget = parseFloat(document.getElementById("request-budget")?.value) || 0;

    if (createRequest(title, description, budget)) {
      window.alert("Request created!");
      createRequestForm.reset();
      createRequestModal.classList.add("hidden");
      renderRequestsTab();
    } else {
      window.alert("Failed to create request.");
    }
  });
}

const createAuctionBtn = document.getElementById("create-auction-btn");
const createAuctionModal = document.getElementById("create-auction-modal");
const createAuctionForm = document.getElementById("create-auction-form");

if (createAuctionBtn && createAuctionModal) {
  createAuctionBtn.addEventListener("click", () => {
    createAuctionModal.classList.remove("hidden");
  });
}

if (createAuctionForm) {
  createAuctionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("auction-title")?.value || "";
    const description = document.getElementById("auction-description")?.value || "";
    const startingPrice = parseFloat(document.getElementById("auction-starting-price")?.value) || 0;
    const bidType = document.getElementById("auction-bid-type")?.value || "partial";
    const endsAt = document.getElementById("auction-end-date")?.value || "";

    if (createAuction(title, description, startingPrice, bidType, endsAt)) {
      window.alert("Auction created!");
      createAuctionForm.reset();
      createAuctionModal.classList.add("hidden");
      renderAuctionsTab();
    } else {
      window.alert("Failed to create auction.");
    }
  });
}

document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "auth-submit-btn") {
    handleAuthSubmit();
  }
}, true);

[authAccountNameInput, authUsernameInput, authPasswordInput].forEach(input => {
  if (!input) return;
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAuthSubmit();
  });
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (isLoggedIn()) {
      saveCurrentProject();
    }

    logOut();
    clearDeveloperSession();
    resetAnswers();
    updateInputsFromAnswers();
    updateAccountBar(null);
    setAuthMode("signup");
    showPage("auth-page");
  });
}

document.addEventListener("keydown", (e) => {
  const key = String(e.key || "").toUpperCase();
  console.log("Key pressed:", key, "Ctrl:", e.ctrlKey, "Shift:", e.shiftKey, "Alt:", e.altKey);
  if (e.ctrlKey && e.shiftKey && !e.altKey && key === DEV_SHORTCUT_KEY) {
    console.log("Developer shortcut triggered!");
    e.preventDefault();
    maybeOpenDeveloperPage();
  }
});

updateInputsFromAnswers();
setAuthMode("signup");
setButtonCopy();
updateCheckedRadioLabels("style");
updateCheckedRadioLabels("primaryAction");
updateCheckedRadioLabels("imageMode");
showStep(1);

const currentSession = getCurrentSession();
if (isDeveloperSessionActive()) {
  openDeveloperPage();
} else if (currentSession) {
  loadAnswersFromStorage();
  openDashboard(currentSession);
} else {
  updateAccountBar(null);
  showPage("auth-page");
}
