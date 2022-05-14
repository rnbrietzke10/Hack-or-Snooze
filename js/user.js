'use strict';

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug('login', evt);
  evt.preventDefault();

  // grab the username and password
  const username = $('#login-username').val();
  const password = $('#login-password').val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger('reset');

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $('.account-forms-container').hide();
}

$loginForm.on('submit', login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug('signup', evt);
  evt.preventDefault();

  const name = $('#signup-name').val();
  const username = $('#signup-username').val();
  const password = $('#signup-password').val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  $signupForm.trigger('reset');
  $('.account-forms-container').hide();
}

$signupForm.on('submit', signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug('logout', evt);

  removeOrAddLinks();
  localStorage.clear();
  location.reload();
}

$navLogOut.on('click', logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug('checkForRememberedUser');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);

  removeOrAddLinks();
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug('saveUserCredentialsInLocalStorage');
  if (currentUser) {
    localStorage.setItem('token', currentUser.loginToken);
    localStorage.setItem('username', currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

async function updateUIOnUserLogin() {
  console.debug('updateUIOnUserLogin');
  hidePageComponents();

  await putStoriesOnPage();
  $allStoriesList.show();
  updateNavOnLogin();
}

// Hide or show sumbit, favorites and my stories from navbar depending on if there is a current user.
function removeOrAddLinks() {
  const links = [$submitLink, $favLink, $myStoriesLink];
  if (currentUser) {
    links.forEach((link) => link.removeClass('hidden'));
    $('#nav-all').addClass('logged-in');
  } else {
    links.forEach((link) => link.addClass('hidden'));
    $('#nav-all').removeClass('logged-in');
  }
}

/**
 * Creates user profile HTML
 */
function userProfileHtml() {
  const stringDate = currentUser.createdAt.toString();
  const date = stringDate.substr(0, stringDate.indexOf('T'));
  return $(
    `<h4>User Profile Info</h4> <div id="user-info"><p id="user-name">Name: ${currentUser.name}</p><p id="user-username">Username: ${currentUser.username}</p><p id="user-account-created">Account Created: ${date}</p></div>`
  );
}

/**
 * Appends user profile HTML to page
 *  - Hides other components on page
 */

function putUserProfileOnPage() {
  hidePageComponents();
  const $profile = userProfileHtml();
  $userProfile.append($profile);
  $userProfile.show();
}

$body.on('click', '#nav-user-profile', putUserProfileOnPage);
