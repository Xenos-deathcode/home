// Marketplace functionality for Smart Website Builder
// Handles requests, auctions, trading, chat, and marketplace management

import { getCurrentUserId, getCurrentUser, isCurrentUserPro, readUsers, writeUsers } from "./auth.js";
import { readUserJson, writeUserJson } from "./storage.js";

// Storage keys for marketplace data
const MARKETPLACE_REQUESTS_KEY = "marketplace_requests_v1";
const MARKETPLACE_AUCTIONS_KEY = "marketplace_auctions_v1";
const MARKETPLACE_TRADES_KEY = "marketplace_trades_v1";
const MARKETPLACE_CHATS_KEY = "marketplace_chats_v1";

// ========== REQUESTS SYSTEM ==========

export function createRequest(title, description, budget) {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const requests = readUserJson(MARKETPLACE_REQUESTS_KEY, []);
  const request = {
    id: `${userId}-${Date.now()}`,
    userId,
    title: title.trim(),
    description: description.trim(),
    budget: parseFloat(budget) || 0,
    createdAt: new Date().toISOString(),
    status: "open", // open, in_progress, completed
    helperId: null,
    completedAt: null
  };

  requests.push(request);
  writeUserJson(MARKETPLACE_REQUESTS_KEY, requests);
  return request;
}

export function getAllRequests() {
  return readUserJson(MARKETPLACE_REQUESTS_KEY, []);
}

export function getOpenRequests() {
  return getAllRequests().filter(r => r.status === "open");
}

export function claimRequest(requestId) {
  if (!isCurrentUserPro()) return false;

  const userId = getCurrentUserId();
  const requests = getAllRequests();
  const requestIndex = requests.findIndex(r => r.id === requestId);

  if (requestIndex >= 0 && requests[requestIndex].status === "open") {
    requests[requestIndex].status = "in_progress";
    requests[requestIndex].helperId = userId;
    writeUserJson(MARKETPLACE_REQUESTS_KEY, requests);
    return true;
  }
  return false;
}

export function completeRequest(requestId) {
  const userId = getCurrentUserId();
  const requests = getAllRequests();
  const requestIndex = requests.findIndex(r => r.id === requestId && r.helperId === userId);

  if (requestIndex >= 0) {
    requests[requestIndex].status = "completed";
    requests[requestIndex].completedAt = new Date().toISOString();
    writeUserJson(MARKETPLACE_REQUESTS_KEY, requests);
    return true;
  }
  return false;
}

// ========== AUCTION SYSTEM ==========

