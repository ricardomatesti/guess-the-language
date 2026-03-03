import { useEffect, type ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Game } from "./game/components/Game";
import { useIsMobile } from "./game/hooks/useIsMobile";
import { useGameStore } from "./game/store/useGameStore";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignUpPage } from "./pages/SignUpPage";
import { isSupabaseEnabled, supabase } from "./lib/supabase";

function App() {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const {
    setMobile,
    setAuthSession,
    mergeLocalStatsIfNeeded,
    hydrateCloudStats,
    retryPendingSync,
    authStatus,
  } = useGameStore();

  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setAuthSession(null);
      return;
    }

    let active = true;

    void (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !active) return;

      setAuthSession(data.session);
      if (data.session?.user) {
        await mergeLocalStatsIfNeeded();
        await hydrateCloudStats();
        await retryPendingSync();
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setAuthSession(session);
        if (session?.user) {
          void (async () => {
            await mergeLocalStatsIfNeeded();
            await hydrateCloudStats();
            await retryPendingSync();
          })();
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [
    setAuthSession,
    mergeLocalStatsIfNeeded,
    hydrateCloudStats,
    retryPendingSync,
  ]);

  return (
    <div className="bg-[#B2E6FF] w-screen min-h-dvh h-fit bg-cover bg-center relative flex flex-col patron">
      <Routes>
        <Route path="/" element={<Game />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute authStatus={authStatus}>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute authStatus={authStatus}>
              <SignUpPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute authStatus={authStatus}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

const ProtectedRoute = ({
  authStatus,
  children,
}: {
  authStatus: "disabled" | "loading" | "authenticated" | "unauthenticated";
  children: ReactElement;
}) => {
  if (authStatus === "loading") {
    return <div className="w-full text-center mt-10">Loading session...</div>;
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({
  authStatus,
  children,
}: {
  authStatus: "disabled" | "loading" | "authenticated" | "unauthenticated";
  children: ReactElement;
}) => {
  if (authStatus === "loading") {
    return <div className="w-full text-center mt-10">Loading session...</div>;
  }

  if (authStatus === "authenticated") {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default App;
