import {
  getCurrentUser,
  logOut,
  updateUserProfile,
  upgradeToPro,
  isCurrentUserPro,
  readUsers,
  addToBlacklist,
  removeFromBlacklist
} from "./auth.js";
import { showPage } from "./ui.js";

const PROFILE_KEY = "user_profile_v1";

function showProfilePage() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("You must be logged in to view your profile");
    return;
  }

  showPage("profile-page");
  renderProfileContent();
}

function renderProfileContent() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const profileContent = document.getElementById("profile-content");
  if (!profileContent) return;

  const isPro = isCurrentUserPro();
  const proStatus = isPro ? "✓ Pro Member" : "Not a Pro Member";
  const proButton = isPro
    ? `<span class="pro-badge">✓ Pro Member Since ${formatDate(currentUser.proSince)}</span>`
    : `<button type="button" id="upgrade-to-pro-btn" class="btn-primary">Upgrade to Pro (£20)</button>`;

  const profilePicture = currentUser.profile?.picture || "";
  const pictureDisplay = profilePicture
    ? `<img src="${profilePicture}" alt="Profile Picture" class="profile-picture-preview">`
    : `<p class="no-picture">No profile picture set</p>`;

  profileContent.innerHTML = `
    <div class="profile-header">
      <h1>My Profile</h1>
      <div class="profile-header-actions">
        <button type="button" id="back-to-dashboard-btn" class="btn-secondary">← Back to Dashboard</button>
        <button type="button" id="profile-logout-btn" class="btn-secondary">Log Out</button>
      </div>
    </div>

    <div class="profile-container">
      <!-- Account Info Section -->
      <div class="profile-section">
        <h3>Account Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Email / Account Name:</label>
            <span>${currentUser.email || currentUser.accountName || "-"}</span>
          </div>
          <div class="info-item">
            <label>Username:</label>
            <span>${currentUser.username || "-"}</span>
          </div>
          <div class="info-item">
            <label>User ID:</label>
            <span>${currentUser.userId || "-"}</span>
          </div>
          <div class="info-item">
            <label>Member Since:</label>
            <span>${formatDate(currentUser.createdAt)}</span>
          </div>
          <div class="info-item">
            <label>Pro Status:</label>
            <span>${proStatus}</span>
          </div>
        </div>
      </div>

      <!-- Edit Profile Section -->
      <div class="profile-section">
        <h3>Edit Profile</h3>
        <form id="edit-profile-form" class="profile-form">
          <div class="form-group">
            <label for="profile-bio">Bio (Optional):</label>
            <textarea id="profile-bio" name="bio" rows="4" placeholder="Tell others about yourself...">${currentUser.profile?.bio || ""}</textarea>
            <small>Help build trust by sharing a bit about yourself</small>
          </div>

          <div class="form-group">
            <label for="profile-gender">Gender (Optional):</label>
            <select id="profile-gender" name="gender">
              <option value="">Choose...</option>
              <option value="male" ${currentUser.profile?.gender === "male" ? "selected" : ""}>Male</option>
              <option value="female" ${currentUser.profile?.gender === "female" ? "selected" : ""}>Female</option>
              <option value="other" ${currentUser.profile?.gender === "other" ? "selected" : ""}>Other</option>
              <option value="prefer-not-to-say" ${currentUser.profile?.gender === "prefer-not-to-say" ? "selected" : ""}>Prefer not to say</option>
            </select>
          </div>

          <div class="form-group">
            <label for="profile-picture">Profile Picture URL (Optional):</label>
            <input type="url" id="profile-picture" name="picture" placeholder="https://example.com/image.jpg" value="${currentUser.profile?.picture || ""}">
            ${profilePicture ? `<small>Current picture:</small>` : ""}
            <div class="picture-preview">
              ${pictureDisplay}
            </div>
          </div>

          <button type="submit" class="btn-primary">Save Profile</button>
        </form>
      </div>

      <!-- Pro Upgrade Section -->
      <div class="profile-section ${isPro ? "hidden" : ""}">
        <h3>Go Pro!</h3>
        <p>Unlock the full marketplace: access help requests, trade ideas, auction projects, and connect with other pro users.</p>
        <div class="pro-features">
          <ul>
            <li>✓ View all help requests from other users</li>
            <li>✓ Trade ideas and services with other pros</li>
            <li>✓ Auction your projects to highest bidder</li>
            <li>✓ One-on-one messaging with other pros</li>
            <li>✓ Increased trust level visibility</li>
          </ul>
        </div>
        <button type="button" id="upgrade-to-pro-btn" class="btn-primary btn-large">Upgrade to Pro (£20)</button>
      </div>

      <!-- Trust Level Section -->
      <div class="profile-section">
        <h3>Trust Level</h3>
        <div class="trust-info">
          <p>Current Trust Level: <strong>${currentUser.profile?.trustLevel || 0}</strong></p>
          <p>Increase your trust level by completing requests, trades, and auctions successfully. Higher trust means more opportunities!</p>
        </div>
      </div>

      <!-- Blacklist Section -->
      <div class="profile-section">
        <h3>Blacklist</h3>
        <p>Users you have blocked will not see your profile or contact you</p>
        <div id="profile-blacklist-list" class="blacklist-list">
          <!-- Blacklisted users will be shown here -->
        </div>
        <button type="button" id="profile-add-blacklist-btn" class="btn-secondary">Add User to Blacklist</button>
      </div>
    </div>
  `;

  // Setup event listeners
  const editProfileForm = document.getElementById("edit-profile-form");
  const upgradeProBtn = document.getElementById("upgrade-to-pro-btn");
  const backToDashboardBtn = document.getElementById("back-to-dashboard-btn");
  const addBlacklistBtn = document.getElementById("profile-add-blacklist-btn");

  if (editProfileForm) {
    editProfileForm.onsubmit = handleProfileUpdate;
  }

  if (upgradeProBtn) {
    upgradeProBtn.onclick = handleUpgradeToPro;
  }

  const profileLogoutBtn = document.getElementById("profile-logout-btn");

  if (backToDashboardBtn) {
    backToDashboardBtn.onclick = () => {
      showPage("dashboard-page");
    };
  }

  if (profileLogoutBtn) {
    profileLogoutBtn.onclick = () => {
      logOut();
      window.location.reload();
    };
  }

  if (addBlacklistBtn) {
    addBlacklistBtn.onclick = handleAddToBlacklist;
  }

  renderProfileBlacklist();
}

