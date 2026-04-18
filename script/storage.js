import { STORAGE_KEY, answers, createDefaultAnswers } from "./state.js";
import { getCurrentUserId, getUserScopedStorageKey } from "./auth.js";
import { updateInputsFromAnswers, updateLivePreviewDebounced } from "./ui.js";

const PROJECTS_KEY = "smart_builder_projects_v2";
const CURRENT_PROJECT_KEY = "smart_builder_current_project_v2";

function readUserJson(key, fallback, userId = getCurrentUserId()) {
  try {
    const storageKey = getUserScopedStorageKey(key, userId || "");
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Storage read failed", e);
    return fallback;
  }
}

function writeUserJson(key, value, userId = getCurrentUserId()) {
  const storageKey = getUserScopedStorageKey(key, userId || "");
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function readGlobalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Global storage read failed", e);
    return fallback;
  }
}

function writeGlobalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Global storage write failed", e);
  }
}

function cloneAnswers(data) {
  return JSON.parse(JSON.stringify(data));
}

function makeProjectSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function getProjectTitle(data, fallback = "Untitled website") {
  return data.businessName?.trim() || fallback;
}

function createProjectRecord(ownerUserId, name = "Untitled website") {
  const now = new Date().toISOString();
  return {
    id: `${ownerUserId}-${makeProjectSuffix()}`,
    ownerUserId,
    name,
    createdAt: now,
    updatedAt: now,
    paid: false,
    downloaded: false,
    sharedFrom: "",
    data: createDefaultAnswers()
  };
}

function listProjects(userId = getCurrentUserId()) {
  const projects = readUserJson(PROJECTS_KEY, [], userId);
  return projects.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

function writeProjects(projects, userId = getCurrentUserId()) {
  writeUserJson(PROJECTS_KEY, projects, userId);
}

function getCurrentProjectId(userId = getCurrentUserId()) {
  return localStorage.getItem(getUserScopedStorageKey(CURRENT_PROJECT_KEY, userId));
}

function setCurrentProjectId(projectId, userId = getCurrentUserId()) {
  const key = getUserScopedStorageKey(CURRENT_PROJECT_KEY, userId);
  if (!projectId) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, projectId);
}

function getCurrentProject(userId = getCurrentUserId()) {
  const projectId = getCurrentProjectId(userId);
  if (!projectId) return null;
  return listProjects(userId).find(project => project.id === projectId) || null;
}

function createProject(name = "Untitled website", userId = getCurrentUserId()) {
  const projects = listProjects(userId);
  const project = createProjectRecord(userId, name);
  projects.unshift(project);
  writeProjects(projects, userId);
  setCurrentProjectId(project.id, userId);
  return project;
}

function saveCurrentProject(saveStatusEl) {
  const userId = getCurrentUserId();
  const projectId = getCurrentProjectId(userId);
  if (!projectId) return null;

  const projects = listProjects(userId);
  const projectIndex = projects.findIndex(project => project.id === projectId);
  if (projectIndex < 0) return null;

  const current = projects[projectIndex];
  const now = new Date().toISOString();
  projects[projectIndex] = {
    ...current,
    name: getProjectTitle(answers, current.name),
    updatedAt: now,
    data: cloneAnswers(answers)
  };

  writeProjects(projects, userId);
  if (saveStatusEl) saveStatusEl.textContent = `Saved to ${projects[projectIndex].name}.`;
  return projects[projectIndex];
}

function saveAnswersDebounced(saveStatusEl) {
  let timeoutId;
  return function innerSave() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try {
        saveCurrentProject(saveStatusEl);
      } catch (e) {
        console.warn("Save failed", e);
        if (saveStatusEl) saveStatusEl.textContent = "";
      }
    }, 200);
  };
}

function loadProject(projectId, userId = getCurrentUserId()) {
  const project = listProjects(userId).find(item => item.id === projectId);
  if (!project) return null;

  Object.assign(answers, createDefaultAnswers(), cloneAnswers(project.data || {}));
  setCurrentProjectId(project.id, userId);
  updateInputsFromAnswers();
  updateLivePreviewDebounced();
  return project;
}

function updateProject(projectId, updates, userId = getCurrentUserId()) {
  const projects = listProjects(userId);
  const index = projects.findIndex(project => project.id === projectId);
  if (index < 0) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeProjects(projects, userId);
  return projects[index];
}

function deleteProject(projectId, userId = getCurrentUserId()) {
  const projects = listProjects(userId);
  const project = projects.find(item => item.id === projectId);
  if (!project || project.downloaded) return false;

  writeProjects(projects.filter(item => item.id !== projectId), userId);
  if (getCurrentProjectId(userId) === projectId) {
    setCurrentProjectId("", userId);
  }
  return true;
}

function markCurrentProjectPaid() {
  const project = getCurrentProject();
  if (!project) return null;
  return updateProject(project.id, { paid: true });
}

function markCurrentProjectDownloaded() {
  const project = getCurrentProject();
  if (!project) return null;
  return updateProject(project.id, { downloaded: true, paid: true });
}

function copyProjectToUser(project, targetUserId) {
  const targetProjects = listProjects(targetUserId);
  const now = new Date().toISOString();
  const copiedProject = {
    ...project,
    id: `${targetUserId}-${makeProjectSuffix()}`,
    ownerUserId: targetUserId,
    createdAt: now,
    updatedAt: now,
    downloaded: false,
    sharedFrom: project.id
  };

  targetProjects.unshift(copiedProject);
  writeProjects(targetProjects, targetUserId);
  return copiedProject;
}

function loadAnswersFromStorage() {
  const userId = getCurrentUserId();
  const legacy = readUserJson(STORAGE_KEY, null, userId);
  if (!legacy || legacy.version !== 2 || !legacy.data) return;

  const currentProjects = listProjects(userId);
  if (currentProjects.length > 0) return;

  const migratedProject = createProject(getProjectTitle(legacy.data), userId);
  Object.assign(answers, createDefaultAnswers(), cloneAnswers(legacy.data));
  saveCurrentProject();
  updateInputsFromAnswers();
  updateLivePreviewDebounced();
  localStorage.removeItem(getUserScopedStorageKey(STORAGE_KEY, userId));
  return migratedProject;
}
