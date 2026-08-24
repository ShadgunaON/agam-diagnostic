exports.handler = async (event) => {
  const expectedOtp = event.request.privateChallengeParameters.otp;
  const providedOtp = event.request.challengeAnswer;
  
  if (expectedOtp && providedOtp && expectedOtp === providedOtp) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  return event;
};
