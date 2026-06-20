import { useAuth } from "./lib/AuthContext";
import AuthScreen from "./screens/AuthScreen";
import TeleportApp from "./TeleportApp";

// Teleport Financial — money seen in space and time.
// The passwordless front door (magic link / Google) is onboarding step 1.
// Once authenticated, the whole experience is TeleportApp.
export default function App() {
  const { session, loading, devBypass, setDevBypass } = useAuth();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF8",
          fontFamily: "-apple-system, Helvetica, Arial, sans-serif",
          color: "#767676",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        Teleport
      </div>
    );

  if (!session && !devBypass)
    return <AuthScreen dark={false} onSkip={() => setDevBypass(true)} />;

  return <TeleportApp />;
}
