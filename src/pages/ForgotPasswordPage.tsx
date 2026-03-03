import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../game/components/shared/Button";
import { useGameStore } from "../game/store/useGameStore";
import { AuthLayout } from "./AuthLayout";

export const ForgotPasswordPage = () => {
  const { sendPasswordReset } = useGameStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccess(
        "If this email exists, you'll receive a password recovery email shortly.",
      );
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Could not send reset email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg bg-[#56CBF9]/40 rounded-2xl p-8 shadow-lg mt-12">
        <h1 className="text-3xl font-black text-blue-900 mb-3">Forgot password</h1>
        <p className="text-blue-900/70 mb-6">
          We will send you a reset link if the account exists.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
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
            text={loading ? "Sending..." : "Send reset link"}
            size="md"
          />
        </form>

        {success && <p className="text-emerald-700 mt-4 text-sm">{success}</p>}
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

        <div className="mt-6 text-center">
          <Link className="text-blue-900/70 font-semibold underline" to="/login">
            Back to log in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
