type SignUpRedirect = {
  type: "success";
  path: string;
  message: string;
};

export function getSignUpRedirect(session: unknown): SignUpRedirect {
  if (session) {
    return {
      type: "success",
      path: "/dashboard",
      message: "Thanks for signing up!",
    };
  }

  return {
    type: "success",
    path: "/sign-up",
    message: "Check your email to confirm your account before signing in.",
  };
}
