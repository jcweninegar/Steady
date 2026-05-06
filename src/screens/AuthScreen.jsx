import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

const LIGHT = {
  bg:"#F7F4EF", card:"#FFFFFF", border:"rgba(0,0,0,0.07)", surface:"#F0EDE7",
  text:"#1A1714", sub:"#8A8680", muted:"#C4BFB8",
  accent:"#E9B84A", accentText:"#1A1714", accentSoft:"rgba(233,184,74,0.12)",
  divider:"rgba(0,0,0,0.06)",
  shadow:"0 1px 3px rgba(0,0,0,0.05),0 4px 14px rgba(0,0,0,0.04)",
};
const DARK = {
  bg:"#141210", card:"#1E1B18", border:"rgba(255,255,255,0.08)", surface:"#262320",
  text:"#F2EDE6", sub:"#7A7570", muted:"#3A3530",
  accent:"#E9B84A", accentText:"#141210", accentSoft:"rgba(233,184,74,0.11)",
  divider:"rgba(255,255,255,0.06)",
  shadow:"0 1px 3px rgba(0,0,0,0.3),0 4px 20px rgba(0,0,0,0.2)",
};

export default function AuthScreen({ dark }) {
  const T = dark ? DARK : LIGHT;
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
        setError("Google sign-in isn't configured yet. Use email below, or see setup instructions.");
      } else if (msg.includes("redirect")) {
        setError("Redirect URL not allowed. Please add your app URL in Supabase → Auth → URL Configuration.");
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

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}input{outline:none;-webkit-appearance:none;}button{-webkit-tap-highlight-color:transparent;}`}</style>
      <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100%",background:T.bg,fontFamily:"'DM Sans',-apple-system,sans-serif",overflow:"hidden"}}>

        {/* Logo */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 36px"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <div style={{fontSize:32,fontWeight:600,color:T.text,fontFamily:"'Lora',serif",letterSpacing:"-0.5px",marginBottom:10}}>
              steady<span style={{color:T.accent}}>.</span>
            </div>
            <div style={{fontSize:15,color:T.sub,lineHeight:1.5}}>
              Consistent progress toward<br/>what matters.
            </div>
          </div>

          {sent ? (
            <div style={{textAlign:"center",maxWidth:280}}>
              <div style={{fontSize:22,marginBottom:12}}>📬</div>
              <div style={{fontSize:16,fontWeight:500,color:T.text,marginBottom:8}}>Check your email</div>
              <div style={{fontSize:14,color:T.sub,lineHeight:1.6}}>
                We sent a sign-in link to <strong style={{color:T.text}}>{email}</strong>. Tap it to continue.
              </div>
            </div>
          ) : (
            <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:12}}>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{width:"100%",padding:"14px 20px",borderRadius:14,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:15,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:T.shadow,fontFamily:"'DM Sans',sans-serif",opacity:loading?0.6:1}}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}>
                <div style={{flex:1,height:1,background:T.divider}}/>
                <span style={{fontSize:12,color:T.muted}}>or</span>
                <div style={{flex:1,height:1,background:T.divider}}/>
              </div>

              {/* Email magic link */}
              {!showEmail ? (
                <button
                  onClick={() => setShowEmail(true)}
                  style={{width:"100%",padding:"14px 20px",borderRadius:14,border:"1px solid "+T.border,background:"transparent",color:T.sub,fontSize:14,fontWeight:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Sign in with email
                </button>
              ) : (
                <form onSubmit={handleMagicLink} style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    style={{width:"100%",padding:"14px 16px",borderRadius:14,border:"1px solid "+T.border,background:T.card,color:T.text,fontSize:15,fontFamily:"'DM Sans',sans-serif",boxShadow:T.shadow}}
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    style={{width:"100%",padding:"14px 20px",borderRadius:14,border:"none",background:T.accent,color:T.accentText,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:(loading||!email.trim())?0.5:1}}>
                    {loading ? "Sending…" : "Send sign-in link"}
                  </button>
                </form>
              )}

              {error && (
                <div style={{fontSize:13,color:"#C0504D",textAlign:"center",padding:"8px 0"}}>{error}</div>
              )}
            </div>
          )}
        </div>

        <div style={{padding:"0 36px 40px",textAlign:"center"}}>
          <div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>
            Your data is yours. We never sell it or share it.
          </div>
        </div>
      </div>
    </>
  );
}
