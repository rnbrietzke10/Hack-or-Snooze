"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  await putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

async function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${currentUser ? await userFavStory(story.storyId) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = await generateStoryMarkup(story);

    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**Get story information from sumbit story form */
async function getAndShowNewStory(evt) {
  evt.preventDefault();
  // Get form data: author, title, url
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();
  // Get user info from local storage
  const user = localStorage.getItem("username");
  const userStory = {
    author,
    title,
    url,
  };

  const newStory = await storyList.addStory(user, userStory);
  currentUser.ownStories.push(newStory);
  const $newStoryMarkup = await generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStoryMarkup);

  $("#submit-story-form").trigger("reset");
  $submitStoryForm.slideUp("slow");
}

$("#submit-btn").on("click", getAndShowNewStory);

/**
 * On click of star will change background to show if the story is a favorite of the user
 *
 */

$allStoriesList.on("click", ".star", async function (evt) {
  const $eventTarget = $(evt.target);

  const clickedStoryId = $eventTarget.closest("li").attr("id");
  if (!$eventTarget.closest(".poly").hasClass("favorite")) {
    const storyFound = storyList.stories.find(
      story => story.storyId === clickedStoryId
    );
    await currentUser.addFavoriteStory(storyFound);
    $eventTarget.closest(".poly").addClass("favorite");
  } else {
    const storyFound = storyList.stories.find(
      story => story.storyId === clickedStoryId
    );
    await currentUser.removeFavoriteStory(storyFound);
    $eventTarget.closest(".poly").removeClass("favorite");
  }
});

function isFavoritedStory(favStoryId) {
  const userFavoriteStories = currentUser.favorites;
  for (let story of userFavoriteStories) {
    if (favStoryId === story.storyId) {
      return true;
    }
  }
  return false;
}

/***
 *  Function that creates HTML for favorite star
 *  - accepts class to change fill if start is in users favorite list.
 */
function renderStar(addClass = "") {
  return `
    <svg
      class="cls-1 star"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 150.04 142.71"
    >
      <g class="Layer_2" data-name="Layer 2">
        <g class="Layer_1-2" data-name="Layer 1">
          <polygon
            class="cls-1 poly ${addClass}"
            points="40.21 90.21 5.37 56.27 53.5 49.27 75.02 5.65 96.55 49.26 144.68 56.24 109.86 90.2 118.09 138.13 75.04 115.51 31.99 138.15 40.21 90.21"
          />
          <path
            class="cls-1"
            d="M75,9,94.86,49.22l.7,1.41,1.56.23,44.34,6.43L109.38,88.57l-1.13,1.1.27,1.55,7.58,44.16L76.44,114.54l-1.4-.73-1.4.73L34,135.4l7.57-44.16.27-1.55-1.13-1.1L8.6,57.32l44.34-6.45,1.56-.23.7-1.41L75,9m0-6.78L52.5,47.89,2.15,55.22,38.59,90.73,30,140.88l45-23.69,45,23.67-8.61-50.15,36.43-35.53L97.53,47.87,75,2.26Z"
          />
        </g>
      </g>
    </svg>`;
}

function userFavStory(storyId) {
  return isFavoritedStory(storyId) ? renderStar("favorite") : renderStar();
}

/**
 * Adds favorite stories on page after click of favorites link
 * - Hides other page components
 */

async function putFavStoriesOnPage() {
  hidePageComponents();
  $favStoriesList.empty();
  const favStories = currentUser.favorites;
  if (favStories.length === 0) {
    $favStoriesList.append($("<p>No favorites added!</p>"));
  } else {
    for (let story of favStories) {
      const $favStoryMarkup = await generateStoryMarkup(story);
      $favStoriesList.prepend($favStoryMarkup);
    }
  }
  $favStoriesList.show();
}

$favLink.on("click", putFavStoriesOnPage);

/**
 * Adds user stories on page after click of my stories link
 * - Hides other page components
 */

async function showMyStories() {
  hidePageComponents();
  $myStoriesList.empty();
  if (currentUser.ownStories.length === 0) {
    $myStoriesList.append($(`<p>No stories added by user yet!</p>`));
  } else {
    const myStories = currentUser.ownStories;
    for (let story of myStories) {
      const $myStoryMarkUp = await generateStoryMarkup(story);
      $myStoryMarkUp.prepend(
        $(
          '<svg id="delete-story" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">  <rect id="rect-body" class="cls-rect-1" x="11.248" y="11.123" width="28.78" height="33.786" rx="6.182"/>  <rect id="rect-6" class="cls-2" x="16.521" y="18.912" width="3.5" height="22.45" rx="2.279"/>  <rect id="rect-5" class="cls-2" x="24.385" y="18.912" width="3.5" height="22.45" rx="2.279"/>  <rect id="rect-4" class="cls-2" x="31.5" y="18.855" width="3.5" height="22.45" rx="2.279"/>  <rect id="can-handle" class="cls-3" x="18.093" y="6.399" width="14.882" height="8.214" rx="3.333"/>  <rect id="can-top" class="cls-rect-1" x="7.598" y="11.162" width="36.781" height="6.268" rx="3.134"/></svg>'
        )
      );
      $myStoriesList.prepend($myStoryMarkUp);
    }
  }
  $myStoriesList.show();
}

$myStoriesLink.on("click", showMyStories);

/**
 * Function to remove user story
 * - gets story id
 * - uses story to remove story from storylist and API
 */

async function removeMyStory(evt) {
  const $eventTarget = evt.target;
  const storyListItem = $eventTarget.closest("li");
  const $storyId = $(storyListItem).attr("id");
  await storyList.removeStory($storyId);
  await showMyStories();
}

$body.on("click", "#delete-story", removeMyStory);
