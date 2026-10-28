// =============================================================
// profile.js — asks who is using Yoga Buddy: name, age, gender and address.
//
// It is asked once each time someone opens the app (it is kept in
// sessionStorage, which the browser forgets when the tab is closed),
// so at the fair every new visitor is asked. "Not you?" on the home
// screen lets the next person enter their own details.
// Nothing leaves this device.
// =============================================================

const PROFILE_NAME = "yogaBuddyProfile";

// The details of the person using the app, or null if not asked yet
function getProfile() {
  try {
    return JSON.parse(sessionStorage.getItem(PROFILE_NAME));
  } catch (error) {
    return null;
  }
}

function saveProfile(profile) {
  try {
    sessionStorage.setItem(PROFILE_NAME, JSON.stringify(profile));
  } catch (error) {
    // storage blocked: the details are only used on this page
  }
  window.yogaProfile = profile;
}

// Show the form on top of the page. When it is filled in, call done(profile).
function askProfile(done) {
  const box = document.createElement("div");
  box.className = "profile-overlay";
  box.innerHTML = `
    <form class="profile-form">
      <h2>Welcome to Yoga Buddy 🙏</h2>
      <p>Tell us a little about you before you start.</p>

      <label for="profile-name">Your name</label>
      <input id="profile-name" type="text" maxlength="30" autocomplete="off" required>

      <label for="profile-age">Your age</label>
      <input id="profile-age" type="number" inputmode="numeric" min="4" max="110" required>

      <p class="profile-label">Gender</p>
      <div class="profile-choices">
        <label><input type="radio" name="gender" value="Male" required> Male</label>
        <label><input type="radio" name="gender" value="Female"> Female</label>
        <label><input type="radio" name="gender" value="Other"> Other</label>
      </div>

      <label for="profile-address">Your address</label>
      <textarea id="profile-address" rows="2" maxlength="200" autocomplete="off"
                placeholder="Street, area, city" required></textarea>

      <button class="button" type="submit">Let's start</button>
    </form>
  `;
  document.body.appendChild(box);
  document.getElementById("profile-name").focus();

  box.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();   // don't reload the page
    const profile = {
      name: document.getElementById("profile-name").value.trim(),
      age: Number(document.getElementById("profile-age").value),
      gender: box.querySelector("input[name=gender]:checked").value,
      address: document.getElementById("profile-address").value.trim()
    };
    saveProfile(profile);
    box.remove();
    done(profile);
  });
}

// When the page opens: ask, unless this person has already told us.
// (The home page asks after its start page instead: data-ask-later.)
window.yogaProfile = getProfile();
if (!window.yogaProfile && !document.body.hasAttribute("data-ask-later")) {
  askProfile(function () {
    document.dispatchEvent(new Event("profilechange"));
  });
}
