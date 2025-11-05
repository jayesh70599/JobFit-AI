// This script runs *inside* the LinkedIn page

(function() {
  console.log("SCRAPER: linkedin.js INJECTED and RUNNING.");
  
  function getJobDetails() {
    try {
      // --- RESILIENT SELECTOR ---
      // We are targeting the element that holds the description.
      // LinkedIn uses dynamic classes, so we find a stable parent.
      // As of late 2025, '.jobs-description-content__text' is a stable element.
      // A more resilient selector might be `[aria-label="Job description"]` if it exists.
      
      const descriptionElement = document.querySelector('#job-details');
     console.log("SCRAPER: descriptionElement found:", descriptionElement);
      
      if (!descriptionElement) {
        // Content might not be loaded yet. We'll use a MutationObserver.
        console.log("SCRAPER: Element not found. Setting up MutationObserver.");
        observeForDescription();
        return;
      }
      
      const jobText = descriptionElement.innerText; // Get clean text, not HTML
      console.log("SCRAPER: Element found! Sending job text.");
      
      // Send the data back to our background.js
      chrome.runtime.sendMessage({ type: "JOB_DATA", payload: { jobText: jobText } });

    } catch (error) {
      chrome.runtime.sendMessage({ type: "SCRAPE_ERROR", payload: { error: error.message } });
      console.error("SCRAPER: Error in getJobDetails:", error.message);
    }
  }

  function observeForDescription() {
    // --- DYNAMIC CONTENT HANDLER ---
    // This watches the page for changes and runs our scrape *after*
    // LinkedIn's JavaScript has finished loading the job description.
    
    const targetNode = document.body; // Watch the whole body for simplicity
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutationsList, obs) => {
      // Look for our target element
      const descriptionElement = document.querySelector('.jobs-description-content__text');
      
      if (descriptionElement) {
        // We found it! Stop observing and run the scrape.
        console.log("SCRAPER: Found element via MutationObserver!");
        obs.disconnect();
        getJobDetails();
      }
    });

    observer.observe(targetNode, config);
  }

  // Start the process
  getJobDetails();

})();