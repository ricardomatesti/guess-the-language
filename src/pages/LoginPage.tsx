import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../game/components/shared/Button";
import { useGameStore } from "../game/store/useGameStore";
import { AuthLayout } from "./AuthLayout";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { authStatus, signInWithEmailPassword } = useGameStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigate("/profile");
    }
  }, [authStatus, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailPassword(email.trim(), password);
      navigate("/profile");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Could not log in."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Could not continue with Google."
      );
      setLoading(false);
    }
  };
*/

  return (
    <AuthLayout>
      <div className="w-full max-w-lg bg-[#56CBF9]/40 rounded-2xl p-8 shadow-lg mt-12">
        <h1 className="text-3xl font-black text-blue-900 mb-3">Log in</h1>
        <p className="text-blue-900/70 mb-6">
          Access your synced profile and stats.
        </p>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white focus:outline-none"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-4 py-3 rounded-xl bg-white focus:outline-none"
            disabled={loading}
          />
          <Button
            bg="#1FB6FF"
            shadow="#0676a2"
            hover="#4fc6ff"
            textColor="#FFFFFF"
            text={loading ? "Logging in..." : "Log in"}
            size="md"
          />
        </form>

        <div className="flex justify-end mb-4">
          <Link
            className="text-blue-900/70 font-semibold underline"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        {/*  not added google auth config yet
       <div className="my-4 text-blue-900/60 text-center font-bold">OR</div>

        <Button
          bg="#FFFFFF"
          shadow="#C9D6DF"
          hover="#EAF6FF"
          textColor="#0F172A"
          text={loading ? "Please wait..." : "Continue with Google"}
          size="md"
          tailwindClasses="w-full"
          onClick={() => {
            void handleGoogleLogin();
          }}
        />*/}

        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

        <div className="mt-6 flex flex-col gap-2 text-center">
          <Link
            className="text-blue-900/70 font-semibold underline"
            to="/signup"
          >
            Need an account? Sign up
          </Link>
          <button
            type="button"
            className="text-blue-900/70 font-semibold underline"
            onClick={() => navigate("/")}
          >
            Continue as guest
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
