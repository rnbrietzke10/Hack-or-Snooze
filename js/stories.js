'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

async function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${currentUser ? userFavStory(story.storyId) : ''}
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
  console.debug('putStoriesOnPage');

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
  const author = $('#author').val();
  const title = $('#title').val();
  const url = $('#url').val();
  // Get user info from local storage
  const user = localStorage.getItem('username');
  const userStory = {
    author,
    title,
    url,
  };

  const newStory = await storyList.addStory(user, userStory);
  const $newStoryMarkup = await generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStoryMarkup);

  $('#submit-story-form').trigger('reset');
  $submitStoryForm.slideUp('slow');
}

$('#submit-btn').on('click', getAndShowNewStory);

$allStoriesList.on('click', '.star', async function (evt) {
  const $eventTarget = $(evt.target);
  const clickedStoryId = $eventTarget.closest('li').attr('id');
  if (!$eventTarget.closest('.poly').hasClass('favorite')) {
    currentUser.addFavoriteStory(clickedStoryId);
    $eventTarget.closest('.poly').addClass('favorite');
  } else {
    currentUser.removeFavoriteStory(clickedStoryId);
    $eventTarget.closest('.poly').removeClass('favorite');
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
 *
 */
function renderStar(addClass = '') {
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
  return isFavoritedStory(storyId) ? renderStar('favorite') : renderStar();
}
