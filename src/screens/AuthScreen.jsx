import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

// Teleport design system — locked palette, hairlines + whitespace, no shadows,
// no fills, no gradients, no off-palette color, no rounded gold buttons.
const C = {
  black: "#111111", grey1: "#444444", grey2: "#767676", grey3: "#ABABAB",
  white: "#FFFFFF", paper: "#FAFAF8", recessed: "#F1F1ED", quiet: "#E3E3DE", red: "#C42B1C",
};
const FONT = "-apple-system, Helvetica, Arial, sans-serif";

export default function AuthScreen({ onSkip }) {
  const { signInWithGoogle, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmail, setShowEmail] = useState(false);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      const msg = e?.message || "";
      if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
        setError("Google sign-in isn't configured yet. Use email below.");
      } else if (msg.includes("redirect")) {
        setError("Redirect URL not allowed. Add your app URL in Supabase → Auth → URL Configuration.");
      } else {
        setError(msg || "Couldn't connect to Google. Try email below instead.");
      }
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await signInWithMagicLink(email.trim());
      setSent(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const btnBase = {
    width: "100%", padding: "14px 20px", borderRadius: 8, fontSize: 15,
    cursor: "pointer", fontFamily: FONT, textAlign: "center",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", background: C.recessed, height: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", maxWidth: 412, background: C.paper, fontFamily: FONT, overflow: "hidden" }}>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 36px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.black, letterSpacing: "-0.5px", marginBottom: 12 }}>
              Teleport
            </div>
            <div style={{ fontSize: 15, color: C.grey2, lineHeight: 1.55 }}>
              See your money in space and time —<br />your whole life, across the years.
            </div>
          </div>

          {sent ? (
            <div style={{ textAlign: "center", maxWidth: 300 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: C.grey2, marginBottom: 10 }}>Check your email</div>
              <div style={{ fontSize: 14, color: C.grey1, lineHeight: 1.6 }}>
                We sent a sign-in link to <strong style={{ color: C.black }}>{email}</strong>. Tap it to continue.
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{ ...btnBase, border: `1px solid ${C.quiet}`, background: C.white, color: C.black, fontWeight: 500, opacity: loading ? 0.5 : 1 }}>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: C.quiet }} />
                <span style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: C.grey3 }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.quiet }} />
              </div>

              {/* Email magic link */}
              {!showEmail ? (
                <button
                  onClick={() => setShowEmail(true)}
                  style={{ ...btnBase, border: `1px solid ${C.quiet}`, background: "transparent", color: C.grey1, fontWeight: 400 }}>
                  Sign in with email
                </button>
              ) : (
                <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: `1px solid ${C.quiet}`, background: C.white, color: C.black, fontSize: 15, fontFamily: FONT, outline: "none" }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    style={{ ...btnBase, border: "none", background: C.black, color: C.white, fontWeight: 600, opacity: (loading || !email.trim()) ? 0.4 : 1 }}>
                    {loading ? "Sending…" : "Send sign-in link"}
                  </button>
                </form>
              )}

              {error && (
                <div style={{ fontSize: 13, color: C.red, textAlign: "center", padding: "8px 0", lineHeight: 1.5 }}>{error}</div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "0 36px 40px", textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 12, color: C.grey3, lineHeight: 1.6 }}>
            Your data is yours. We never sell it or share it.
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{ background: "none", border: "none", color: C.grey3, fontSize: 12, cursor: "pointer", fontFamily: FONT, padding: "4px 0", textDecoration: "underline", textUnderlineOffset: 4 }}>
              Skip for now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