export function createAuction(title, description, startingPrice, bidType, endsAt, minIncrement = 0.10) {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const auctions = readUserJson(MARKETPLACE_AUCTIONS_KEY, []);
  const auction = {
    id: `${userId}-${Date.now()}`,
    sellerId: userId,
    title: title.trim(),
    description: description.trim(),
    startingPrice: parseFloat(startingPrice) || 0,
    currentPrice: parseFloat(startingPrice) || 0,
    bidType, // "fixed" or "partial"
    minIncrement: parseFloat(minIncrement),
    bids: [],
    winnerId: null,
    status: "active", // active, ended, sold
    createdAt: new Date().toISOString(),
    endsAt: endsAt ? new Date(endsAt).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  auctions.push(auction);
  writeUserJson(MARKETPLACE_AUCTIONS_KEY, auctions);
  return auction;
}

export function getAllAuctions() {
  return readUserJson(MARKETPLACE_AUCTIONS_KEY, []);
}

export function placeBid(auctionId, bidAmount) {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const auctions = getAllAuctions();
  const auctionIndex = auctions.findIndex(a => a.id === auctionId);

  if (auctionIndex < 0 || auctions[auctionIndex].status !== "active") return false;

  const auction = auctions[auctionIndex];
  const bidValue = parseFloat(bidAmount);

  // Validate bid based on type
  if (auction.bidType === "fixed") {
    if (bidValue <= auction.currentPrice + auction.minIncrement) return false;
  } else { // partial
    if (bidValue <= auction.startingPrice) return false;
  }

  // Add bid
  auction.bids.push({
    userId,
    amount: bidValue,
    timestamp: new Date().toISOString()
  });

  // Update current price
  auction.currentPrice = bidValue;

  // Sort bids by amount descending
  auction.bids.sort((a, b) => b.amount - a.amount);

  writeUserJson(MARKETPLACE_AUCTIONS_KEY, auctions);
  return true;
}

export function endAuction(auctionId) {
  const auctions = getAllAuctions();
  const auctionIndex = auctions.findIndex(a => a.id === auctionId);

  if (auctionIndex >= 0) {
    const auction = auctions[auctionIndex];
    auction.status = "ended";

    if (auction.bids.length > 0) {
      auction.winnerId = auction.bids[0].userId;
      auction.status = "sold";
    }

    writeUserJson(MARKETPLACE_AUCTIONS_KEY, auctions);
    return auction;
  }
  return null;
}

// ========== TRADING SYSTEM ==========

export function createTradeOffer(targetUserId, title, description, offering, wanting) {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const trades = readUserJson(MARKETPLACE_TRADES_KEY, []);
  const trade = {
    id: `${userId}-${Date.now()}`,
    initiatorId: userId,
    targetUserId,
    title: title.trim(),
    description: description.trim(),
    offering: offering.trim(),
    wanting: wanting.trim(),
    status: "pending", // pending, accepted, rejected, completed
    createdAt: new Date().toISOString()
  };

  trades.push(trade);
  writeUserJson(MARKETPLACE_TRADES_KEY, trades);
  return trade;
}

export function getMyTrades() {
  const userId = getCurrentUserId();
  const trades = readUserJson(MARKETPLACE_TRADES_KEY, []);
  return trades.filter(t => t.initiatorId === userId || t.targetUserId === userId);
}

export function respondToTrade(tradeId, accept) {
  const userId = getCurrentUserId();
  const trades = readUserJson(MARKETPLACE_TRADES_KEY, []);
  const tradeIndex = trades.findIndex(t => t.id === tradeId && t.targetUserId === userId);

  if (tradeIndex >= 0) {
    trades[tradeIndex].status = accept ? "accepted" : "rejected";
    writeUserJson(MARKETPLACE_TRADES_KEY, trades);
    return true;
  }
  return false;
}

// ========== CHAT SYSTEM ==========

export function sendMessage(recipientId, message) {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const chats = readUserJson(MARKETPLACE_CHATS_KEY, {});
  const chatKey = [userId, recipientId].sort().join("_");

  if (!chats[chatKey]) {
    chats[chatKey] = {
      participants: [userId, recipientId],
      messages: []
    };
  }

  const chatMessage = {
    id: `${userId}-${Date.now()}`,
    senderId: userId,
    recipientId,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    read: false
  };

  chats[chatKey].messages.push(chatMessage);
  writeUserJson(MARKETPLACE_CHATS_KEY, chats);
  return chatMessage;
}

export function getChatWithUser(otherUserId) {
  const userId = getCurrentUserId();
  const chats = readUserJson(MARKETPLACE_CHATS_KEY, {});
  const chatKey = [userId, otherUserId].sort().join("_");

  return chats[chatKey] || { participants: [userId, otherUserId], messages: [] };
}

export function getMyChats() {
  const userId = getCurrentUserId();
  const chats = readUserJson(MARKETPLACE_CHATS_KEY, {});
  const myChats = [];

  Object.values(chats).forEach(chat => {
    if (chat.participants.includes(userId)) {
      myChats.push(chat);
    }
  });

  return myChats;
}

export function markMessagesRead(otherUserId) {
  const userId = getCurrentUserId();
  const chats = readUserJson(MARKETPLACE_CHATS_KEY, {});
  const chatKey = [userId, otherUserId].sort().join("_");

  if (chats[chatKey]) {
    chats[chatKey].messages.forEach(msg => {
      if (msg.recipientId === userId) {
        msg.read = true;
      }
    });
    writeUserJson(MARKETPLACE_CHATS_KEY, chats);
  }
}

// ========== UTILITY FUNCTIONS ==========

export function getProUsers() {
  const users = readUsers();
  return Object.values(users).filter(u => u.isPro && !u.banned);
}

export function getUserProfile(userId) {
  const users = readUsers();
  return Object.values(users).find(u => u.userId === userId);
}

export function canAccessMarketplace() {
  return isCurrentUserPro();
}