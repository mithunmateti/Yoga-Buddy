// =============================================================
// theme.js — light mode and dark mode.
//
// Loaded in the <head> of every page, BEFORE anything is drawn, so the
// page never flashes the wrong colours.
//
// The choice is saved in this browser (localStorage "yogaBuddyTheme"):
//   "light" or "dark" — always that
//   nothing (Auto)    — follow the phone's or laptop's own setting
//
// It puts data-theme="light" or data-theme="dark" on <html>. style.css
// (section 20) swaps the colours for dark mode.
//
// Controls that use it:
//   • any button with data-theme-toggle (the ☀️/🌙 button on the home screen)
//   • radio buttons named "theme" (Auto / Light / Dark on the Settings page)
// =============================================================

(function () {
  var SAVE_NAME = "yogaBuddyTheme";
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  // "auto", "light" or "dark"
  function chosen() {
    try {
      var saved = localStorage.getItem(SAVE_NAME);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (error) {
      // storage blocked: Auto
    }
    return "auto";
  }

  // What is really shown: "light" or "dark"
  function shown() {
    var choice = chosen();
    if (choice !== "auto") {
      return choice;
    }
    return systemDark && systemDark.matches ? "dark" : "light";
  }

  function apply() {
    var theme = shown();
    var html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.style.colorScheme = theme;

    // The colour of the phone's top bar. (The practice screen doesn't load
    // this file: it is always dark.)
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#101917" : "#FBF8F3");
    }
    updateControls();
  }

  function save(choice) {
    try {
      if (choice === "light" || choice === "dark") {
        localStorage.setItem(SAVE_NAME, choice);
      } else {
        localStorage.removeItem(SAVE_NAME);
      }
    } catch (error) {
      // storage blocked: it still changes for now
    }
    apply();
  }

  // Show the right icon on the toggle and tick the right radio button
  function updateControls() {
    var theme = shown();
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      var next = theme === "dark" ? "light" : "dark";
      buttons[i].textContent = theme === "dark" ? "☀️" : "🌙";
      buttons[i].setAttribute("aria-label", "Switch to " + next + " mode");
      buttons[i].setAttribute("title", "Switch to " + next + " mode");
    }
    var radios = document.querySelectorAll('input[name="theme"]');
    for (var j = 0; j < radios.length; j++) {
      radios[j].checked = radios[j].value === chosen();
    }
  }

  // Set the colours straight away (this script runs in the <head>)
  apply();

  // When the phone or laptop switches between light and dark by itself
  if (systemDark) {
    var onSystemChange = function () {
      if (chosen() === "auto") {
        apply();
      }
    };
    if (systemDark.addEventListener) {
      systemDark.addEventListener("change", onSystemChange);
    } else if (systemDark.addListener) {
      systemDark.addListener(onSystemChange);   // older Safari
    }
  }

  // Once the page is built: hook up the buttons
  document.addEventListener("DOMContentLoaded", function () {
    apply();
    document.addEventListener("click", function (event) {
      var button = event.target.closest && event.target.closest("[data-theme-toggle]");
      if (button) {
        save(shown() === "dark" ? "light" : "dark");
      }
    });
    document.addEventListener("change", function (event) {
      if (event.target.name === "theme") {
        save(event.target.value);
      }
    });
  });

  // Another tab changed it: follow along
  window.addEventListener("storage", function (event) {
    if (event.key === SAVE_NAME) {
      apply();
    }
  });
})();
