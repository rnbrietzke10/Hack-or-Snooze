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

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <img src="./assets/Asset2.svg" class="star" alt="Favorite Star" />
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

function putStoriesOnPage() {
  console.debug('putStoriesOnPage');

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
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

  const token = localStorage.getItem('token');
  const userStory = {
    author,
    title,
    url,
  };

  const newStory = await storyList.addStory(user, userStory);
  const $newStoryMarkup = generateStoryMarkup(newStory);
  $allStoriesList.prepend($newStoryMarkup);
}

$('#submit-btn').on('click', getAndShowNewStory);

$allStoriesList.on('click', '.star', async function (evt) {
  const currUser = await getUser(
    localStorage.getItem('username'),
    localStorage.getItem('token')
  );
  const userFavoriteStories = currUser.data.user.favorites;
  console.log(userFavoriteStories);
  console.log(currUser);
  const imgSrc = evt.target.attributes.src.value;
  if (imgSrc === './assets/Asset2.svg') {
    const clickedStoryId = evt.target.parentElement.id;
    User.addFavoriteStory(clickedStoryId);
    evt.target.attributes.src.value = './assets/Asset1.svg';
    console.log(evt.target.attributes);
    console.log(imgSrc);
  }
});
