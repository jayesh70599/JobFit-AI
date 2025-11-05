// scrapers/ziprecruiter.js
(function() {
  console.log("SCRAPER: ziprecruiter.js INJECTED and RUNNING.");

  function getJobDetails() {
    try {
      // --- THIS IS A GUESS! ---
      // You must find the real selector by Inspecting the page.
      // Try finding a class that contains "job_description"
      const selector = '.job-body';
      
      const descriptionElement = document.querySelector(selector);
      
      if (!descriptionElement) {
        console.error("SCRAPER: Could not find ZipRecruiter selector:", selector);
        chrome.runtime.sendMessage({ type: "SCRAPE_ERROR", payload: { error: "ZipRecruiter selector is wrong. Please inspect the page and update scrapers/ziprecruiter.js" } });
        return;
      }
      
      const jobText = descriptionElement.innerText;
      console.log("SCRAPER: Element found! Sending job text.");
      chrome.runtime.sendMessage({ type: "JOB_DATA", payload: { jobText: jobText } });

    } catch (error) {
      // ... (error handling) ...
      console.error("SCRAPER: Error in getJobDetails:", error.message);
      chrome.runtime.sendMessage({ type: "SCRAPE_ERROR", payload: { error: error.message } });
    }
  }

  // These sites load dynamically
  setTimeout(getJobDetails, 500); 
})();