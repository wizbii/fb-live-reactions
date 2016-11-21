/* global fetch, FileReader */

var accessToken;
var postID;
var reactions = ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'];

var maxFails = 20;
var fails = 0;
function updateCounters() {
  var query = reactions.map(function(reaction) {
    var code = 'reactions_' + reaction.toLowerCase();
    return 'reactions.type(' + reaction + ').limit(0).summary(total_count).as(' + code + ')';
  }).join(',');
  var endpoint = 'https://graph.facebook.com/v2.8/?ids=' + postID + '&fields=' + query + '&access_token=' + accessToken;

  fetch(endpoint)
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      if (res.error) {
        throw new Error(res.error.message);
      }

      var post = res[postID];
      reactions
        .forEach(function(reaction) {
          var reactionCounter = document.querySelector('[data-reaction-counter-' + reaction.toLowerCase() + ']');
          reactionCounter.textContent = post['reactions_' + reaction.toLowerCase()].summary.total_count;
        })
      ;
    })
    .catch(function(err) {
      console.error('An error occurred while fetching data from Facebook', err.message);
    })
    .then(function() {
      fails += 1;

      if (fails < maxFails) {
        setTimeout(updateCounters, 5000);
      } else {
        console.error('Failed to fetch data from Facebook ' + maxFails + ' times, now aborting');
      }
    })
  ;
}

var fileInputs = document.querySelectorAll('[type="file"]');
fileInputs.forEach(function(input) {
  var wrapper = input.parentElement.parentElement;

  input.addEventListener('change', function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function(loadEvent) {
      var base64 = loadEvent.target.result;
      wrapper.style.backgroundImage = 'url(\'' + base64 + '\')';
    };

    reader.readAsDataURL(file);
  });
});

var modal = document.getElementById('modal');
var form = document.querySelector('form');
form.addEventListener('click', function(event) {
  if (event.target.classList.contains('link')) {
    event.target.parentElement.style.display = 'none';
    event.target.parentElement.nextElementSibling.style.display = 'block';
  }
});

form.addEventListener('submit', function(event) {
  event.preventDefault();
  var values = getFormValues(form, ['accessToken', 'appId', 'appSecret', 'postId']);

  if (values.appId && values.appSecret) {
    accessToken = values.appId + '|' + values.appSecret;
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
  return names.reduce(function(acc, name) {
    acc[name] = form.querySelector('[name=' + name + ']').value;
    return acc;
  }, {});
}
