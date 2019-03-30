
// This is a test utility to get the deta for a specified blog
// For executing the test, provide the required parameters in configurations. 
const {google} = require('googleapis');

/* configurations for the client authentication for google apis. exports client_id, secret and api_key */
const api_creds = require('../server/configs/googleapi'); // file not included as part of the source.

// Each API may support multiple version. With this sample, we're getting
// v3 of the blogger API, and using an API key to authenticate.
const blogger = google.blogger({
  version: 'v3',
  auth: api_creds.api_key
});

const params = {
  url: 'https://asrmytestblog.blogspot.com/'
};

// get the blog details
blogger.blogs.getByUrl(params, (err, res) => {
  if (err) {
    console.error(err);
    throw err;
  }
  
  console.log(`The blog url is ${res.data.id}. The total number of items is ${res.data.posts.totalItems}.`);
});
