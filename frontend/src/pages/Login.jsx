import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot password flow states: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    if (api.auth.isAuthenticated()) {
      navigate("/app");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.auth.login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.auth.forgotPassword(forgotEmail);
      setSuccess("A 6-digit verification code has been dispatched to your Gmail.");
      setMode("reset");
    } catch (err) {
      setError(err.message || "Failed to request reset. Verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.auth.resetPassword(forgotEmail, code, newPassword);
      setSuccess("Password updated successfully! Log in with your new credentials.");
      setMode("login");
      setEmail(forgotEmail);
      setPassword("");
      // Clear fields
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  const S = {
    container: {
      background: "linear-gradient(135deg, #0A0A0F 0%, #10101E 50%, #0F0A00 100%)",
      color: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    },
    card: {
      background: "rgba(22, 22, 42, 0.7)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 107, 0, 0.2)",
      borderRadius: "16px",
      padding: "40px",
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.05)",
      zIndex: 10,
    },
    logo: {
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      fontWeight: "bold",
      color: "#FF6B00",
      textAlign: "center",
      marginBottom: "8px",
      letterSpacing: "2px",
    },
    subTitle: {
      color: "#888",
      fontSize: "14px",
      textAlign: "center",
      marginBottom: "32px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontSize: "12px",
      color: "#AAA",
      marginBottom: "6px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    input: {
      width: "100%",
      background: "rgba(10, 10, 15, 0.8)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      padding: "12px 16px",
      color: "#FFF",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
    btn: {
      width: "100%",
      background: "#FF6B00",
      color: "#FFF",
      border: "none",
      borderRadius: "8px",
      padding: "14px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "15px",
      marginTop: "10px",
      transition: "transform 0.15s, background-color 0.2s",
      boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)",
    },
    error: {
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      color: "#EF4444",
      borderRadius: "6px",
      padding: "10px",
      fontSize: "13px",
      marginBottom: "20px",
      textAlign: "center",
    },
    success: {
      background: "rgba(34, 197, 94, 0.1)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      color: "#22C55E",
      borderRadius: "6px",
      padding: "10px",
      fontSize: "13px",
      marginBottom: "20px",
      textAlign: "center",
    },
    linkContainer: {
      marginTop: "24px",
      textAlign: "center",
      fontSize: "14px",
      color: "#888",
    },
    link: {
      color: "#FF6B00",
      textDecoration: "none",
      fontWeight: 600,
      marginLeft: "6px",
    },
    blob1: {
      position: "absolute",
      top: "-100px",
      left: "-100px",
      width: "350px",
      height: "350px",
      background: "rgba(255,107,0,0.06)",
      borderRadius: "50%",
      filter: "blur(100px)",
    },
    blob2: {
      position: "absolute",
      bottom: "-100px",
      right: "-100px",
      width: "300px",
      height: "300px",
      background: "rgba(255,107,0,0.04)",
      borderRadius: "50%",
      filter: "blur(80px)",
    }
  };

  return (
    <div style={S.container}>
      <div style={S.blob1} />
      <div style={S.blob2} />
      
      <div style={S.card}>
        <div style={S.logo}>DYNO</div>
        <div style={S.subTitle}>Hire by Work. Hire by Time.</div>

        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}

        {mode === "login" && (
          <>
            <form onSubmit={handleSubmit}>
              <div style={S.formGroup}>
                <label style={S.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <div style={S.formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ ...S.label, marginBottom: 0 }}>Password</label>
                  <span style={{ color: "#FF6B00", fontSize: "11px", cursor: "pointer", fontWeight: 600 }} onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>
                    Forgot Password?
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={S.linkContainer}>
              Don't have an account?
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/register")}>
                <span style={S.link}>Create account</span>
              </span>
            </div>
          </>
        )}

        {mode === "forgot" && (
          <>
            <form onSubmit={handleForgotPassword}>
              <div style={S.formGroup}>
                <label style={S.label}>Account Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? "Sending OTP..." : "Send Reset Code"}
              </button>
            </form>

            <div style={S.linkContainer}>
              Remembered password?
              <span style={{ cursor: "pointer" }} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                <span style={S.link}>Back to Login</span>
              </span>
            </div>
          </>
        )}

        {mode === "reset" && (
          <>
            <form onSubmit={handleResetPassword}>
              <div style={S.formGroup}>
                <label style={S.label}>6-Digit Reset Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? "Resetting Password..." : "Update Password"}
              </button>
            </form>

            <div style={S.linkContainer}>
              Or go back
              <span style={{ cursor: "pointer" }} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                <span style={S.link}>Cancel Reset</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}