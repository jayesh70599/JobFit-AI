// scrapers/indeed.js
(function() {
  console.log("SCRAPER: indeed.js INJECTED and RUNNING.");

  function getJobDetails() {
    try {
      // Indeed uses a very stable ID, which is perfect for us.
      //const selector = '#jobDescriptionText';

       const selector = '.jobsearch-JobComponent-description';
      
      const descriptionElement = document.querySelector(selector);
      
      if (!descriptionElement) {
        console.error("SCRAPER: Could not find Indeed selector:", selector);
        chrome.runtime.sendMessage({ type: "SCRAPE_ERROR", payload: { error: "Could not find job description element on page." } });
        return;
      }
      
      const jobText = descriptionElement.innerText; // Use .innerText for clean text
      
      if (!jobText || jobText.trim() === "") {
        console.error("SCRAPER: Found element, but it has no text.");
        return;
      }
      
      console.log("SCRAPER: Element found! Sending job text.");
      chrome.runtime.sendMessage({ type: "JOB_DATA", payload: { jobText: jobText } });

    } catch (error) {
      console.error("SCRAPER: Error in getJobDetails:", error.message);
      chrome.runtime.sendMessage({ type: "SCRAPE_ERROR", payload: { error: error.message } });
    }
  }

  // Indeed loads everything at once, so we don't need a
  // complex MutationObserver, but we'll wait for the window
  // to be fully loaded just to be safe.
  if (document.readyState === "complete") {
    getJobDetails();
  } else {
    window.addEventListener('load', getJobDetails);
  }

})();