/* global fetch, FileReader */

const accessToken = prompt('Access Token');
const postID = prompt('Post ID');
const reactions = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'];

(function updateCounters() {
  const query = reactions.map((reaction) => {
    const code = 'reactions_' + reaction.toLowerCase();
    return `reactions.type(${reaction}).limit(0).summary(total_count).as(${code})`;
  }).join(',');
  const endpoint = `https://graph.facebook.com/v2.8/?ids=${postID}&fields=${query}&access_token=${accessToken}`;

  fetch(endpoint)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      }

      throw new Error(res.statusText);
    })
    .then((res) => {
      const post = res[postID];

      reactions
        .forEach((reaction) => {
          const reactionCounter = document.querySelector(`[data-reaction-counter-${reaction.toLowerCase()}]`);
          reactionCounter.textContent = post[`reactions_${reaction.toLowerCase()}`].summary.total_count;
        })
      ;
    })
    .catch((err) => console.error('An error occurred while fetching data from Facebook', err.message))
    .then(() => setTimeout(updateCounters, 5000))
  ;
})();

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
