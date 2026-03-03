import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../game/components/shared/Button";
import { useGameStore } from "../game/store/useGameStore";
import { AuthLayout } from "./AuthLayout";

const passwordIsValid = (password: string) =>
  password.length >= 8 && /\d/.test(password);

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword } = useGameStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError("Please complete both password fields.");
      return;
    }

    if (!passwordIsValid(password)) {
      setError("Password must be at least 8 characters and include at least 1 number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess("Password updated successfully. You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Could not reset your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg bg-[#56CBF9]/40 rounded-2xl p-8 shadow-lg mt-12">
        <h1 className="text-3xl font-black text-blue-900 mb-3">Reset password</h1>
        <p className="text-blue-900/70 mb-6">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-3 rounded-xl bg-white focus:outline-none"
            disabled={loading}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 rounded-xl bg-white focus:outline-none"
            disabled={loading}
          />

          <Button
            bg="#1FB6FF"
            shadow="#0676a2"
            hover="#4fc6ff"
            textColor="#FFFFFF"
            text={loading ? "Updating..." : "Update password"}
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
