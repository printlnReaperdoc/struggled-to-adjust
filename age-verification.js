// Age Verification Module
// Checks if user is 18+ before allowing access to the website

(function() {
  const AGE_VERIFICATION_KEY = 'ageVerified';
  const VERIFICATION_EXPIRY_DAYS = 30;

  function isAgeVerified() {
    const stored = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (!stored) return false;

    try {
      const data = JSON.parse(stored);
      const expiryDate = new Date(data.expiryDate);
      
      if (new Date() > expiryDate) {
        localStorage.removeItem(AGE_VERIFICATION_KEY);
        return false;
      }
      
      return data.verified === true;
    } catch (e) {
      return false;
    }
  }

  function setAgeVerified() {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + VERIFICATION_EXPIRY_DAYS);
    
    localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify({
      verified: true,
      expiryDate: expiryDate.toISOString()
    }));
  }

  function createAgeGateModal() {
    const modal = document.createElement('div');
    modal.id = 'age-gate-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="bg-gray-800 border-2 border-red-600 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl text-center">
        <h2 class="text-3xl font-bold text-red-500 mb-4">Age Verification</h2>
        
        <div class="bg-red-900/30 border border-red-600 rounded p-4 mb-6">
          <p class="text-gray-100 mb-3">
            This website contains <strong>mature content</strong> that is not suitable for minors.
          </p>
          <p class="text-gray-300 text-sm">
            By entering this site, you certify that you are <strong>18 years of age or older</strong>.
          </p>
        </div>

        <div class="space-y-3 mb-6">
          <div>
            <label class="block text-left text-gray-300 mb-2">Month</label>
            <select id="birth-month" class="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-3 py-2">
              <option value="" disabled selected>Select Month</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <div>
            <label class="block text-left text-gray-300 mb-2">Day</label>
            <input type="number" id="birth-day" min="1" max="31" placeholder="1-31" 
                   class="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-3 py-2">
          </div>

          <div>
            <label class="block text-left text-gray-300 mb-2">Year</label>
            <input type="number" id="birth-year" min="1900" max="2100" placeholder="YYYY" 
                   class="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-3 py-2">
          </div>
        </div>

        <div id="age-error" class="text-red-400 text-sm mb-4 hidden"></div>

        <div class="space-y-3">
          <button id="verify-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
            Verify Age
          </button>
          <button id="deny-btn" class="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-bold py-2 px-4 rounded transition">
            I'm Under 18 (Leave Site)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setupAgeGateListeners();
  }

  function setupAgeGateListeners() {
    const verifyBtn = document.getElementById('verify-btn');
    const denyBtn = document.getElementById('deny-btn');
    const monthInput = document.getElementById('birth-month');
    const dayInput = document.getElementById('birth-day');
    const yearInput = document.getElementById('birth-year');
    const errorDiv = document.getElementById('age-error');

    verifyBtn.addEventListener('click', function() {
      const month = monthInput.value;
      const day = dayInput.value;
      const year = yearInput.value;
      const errorMsg = document.getElementById('age-error');

      if (!month || !day || !year) {
        errorMsg.textContent = 'Please fill in all fields.';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (isAtLeast18(month, day, year)) {
        errorMsg.classList.add('hidden');
        setAgeVerified();
        removeAgeGateModal();
      } else {
        errorMsg.textContent = 'You must be 18 or older to access this site.';
        errorMsg.classList.remove('hidden');
      }
    });

    denyBtn.addEventListener('click', function() {
      window.location.href = 'restricted.html';
    });

    // Allow Enter key to submit
    [monthInput, dayInput, yearInput].forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          verifyBtn.click();
        }
      });
    });
  }

  function isAtLeast18(month, day, year) {
    const birthDate = new Date(year, parseInt(month) - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  }

  function removeAgeGateModal() {
    const modal = document.getElementById('age-gate-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.remove();
    }
  }

  function initializeAgeVerification() {
    // Don't show gate on load if already verified
    if (!isAgeVerified()) {
      createAgeGateModal();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAgeVerification);
  } else {
    initializeAgeVerification();
  }
})();
