import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../game/components/shared/Button";
import { useGameStore } from "../game/store/useGameStore";
import { isSupabaseEnabled } from "../lib/supabase";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { authStatus, signInWithEmail, signInWithGoogle } = useGameStore();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigate("/profile");
    }
  }, [authStatus, navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter an email.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim());
      setMessage("Magic link sent. Check your inbox.");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Could not send magic link."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Could not sign in with Google."
      );
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-lg bg-[#56CBF9]/40 rounded-2xl p-8 shadow-lg mt-12">
        <h1 className="text-3xl font-black text-blue-900 mb-3">
          Sign up / Log in
        </h1>
        <p className="text-blue-900/70 mb-6">
          Keep your streak synced across devices.
        </p>

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white focus:outline-none"
            disabled={loading}
          />
          <Button
            bg="#1FB6FF"
            shadow="#0676a2"
            hover="#4fc6ff"
            textColor="#FFFFFF"
            text={loading ? "Sending..." : "Send magic link"}
            size="md"
          />
        </form>

        {/* Google Auth Button - not adding it yet

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
            void handleGoogleSignIn();
          }}
        />*/}

        {message && <p className="text-emerald-700 mt-4 text-sm">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-900/70 font-semibold underline"
            onClick={() => navigate("/")}
          >
            Continue as guest
          </button>
        </div>
      </div>
    </Layout>
  );
};

const Layout = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <div className="relative z-1 w-full h-fit flex flex-col justify-start items-center mb-4">
      {children}
    </div>
  );
};
