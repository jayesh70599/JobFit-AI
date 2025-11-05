// scrapers/glassdoor.js
(function() {
  console.log("SCRAPER: glassdoor.js INJECTED and RUNNING.");

  function getJobDetails() {
    try {
      // --- THIS IS A GUESS! ---
      // You must find the real selector by Inspecting the page.
      // Try [data-testid="jobDescriptionContent"] or [aria-label="Job description"]
      const selector = '.JobDetails_jobDescription__uW_fK'; 
      
      const descriptionElement = document.querySelector(selector);
      
      if (!descriptionElement) {
        console.error("SCRAPER: Could not find Glassdoor selector:", selector);
        chrome.runtime.sendMessage({ type: "SCRAPE_ERROR", payload: { error: "Glassdoor selector is wrong. Please inspect the page and update scrapers/glassdoor.js" } });
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
  
  // These sites load dynamically, so we wait 500ms
  // A MutationObserver is better, but this is simpler
  setTimeout(getJobDetails, 500); 
})();