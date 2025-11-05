// popup.js

// Wait for the entire HTML document to be loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
  
  // === API Configuration ===
  const API_URL = 'http://localhost:5000/api';

  // === Get All DOM Elements (Now safely inside) ===
  const mainView = document.getElementById('main-view');
  const loginView = document.getElementById('login-view');
  const registerView = document.getElementById('register-view');
  const messageDiv = document.getElementById('message-div');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const showRegisterLink = document.getElementById('show-register-link');
  const showLoginLink = document.getElementById('show-login-link');

  const analyzeBtn = document.getElementById('analyze-btn');
  const profileBtn = document.getElementById('profile-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  const resumeForm = document.getElementById('resume-form');
  const resumeUploadInput = document.getElementById('resume-upload');

  // === View Switching Logic ===
  function showView(viewName) {
    mainView.style.display = 'none';
    loginView.style.display = 'none';
    registerView.style.display = 'none';

    if (viewName === 'main') mainView.style.display = 'block';
    if (viewName === 'login') loginView.style.display = 'block';
    if (viewName === 'register') registerView.style.display = 'block';
  }

  // === Message Helpers ===
  function showMessage(message, isError = false) {
    messageDiv.textContent = message;
    messageDiv.style.color = isError ? 'red' : 'green';
  }
  function clearMessage() {
    messageDiv.textContent = '';
  }

  function updateResumeStatus(filename) {
  const statusText = document.getElementById('resume-filename-text');
  if (filename && filename.trim() !== "") {
    statusText.textContent = filename;
    statusText.style.color = '#007bff';
  } else {
    statusText.textContent = 'No resume on file.';
    statusText.style.color = '#555';
  }
}

  // === Main "Am I Logged In?" Check ===
  // (This runs right away when the DOM is ready)
  chrome.storage.local.get(['authToken', 'resumeFilename'], (result) => {
    if (result.authToken) {
      updateResumeStatus(result.resumeFilename);
      showView('main');
    } else {
      showView('login');
    }
  });

  // === All Event Listeners ===

  // View switchers
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
    clearMessage();
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('login');
    clearMessage();
  });

  // 1. Handle Registration
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showMessage('Registration successful! Please log in.', false);
      showView('login'); // Flip to login view
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  // 2. Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      chrome.storage.local.set({ authToken: data.token, resumeFilename: data.user.resumeFilename }, () => {
        console.log('Token and user info saved.');
        updateResumeStatus(data.user.resumeFilename);
        showView('main');
      });

    } catch (error) {
      showMessage(error.message, true);
    }
  });

  // 3. Handle Logout
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['authToken', 'resumeFilename'], () => {
      console.log('Token and user info removed.');
      showView('login');
      clearMessage();
    });
  });

  // 4. Handle Profile Button (This is the "Upload Resume" button)
  resumeUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadResume(file);
    }
  });

  // 5. Handle Analyze Button (The one that was broken)
  analyzeBtn.addEventListener('click', () => {
    console.log("Analyze button clicked!"); // <-- I've added this log for you
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;
    
    chrome.runtime.sendMessage({ type: "ANALYZE_JOB" });
  });

  // 6. Handle Resume Upload Function
  async function uploadResume(file) {
    clearMessage();
    showMessage('Uploading resume...', false);

    try {
      const { authToken } = await chrome.storage.local.get(['authToken']);
      if (!authToken) {
        return showMessage('You must be logged in to upload.', true);
      }

      const formData = new FormData();
      formData.append('resume', file); 

      const response = await fetch(`${API_URL}/profile/upload-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

     showMessage('Resume uploaded successfully!', false);

  // Save the new filename to storage and update the UI
    chrome.storage.local.set({ resumeFilename: data.resumeFilename });
    updateResumeStatus(data.resumeFilename);
    resumeForm.reset(); // Clear the file input
  // =========================

    } catch (error) {
      showMessage(error.message, true);
    }
  }

  // 7. Listener for Final Result (from background.js)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.success === true) {
      window.close();
    } else if (message.success === false) {
      showMessage(message.error, true);
      analyzeBtn.textContent = 'Analyze this Job';
      analyzeBtn.disabled = false;
    }
  });

}); // <-- The entire file is wrapped in this