function handleProfileUpdate(e) {
  e.preventDefault();

  const bio = document.getElementById("profile-bio")?.value || "";
  const gender = document.getElementById("profile-gender")?.value || "";
  const picture = document.getElementById("profile-picture")?.value || "";

  const success = updateUserProfile({
    bio,
    gender,
    picture
  });

  if (success) {
    alert("✓ Profile updated successfully!");
    renderProfileContent();
  } else {
    alert("✗ Failed to update profile");
  }
}

function handleUpgradeToPro() {
  const confirmed = confirm("Upgrade to Pro Member for £20? You'll unlock the full marketplace.");
  if (!confirmed) return;

  const success = upgradeToPro();
  if (success) {
    alert("✓ You are now a Pro Member! Welcome to the marketplace.");
    renderProfileContent();
  } else {
    alert("✗ Failed to upgrade to Pro");
  }
}

function handleAddToBlacklist() {
  const username = prompt("Enter the username you want to block:");
  if (!username) return;

  const users = readUsers();
  const targetUser = Object.values(users).find(u => u.username?.toLowerCase() === username.toLowerCase());

  if (!targetUser) {
    alert("User not found");
    return;
  }

  const success = addToBlacklist(targetUser.userId);
  if (success) {
    alert(`✓ ${username} has been blocked`);
    renderProfileBlacklist();
  } else {
    alert(`✗ ${username} could not be blocked or is already blocked`);
  }
}

function renderProfileBlacklist() {
  const currentUser = getCurrentUser();
  const blacklistList = document.getElementById("profile-blacklist-list");

  if (!blacklistList) return;

  if (!currentUser || currentUser.blacklist.length === 0) {
    blacklistList.innerHTML = "<p>No users blacklisted</p>";
    return;
  }

  const users = readUsers();
  const blacklistedUsers = currentUser.blacklist
    .map(userId => Object.values(users).find(u => u.userId === userId))
    .filter(Boolean);

  if (blacklistedUsers.length === 0) {
    blacklistList.innerHTML = "<p>No users blacklisted</p>";
    return;
  }

  blacklistList.innerHTML = blacklistedUsers.map(user => `
    <div class="blacklist-item">
      <span>${user.username}</span>
      <button type="button" class="btn-danger btn-small remove-blacklist-btn" data-user-id="${user.userId}">Remove</button>
    </div>
  `).join("");

  // Setup remove buttons
  document.querySelectorAll(".remove-blacklist-btn").forEach(btn => {
    btn.onclick = (e) => {
      const userId = e.target.dataset.userId;
      const success = removeFromBlacklist(userId);
      if (success) {
        renderProfileBlacklist();
      } else {
        alert("✗ Could not remove user from blacklist");
      }
    };
  });
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
