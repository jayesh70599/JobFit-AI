// results/results.js

document.addEventListener('DOMContentLoaded', () => {

 const keywordsContainer = document.getElementById('keywords-container');

  const matchScoreElement = document.getElementById('match-score');
  const reasoningElement = document.getElementById('score-reasoning');

  const strengthsList = document.getElementById('strengths-list');
  const weaknessesList = document.getElementById('weaknesses-list');
  const tipsList = document.getElementById('tips-list');

  // Helper function to populate a list
  function populateList(listElement, items) {
    if (!items || items.length === 0) {
      listElement.innerHTML = '<li>N/A</li>';
      return;
    }
    listElement.innerHTML = items.map(item => `<li>${item}</li>`).join('');
  }

  // 1. Get the 'lastAnalysis' data we saved in background.js
  chrome.storage.local.get(['lastAnalysis'], (result) => {
    if (result.lastAnalysis) {

      const { matchScore, scoreReasoning, strengths, weaknesses, actionable_tips, missingKeywords } = result.lastAnalysis;
      
      // 2. Populate the new scorecard
      matchScoreElement.innerText = `${matchScore}%`;
      reasoningElement.innerText = scoreReasoning;

      // Bonus: Change circle color based on score
      if (matchScore < 50) {
        matchScoreElement.style.color = '#dc3545';
        matchScoreElement.style.borderColor = '#dc3545';
      } else if (matchScore < 75) {
        matchScoreElement.style.color = '#ffc107';
        matchScoreElement.style.borderColor = '#ffc107';
      } else {
        matchScoreElement.style.color = '#28a745';
        matchScoreElement.style.borderColor = '#28a745';
      }

      // 2. Populate the HTML
      populateList(strengthsList, strengths);
      populateList(weaknessesList, weaknesses);
      populateList(tipsList, actionable_tips);

      if (missingKeywords && missingKeywords.length > 0) {
        keywordsContainer.innerHTML = missingKeywords.map(keyword => 
          `<span class="keyword-pill">${keyword}</span>`
        ).join('');
      } else {
        keywordsContainer.innerHTML = '<span class="keyword-pill">None found!</span>';
      }

      // 3. (Optional) Clear the storage so it's not stale
      chrome.storage.local.remove('lastAnalysis');
    } else {
      // Handle error - no analysis found
      document.querySelector('h1').innerText = 'Error: No Analysis Found';
    }
  });
});

