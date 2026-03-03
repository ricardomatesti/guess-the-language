const messageIncludes = (source: string, candidate: string) =>
  source.toLowerCase().includes(candidate.toLowerCase());

export const normalizeAuthError = (error: unknown): string => {
  if (!(error instanceof Error)) return "Something went wrong. Please try again.";

  const message = error.message;

  if (
    messageIncludes(message, "Invalid login credentials") ||
    messageIncludes(message, "invalid_credentials")
  ) {
    return "Invalid email or password.";
  }

  if (messageIncludes(message, "Email not confirmed")) {
    return "Your email is not verified yet. Check your inbox before logging in.";
  }

  if (messageIncludes(message, "User already registered")) {
    return "This email is already registered. Try logging in instead.";
  }

  if (messageIncludes(message, "Password should be")) {
    return "Your password does not meet the security requirements.";
  }

  if (
    messageIncludes(message, "expired") ||
    messageIncludes(message, "invalid")
  ) {
    return "This recovery link is invalid or expired. Request a new one.";
  }

  return message;
};
