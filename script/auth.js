const USERS_KEY = "smart_builder_users_v1";
const SESSION_KEY = "smart_builder_session_v1";
const DEV_SESSION_KEY = "smart_builder_dev_session_v1";
const DEV_ACCESS_CODE = "developer-admin-xenos-52";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toSlug(value) {
  const base = normalize(value).replace(/[^a-z0-9]/g, "");
  return base || "user";
}

export function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Auth read failed", e);
    return {};
  }
}

export function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getUserKey(accountName, username) {
  return `${normalize(accountName)}::${normalize(username)}`;
}

function getUserBySession(session) {
  if (!session || (!session.accountName && !session.username)) return null;
  const users = readUsers();
  return users[getUserKey(session.accountName, session.username)] || null;
}

function createUniqueUserId(users, accountName, username) {
  const prefix = toSlug(username || accountName);
  let candidate = "";

  do {
    const suffix = Math.floor(Math.random() * 900) + 100;
    candidate = `${prefix}${suffix}`;
  } while (Object.values(users).some(user => user.userId === candidate));

  return candidate;
}

function updateUser(accountName, username, updater) {
  const users = readUsers();
  const key = getUserKey(accountName, username);
  const currentUser = users[key];
  if (!currentUser) return null;

  const nextUser = updater({ ...currentUser });
  users[key] = nextUser;
  writeUsers(users);
  return nextUser;
}

export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Session read failed", e);
    return null;
  }
}

export function isLoggedIn() {
  return !!getCurrentSession();
}

export function signUp(accountName, username, password) {
  const users = readUsers();
  const key = getUserKey(accountName, username);

  if (users[key]) {
    return { ok: false, message: "That account already exists. Log in instead." };
  }

  const session = { accountName: accountName.trim(), username: username.trim() };
  const now = new Date().toISOString();
  users[key] = {
    ...session,
    email: accountName.trim(),
    password: password.trim(),
    userId: createUniqueUserId(users, accountName, username),
    createdAt: now,
    // Marketplace fields
    isPro: false,
    proSince: null,
    profile: {
      bio: "",
      gender: "",
      picture: "",
      trustLevel: 0
    },
    blacklist: [],
    banned: false,
    bannedProducts: []
  };

  writeUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function logIn(accountName, username, password) {
  const users = readUsers();
  const key = getUserKey(accountName, username);
  const user = users[key];

  if (!user || user.password !== password.trim()) {
    return { ok: false, message: "Wrong account name, user name, or password." };
  }

  const session = { accountName: user.accountName, username: user.username };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  return getUserBySession(getCurrentSession());
}

export function getCurrentUserId() {
  const user = getCurrentUser();
  return user && user.userId ? String(user.userId) : "";
}

export function getCurrentUserEmail() {
  const user = getCurrentUser();
  return user && user.email ? String(user.email) : "";
}

export function isCurrentUserPro() {
  const user = getCurrentUser();
  return !!(user && user.isPro);
}

export function upgradeToPro() {
  const user = getCurrentUser();
  if (!user) return false;

  const users = readUsers();
  const key = getUserKey(user.accountName, user.username);
  if (users[key]) {
    users[key].isPro = true;
    users[key].proSince = new Date().toISOString();
    writeUsers(users);
    return true;
  }
  return false;
}

export function updateUserProfile(updates) {
  const user = getCurrentUser();
  if (!user) return false;

  const users = readUsers();
  const key = getUserKey(user.accountName, user.username);
  if (users[key]) {
    users[key].profile = { ...users[key].profile, ...updates };
    writeUsers(users);
    return true;
  }
  return false;
}

export function addToBlacklist(targetUserId) {
  const user = getCurrentUser();
  if (!user) return false;

  const users = readUsers();
  const key = getUserKey(user.accountName, user.username);
  if (users[key] && !users[key].blacklist.includes(targetUserId)) {
    users[key].blacklist.push(targetUserId);
    writeUsers(users);
    return true;
  }
  return false;
}

export function removeFromBlacklist(targetUserId) {
  const user = getCurrentUser();
  if (!user) return false;

  const users = readUsers();
  const key = getUserKey(user.accountName, user.username);
  if (users[key]) {
    users[key].blacklist = users[key].blacklist.filter(id => id !== targetUserId);
    writeUsers(users);
    return true;
  }
  return false;
}

export function getBlacklist() {
  const user = getCurrentUser();
  return user ? user.blacklist || [] : [];
}

export function banUser(targetUserId) {
  const users = readUsers();
  const targetUser = Object.values(users).find(u => u.userId === targetUserId);
  if (targetUser) {
    const key = getUserKey(targetUser.accountName, targetUser.username);
    users[key].banned = true;
    writeUsers(users);
    return true;
  }
  return false;
}

export function unbanUser(targetUserId) {
  const users = readUsers();
  const targetUser = Object.values(users).find(u => u.userId === targetUserId);
  if (targetUser) {
    const key = getUserKey(targetUser.accountName, targetUser.username);
    users[key].banned = false;
    writeUsers(users);
    return true;
  }
  return false;
}

export function banUserProduct(targetUserId, productId) {
  const users = readUsers();
  const targetUser = Object.values(users).find(u => u.userId === targetUserId);
  if (targetUser) {
    const key = getUserKey(targetUser.accountName, targetUser.username);
    if (!users[key].bannedProducts) users[key].bannedProducts = [];
    if (!users[key].bannedProducts.includes(productId)) {
      users[key].bannedProducts.push(productId);
      writeUsers(users);
      return true;
    }
  }
  return false;
}

export function unbanUserProduct(targetUserId, productId) {
  const users = readUsers();
  const targetUser = Object.values(users).find(u => u.userId === targetUserId);
  if (targetUser) {
    const key = getUserKey(targetUser.accountName, targetUser.username);
    if (users[key].bannedProducts) {
      users[key].bannedProducts = users[key].bannedProducts.filter(id => id !== productId);
      writeUsers(users);
      return true;
    }
  }
  return false;
}

export function verifyCurrentUserPassword(password) {
  const user = getCurrentUser();
  return !!(user && user.password === password.trim());
}

export function listAllUsers() {
  return Object.values(readUsers()).sort((a, b) => {
    const aTime = a.createdAt || "";
    const bTime = b.createdAt || "";
    return bTime.localeCompare(aTime);
  });
}

export function findUserByIdAndAccount(userId, accountName) {
  const users = Object.values(readUsers());
  const normalizedId = normalize(userId);
  const normalizedAccount = normalize(accountName);
  return users.find(user =>
    normalize(user.userId || "") === normalizedId &&
    normalize(user.accountName || "") === normalizedAccount
  ) || null;
}

export function verifyDeveloperAccess(code) {
  const valid = code.trim() === DEV_ACCESS_CODE;
  if (valid) {
    sessionStorage.setItem(DEV_SESSION_KEY, "1");
  }
  return valid;
}

export function isDeveloperSessionActive() {
  return sessionStorage.getItem(DEV_SESSION_KEY) === "1";
}

export function clearDeveloperSession() {
  sessionStorage.removeItem(DEV_SESSION_KEY);
}

export function getUserScopedStorageKey(baseKey, userId) {
  const normalizedUserId = normalize(userId || getCurrentUserId());
  if (!normalizedUserId) return baseKey;
  return `${baseKey}_${normalizedUserId}`;
}
