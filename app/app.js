/* global fetch, FileReader */

let accessToken;
let postID;
const reactions = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'];

const maxFails = 20;
let fails = 0;
function updateCounters() {
  const query = reactions.map((reaction) => {
    const code = 'reactions_' + reaction.toLowerCase();
    return `reactions.type(${reaction}).limit(0).summary(total_count).as(${code})`;
  }).join(',');
  const endpoint = `https://graph.facebook.com/v2.8/?ids=${postID}&fields=${query}&access_token=${accessToken}`;

  fetch(endpoint)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        throw new Error(res.error.message);
      }

      const post = res[postID];
      reactions
        .forEach((reaction) => {
          const reactionCounter = document.querySelector(`[data-reaction-counter-${reaction.toLowerCase()}]`);
          reactionCounter.textContent = post[`reactions_${reaction.toLowerCase()}`].summary.total_count;
        })
      ;
    })
    .catch((err) => console.error('An error occurred while fetching data from Facebook', err.message))
    .then(() => {
      fails += 1;

      if (fails < maxFails) {
        setTimeout(updateCounters, 5000);
      } else {
        console.error(`Failed to fetch data from Facebook ${maxFails} times, now aborting`);
      }
    })
  ;
}

const fileInputs = document.querySelectorAll('[type="file"]');
fileInputs.forEach((input) => {
  const wrapper = input.parentElement.parentElement;

  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target.result;
      wrapper.style.backgroundImage = `url('${base64}')`;
    };

    reader.readAsDataURL(file);
  });
});

const modal = document.querySelector('.modal');
const form = document.querySelector('form');
form.addEventListener('click', (event) => {
  if (event.target.classList.contains('link')) {
    event.target.parentElement.style.display = 'none';
    event.target.parentElement.nextElementSibling.style.display = 'block';
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = getFormValues(form, ['accessToken', 'appId', 'appSecret', 'postId']);

  if (values.appId && values.appSecret) {
    accessToken = `${values.appId}|${values.appSecret}`;
  } else if (values.accessToken) {
    accessToken = values.accessToken;
  }

  if (values.postId) {
    postID = values.postId;
  }

  if (accessToken && postID) {
    modal.style.display = 'none';
    updateCounters();
  }
});

function getFormValues(form, names) {
  return names.reduce((acc, name) => {
    acc[name] = form.querySelector(`[name=${name}]`).value;
    return acc;
  }, {});
}
