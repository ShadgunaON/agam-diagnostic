import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';
import { IAuthRepository } from '@/domains/auth/repository';
import { UserProfile } from '@/domains/auth/model';
import { Result, success, failure } from '@/shared/result';
import {
  ValidationError,
  UnauthorizedError,
  ServerError,
  NotFoundError,
  NetworkError,
} from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';
import { env } from '@/config/env';

const SESSION_STORAGE_KEY_PREFIX = '_agam_cognito_auth_session_';

export class ApiAuthRepository implements IAuthRepository {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly clientId: string;

  constructor(private readonly apiClient: IApiClient) {
    this.clientId = env.cognitoClientId;
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: env.cognitoRegion,
    });
  }

  private getStoredSession(email: string): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(`${SESSION_STORAGE_KEY_PREFIX}${email.toLowerCase()}`);
  }

  private setStoredSession(email: string, session: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`${SESSION_STORAGE_KEY_PREFIX}${email.toLowerCase()}`, session);
  }

  private clearStoredSession(email: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY_PREFIX}${email.toLowerCase()}`);
  }

  private storeTokens(authResult: { AccessToken?: string; IdToken?: string; RefreshToken?: string }): void {
    if (typeof window === 'undefined') return;
    if (authResult.AccessToken) {
      sessionStorage.setItem('cognito_access_token', authResult.AccessToken);
    }
    if (authResult.IdToken) {
      sessionStorage.setItem('cognito_id_token', authResult.IdToken);
    }
    if (authResult.RefreshToken) {
      sessionStorage.setItem('cognito_refresh_token', authResult.RefreshToken);
    }
  }

  /**
   * Signs in a user using native Cognito USER_AUTH with PASSWORD first-factor.
   */
  async signInWithPassword(
    email: string,
    password: string
  ): Promise<Result<{ user: UserProfile; accessToken: string } | { needsNewPassword: true; session: string; email: string }>> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return failure(new ValidationError('Please enter a valid email address.'));
    }
    if (!password) {
      return failure(new ValidationError('Please enter your password.'));
    }

    try {
      const initCommand = new InitiateAuthCommand({
        AuthFlow: 'USER_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: cleanEmail,
          PASSWORD: password,
          PREFERRED_CHALLENGE: 'PASSWORD',
        },
      });

      const initResponse = await this.cognitoClient.send(initCommand);

      let authResult = initResponse.AuthenticationResult;

      // Handle USER_AUTH PASSWORD challenge if returned
      if (!authResult && initResponse.ChallengeName === 'PASSWORD' && initResponse.Session) {
        const challengeCommand = new RespondToAuthChallengeCommand({
          ChallengeName: 'PASSWORD',
          ClientId: this.clientId,
          Session: initResponse.Session,
          ChallengeResponses: {
            USERNAME: cleanEmail,
            PASSWORD: password,
          },
        });

        const challengeResponse = await this.cognitoClient.send(challengeCommand);
        authResult = challengeResponse.AuthenticationResult;

        // Check if the PASSWORD challenge led to NEW_PASSWORD_REQUIRED
        if (!authResult && challengeResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED' && challengeResponse.Session) {
          return success({
            needsNewPassword: true as const,
            session: challengeResponse.Session,
            email: cleanEmail,
          });
        }

        if (!authResult && challengeResponse.ChallengeName) {
          return failure(
            new UnauthorizedError(`Additional authentication challenge required: ${challengeResponse.ChallengeName}`)
          );
        }
      } else if (!authResult && initResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED' && initResponse.Session) {
        // Direct NEW_PASSWORD_REQUIRED from initial auth (FORCE_CHANGE_PASSWORD user)
        return success({
          needsNewPassword: true as const,
          session: initResponse.Session,
          email: cleanEmail,
        });
      } else if (!authResult && initResponse.ChallengeName) {
        return failure(
          new UnauthorizedError(`Unexpected authentication challenge: ${initResponse.ChallengeName}`)
        );
      }

      if (authResult && authResult.AccessToken) {
        return this.buildUserFromAuthResult(authResult, cleanEmail);
      }

      return failure(new UnauthorizedError('Authentication could not be completed with the provided credentials.'));
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Completes the NEW_PASSWORD_REQUIRED challenge for invited employees.
   * Called after signInWithPassword returns { needsNewPassword: true }.
   */
  async completeNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string
  ): Promise<Result<{ user: UserProfile; accessToken: string }>> {
    const cleanEmail = email.trim().toLowerCase();

    if (!newPassword || newPassword.length < 8) {
      return failure(new ValidationError('Password must be at least 8 characters with uppercase, lowercase, and numbers.'));
    }

    try {
      const challengeCommand = new RespondToAuthChallengeCommand({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: this.clientId,
        Session: session,
        ChallengeResponses: {
          USERNAME: cleanEmail,
          NEW_PASSWORD: newPassword,
        },
      });

      const challengeResponse = await this.cognitoClient.send(challengeCommand);
      const authResult = challengeResponse.AuthenticationResult;

      if (authResult && authResult.AccessToken) {
        return this.buildUserFromAuthResult(authResult, cleanEmail);
      }

      return failure(new UnauthorizedError('Password change was not completed. Please try again.'));
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Extracts user profile and tokens from a successful Cognito AuthenticationResult.
   * Shared between signInWithPassword and completeNewPasswordChallenge.
   */
  private buildUserFromAuthResult(
    authResult: { AccessToken?: string; IdToken?: string; RefreshToken?: string },
    cleanEmail: string
  ): Result<{ user: UserProfile; accessToken: string }> {
    this.storeTokens(authResult);

    let role = 'patient';
    let fullName = cleanEmail.split('@')[0];
    let sub = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    let mobile = '';
    let resolvedEmail = cleanEmail;
    let staffId: string | undefined = undefined;

    if (authResult.IdToken) {
      try {
        const parts = authResult.IdToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            typeof atob !== 'undefined'
              ? atob(parts[1])
              : Buffer.from(parts[1], 'base64').toString('utf8')
          );
          if (payload.sub) sub = payload.sub;
          if (payload.name) fullName = payload.name;
          if (payload.email) resolvedEmail = payload.email;
          if (payload.phone_number) mobile = payload.phone_number;
          if (payload['custom:staff_id']) staffId = payload['custom:staff_id'];

          const rawGroups = payload['cognito:groups'];
          const groups = Array.isArray(rawGroups)
            ? rawGroups
            : typeof rawGroups === 'string'
            ? rawGroups.split(',').map((g: string) => g.trim())
            : [];

          if (payload['custom:role']) {
            role = payload['custom:role'];
          } else if (
            groups.some(
              (g: string) =>
                g.toLowerCase() === 'admingroup' || g.toLowerCase() === 'admin'
            )
          ) {
            role = 'admin';
          } else if (
            groups.some(
              (g: string) =>
                g.toLowerCase() === 'staffgroup' || g.toLowerCase() === 'doctor'
            )
          ) {
            role = 'doctor';
          } else if (groups.includes('lab_tech')) {
            role = 'lab_tech';
          }
        }
      } catch {
        // fallback to defaults
      }
    }

    const user: UserProfile = {
      id: sub,
      fullName,
      email: resolvedEmail,
      mobile,
      role: role as UserProfile['role'],
      isProfileComplete: true,
      staffId: staffId || (role !== 'patient' ? sub : undefined),
      savedPatients: [
        {
          id: `pat_${sub}`,
          name: fullName || 'Myself',
          relation: 'Myself',
          age: '30',
          gender: 'Male',
        },
      ],
      savedAddresses: [],
    };

    return success({
      user,
      accessToken: authResult.AccessToken!,
    });
  }

  /**
   * Registers a new user with Cognito using Email and Password.
   * Only attaches phone_number attribute if explicitly provided by the user.
   */
  async signUpWithPassword(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<Result<{ isSignUpComplete: boolean; userId?: string }>> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return failure(new ValidationError('Please enter a valid email address.'));
    }
    if (!password || password.length < 8) {
      return failure(new ValidationError('Password must be at least 8 characters with uppercase, lowercase, and numbers.'));
    }
    if (!cleanName) {
      return failure(new ValidationError('Please enter your full name.'));
    }

    const userAttributes: AttributeType[] = [
      { Name: 'email', Value: cleanEmail },
      { Name: 'name', Value: cleanName },
    ];

    // Only include phone_number if user actually provided a valid phone number
    if (phone && phone.trim().length > 0) {
      const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
      userAttributes.push({ Name: 'phone_number', Value: formattedPhone });
    }

    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: cleanEmail,
        Password: password,
        UserAttributes: userAttributes,
      });

      const response = await this.cognitoClient.send(command);
      return success({
        isSignUpComplete: !!response.UserConfirmed,
        userId: response.UserSub,
      });
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Confirms user signup with verification code sent by Cognito.
   */
  async confirmSignUp(email: string, code: string): Promise<Result<boolean>> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanCode) {
      return failure(new ValidationError('Please enter the confirmation code sent to your email.'));
    }

    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: cleanEmail,
        ConfirmationCode: cleanCode,
      });

      await this.cognitoClient.send(command);
      return success(true);
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Initiates forgot password reset flow via Cognito.
   */
  async forgotPassword(email: string): Promise<Result<boolean>> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return failure(new ValidationError('Please enter a valid email address.'));
    }

    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: cleanEmail,
      });

      await this.cognitoClient.send(command);
      return success(true);
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Confirms password reset with code and new password.
   */
  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<Result<boolean>> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanCode) {
      return failure(new ValidationError('Please enter the reset code sent to your email.'));
    }
    if (!newPassword || newPassword.length < 8) {
      return failure(new ValidationError('New password must be at least 8 characters with uppercase, lowercase, and numbers.'));
    }

    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: cleanEmail,
        ConfirmationCode: cleanCode,
        Password: newPassword,
      });

      await this.cognitoClient.send(command);
      return success(true);
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Initiates native Cognito EMAIL_OTP authentication flow (USER_AUTH).
   */
  async sendEmailOtp(email: string): Promise<Result<boolean>> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return failure(new ValidationError('Please enter a valid email address.'));
    }

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: cleanEmail,
          PREFERRED_CHALLENGE: 'EMAIL_OTP',
        },
      });

      const response = await this.cognitoClient.send(command);

      if (response.ChallengeName === 'EMAIL_OTP' && response.Session) {
        this.setStoredSession(cleanEmail, response.Session);
        return success(true);
      }

      return failure(
        new ServerError('Cognito returned an unexpected challenge type. Please check pool settings.')
      );
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  /**
   * Responds to the native Cognito EMAIL_OTP challenge with the user-supplied verification code.
   */
  async verifyEmailOtp(
    email: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      return failure(new ValidationError('Please enter the verification code sent to your email.'));
    }

    const session = this.getStoredSession(cleanEmail);
    if (!session) {
      return failure(new UnauthorizedError('Authentication session expired or not found. Please request a new code.'));
    }

    try {
      const command = new RespondToAuthChallengeCommand({
        ChallengeName: 'EMAIL_OTP',
        ClientId: this.clientId,
        Session: session,
        ChallengeResponses: {
          USERNAME: cleanEmail,
          EMAIL_OTP_CODE: cleanOtp,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (response.AuthenticationResult && response.AuthenticationResult.AccessToken) {
        this.storeTokens(response.AuthenticationResult);
        this.clearStoredSession(cleanEmail);

        const user: UserProfile = {
          id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          fullName: registrationData?.fullName || cleanEmail.split('@')[0],
          email: cleanEmail,
          mobile: registrationData?.mobile || '',
          gender: registrationData?.gender,
          dobOrAge: registrationData?.dobOrAge,
          role: 'patient',
          isProfileComplete: !!registrationData?.fullName,
          savedPatients: registrationData?.fullName
            ? [
                {
                  id: `pat_${Date.now()}`,
                  name: registrationData.fullName,
                  relation: 'Myself',
                  age: registrationData.dobOrAge || '30',
                  gender: registrationData.gender || 'Male',
                },
              ]
            : [],
          savedAddresses: [],
        };

        return success({
          success: true,
          isNewUser: !registrationData?.fullName,
          user,
        });
      }

      if (response.ChallengeName === 'EMAIL_OTP' && response.Session) {
        this.setStoredSession(cleanEmail, response.Session);
        return failure(new ValidationError('Invalid verification code. Please check the code and try again.'));
      }

      return failure(new UnauthorizedError('Authentication challenge could not be completed.'));
    } catch (err: unknown) {
      return failure(this.mapCognitoError(err));
    }
  }

  async sendOtp(identifier: string): Promise<Result<boolean>> {
    return this.sendEmailOtp(identifier);
  }

  async verifyOtp(
    identifier: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    return this.verifyEmailOtp(identifier, otp, registrationData);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile>> {
    return this.apiClient.put<UserProfile>(`/api/patients/me`, data).then(
      (res) => success(res.data),
      (err) => failure(new ServerError(err.message || 'Failed to update profile'))
    );
  }

  async createMockAccount(_user: UserProfile): Promise<Result<void>> {
    return failure(new ServerError('Mock account creation is disabled in production mode.'));
  }

  /**
   * Sanitizes and maps AWS Cognito errors to application domain error classes.
   */
  private mapCognitoError(err: unknown): Error {
    if (typeof err !== 'object' || err === null) {
      return new ServerError('An unexpected authentication error occurred.');
    }

    const errObj = err as { name?: string; message?: string };
    const name = errObj.name || '';
    const message = errObj.message || '';

    switch (name) {
      case 'UserNotFoundException':
        return new NotFoundError('No account found with this email address.');
      case 'UsernameExistsException':
        return new ValidationError('An account with this email address already exists.');
      case 'InvalidPasswordException':
        return new ValidationError('Password does not meet complexity requirements (min 8 chars, uppercase, lowercase, numbers).');
      case 'NotAuthorizedException':
        if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('password')) {
          return new UnauthorizedError('Incorrect email or password.');
        }
        if (message.toLowerCase().includes('code')) {
          return new ValidationError('Invalid verification code. Please try again.');
        }
        return new UnauthorizedError('Authentication failed. Please check your credentials.');
      case 'UserNotConfirmedException':
        return new ValidationError('Your account is not confirmed yet. Please verify your email code.');
      case 'CodeMismatchException':
        return new ValidationError('Invalid verification code. Please check your inbox.');
      case 'ExpiredCodeException':
        return new ValidationError('Verification code has expired. Please request a new code.');
      case 'TooManyRequestsException':
      case 'LimitExceededException':
        return new ServerError('Too many attempts. Please wait a few minutes before trying again.');
      case 'InvalidParameterException':
        return new ValidationError(message || 'Invalid parameters supplied.');
      default:
        if (name === 'NetworkError' || message.toLowerCase().includes('network')) {
          return new NetworkError('Unable to connect to authentication server. Please check your connection.');
        }
        return new ServerError('Authentication service temporarily unavailable. Please try again.');
    }
  }
}
