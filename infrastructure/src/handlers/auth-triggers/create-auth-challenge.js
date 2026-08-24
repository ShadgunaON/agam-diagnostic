const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.request.challengeName === 'CUSTOM_CHALLENGE') {
    if (event.request.session && event.request.session.length === 0) {
      // Generate a new 4-digit OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Here you would normally send the OTP via Amazon SNS or SES.
      // Since this is a restricted AWS sandbox environment without SNS setup, we log it.
      // In production, we MUST use SNS/SES.
      console.log(`[BLOCKED] SMS/Email Sandbox: OTP for ${event.request.userAttributes.phone_number || event.userName} is ${otpCode}`);

      // Pass the generated OTP to the verify Lambda (private challenge parameters)
      event.response.privateChallengeParameters = {
        otp: otpCode,
      };

      // Pass info to the client
      event.response.publicChallengeParameters = {
        message: 'OTP sent successfully',
      };
    } else if (
      event.request.session &&
      event.request.session.length >= 1 &&
      event.request.session.slice(-1)[0].challengeName === 'CUSTOM_CHALLENGE'
    ) {
      // If the user provided a wrong answer, preserve the same OTP
      const previousChallenge = event.request.session.slice(-1)[0];
      event.response.privateChallengeParameters = {
        otp: previousChallenge.challengeMetadata,
      };
      event.response.publicChallengeParameters = {
        message: 'Please try again',
      };
    }
  }
  return event;
};
