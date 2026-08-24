exports.handler = async (event) => {
  if (event.request.session.length === 0) {
    // Custom auth started, challenge the user with CUSTOM_CHALLENGE
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  } else if (
    event.request.session.length === 1 &&
    event.request.session[0].challengeName === 'CUSTOM_CHALLENGE' &&
    event.request.session[0].challengeResult === true
  ) {
    // Challenge succeeded, issue tokens
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else if (
    event.request.session.length >= 3 &&
    event.request.session.slice(-1)[0].challengeResult === false
  ) {
    // Failed 3 times, reject authentication
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  } else {
    // Wrong challenge result, try again
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  }
  return event;
};
