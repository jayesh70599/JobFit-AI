// background.js

// === API Configuration ===
// Use localhost for development and a real URL for production
const API_URL = 'http://localhost:5000/api/analyze';
// const API_URL = 'https://my-job-matcher-api.com/api/analyze';

// Listen for the "ANALYZE_JOB" message from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_JOB") {
    console.log("BG: 'ANALYZE_JOB' message received from popup.");
    handleAnalyzeJob(sendResponse);
    return true; // Indicates an asynchronous response
  }
  
  // NEW: Listen for the "JOB_DATA" message from the content scraper
  if (message.type === "JOB_DATA") {
    handleJobData(message.payload, sendResponse);
    return true; // Indicates an asynchronous response
  }
  
  // NEW: Listen for any scraping errors
  if (message.type === "SCRAPE_ERROR") {
    // We can't do anything with this data, so just log it for debugging
    console.error('Scraping Error:', message.payload.error);
    // Note: We don't 'sendResponse' here as the popup is waiting 
    // for the 'ANALYZE_JOB' response, which will eventually fail.
  }
});

function handleAnalyzeJob(sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab.url) {
      sendResponse({ success: false, error: "Cannot analyze this page." });
      return;
    }

    // === THIS IS THE NEW LOGIC ===
    let scriptToInject;
    const url = tab.url;

    if (url.includes("linkedin.com/jobs/collections/")) {
      scriptToInject = "scrapers/linkedin.js";
    } else if (url.includes("indeed.com/jobs")) { // <-- NEW
      scriptToInject = "scrapers/indeed.js";
    } else if (url.includes("glassdoor.co.in/Job")) { // <-- NEW
      scriptToInject = "scrapers/glassdoor.js";
    } else if (url.includes("ziprecruiter.in/jobs/")) { // <-- NEW
      scriptToInject = "scrapers/ziprecruiter.js";
    } else {
      console.error("BG: URL not supported:", url);
      sendResponse({ success: false, error: "Job site not supported." });
      return;
    }
    // ============================
    
    console.log("BG: Injecting script:", scriptToInject);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [scriptToInject]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("BG: Failed to inject scraper:", chrome.runtime.lastError.message);
        sendResponse({ success: false, error: "Failed to inject scraper." });
      } else {
        console.log("BG: Script injected successfully. Awaiting JOB_DATA...");
      }
    });
  });
}

// NEW: This function talks to our MERN backend
// background.js

async function handleJobData(payload) {
  try {
    const { jobText } = payload;
    
    // 1. Get token (same as before)
    const { authToken } = await chrome.storage.local.get(['authToken']);
    if (!authToken) {
      return notifyPopup({ success: false, error: "Not logged in." });
    }

    // 2. Make API call (same as before)
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ jobText: jobText })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const aiAnalysis = await response.json();
    
    // 3. === THIS IS THE UPDATE ===
    // Store the analysis for the results page to read
    await chrome.storage.local.set({ lastAnalysis: aiAnalysis });

    // Open the results.html page in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL("results/results.html")
    });
    
    // Tell the popup to close itself
    notifyPopup({ success: true });

  } catch (error) {
    console.error('Error in handleJobData:', error);
    notifyPopup({ success: false, error: error.message });
  }
}

// NEW: Helper function to send the *final* result to the popup
function notifyPopup(message) {
  // This sends a message to the popup.js listener
  // We need to query for the popup's "view"
  const views = chrome.extension.getViews({ type: "popup" });
  if (views.length > 0) {
    // This assumes the popup is open. A more complex system
    // would handle the case where it's not.
    // For now, this is robust enough.
    chrome.runtime.sendMessage(message);
  }
}