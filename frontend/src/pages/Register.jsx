import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("client"); // Default: Client (Hiring)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Verification state variables
  const [verificationPending, setVerificationPending] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (api.auth.isAuthenticated()) {
      navigate("/app");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !role) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.auth.register({ name, email, password, role, phone });
      if (res.verificationRequired) {
        setVerificationPending(true);
      } else {
        navigate("/app");
      }
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.auth.verifyOTP(email, otpCode);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Verification failed. Invalid code.");
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
      padding: "30px 40px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.05)",
      zIndex: 10,
    },
    logo: {
      fontFamily: "Georgia, serif",
      fontSize: "32px",
      fontWeight: "bold",
      color: "#FF6B00",
      textAlign: "center",
      marginBottom: "4px",
      letterSpacing: "2px",
    },
    subTitle: {
      color: "#888",
      fontSize: "13px",
      textAlign: "center",
      marginBottom: "24px",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "11px",
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
      padding: "10px 14px",
      color: "#FFF",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    roleSelector: {
      display: "flex",
      gap: "10px",
      marginBottom: "16px",
    },
    roleBtn: {
      flex: 1,
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid rgba(255, 107, 0, 0.3)",
      background: "transparent",
      color: "#FF9A3C",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    roleBtnActive: {
      background: "#FF6B00",
      color: "#FFF",
      border: "1px solid #FF6B00",
      boxShadow: "0 2px 8px rgba(255, 107, 0, 0.2)",
    },
    btn: {
      width: "100%",
      background: "#FF6B00",
      color: "#FFF",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "15px",
      marginTop: "8px",
      boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)",
    },
    error: {
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      color: "#EF4444",
      borderRadius: "6px",
      padding: "8px",
      fontSize: "12px",
      marginBottom: "16px",
      textAlign: "center",
    },
    linkContainer: {
      marginTop: "20px",
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
        
        {!verificationPending ? (
          <>
            <div style={S.subTitle}>Create your account to get started</div>

            {error && <div style={S.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={S.formGroup}>
                <label style={S.label}>Join As</label>
                <div style={S.roleSelector}>
                  <button
                    type="button"
                    style={{ ...S.roleBtn, ...(role === "client" ? S.roleBtnActive : {}) }}
                    onClick={() => setRole("client")}
                  >
                    Employer (Hire)
                  </button>
                  <button
                    type="button"
                    style={{ ...S.roleBtn, ...(role === "worker" ? S.roleBtnActive : {}) }}
                    onClick={() => setRole("worker")}
                  >
                    Worker (Jobs)
                  </button>
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="Rajan Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

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
                <label style={S.label}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={S.input}
                  required
                />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Password</label>
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
                {loading ? "Creating Account..." : "Register Now"}
              </button>
            </form>

            <div style={S.linkContainer}>
              Already have an account?
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
                <span style={S.link}>Sign In</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={S.subTitle}>Verify registration for {email}</div>
            
            <div style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#FF9A3C", marginBottom: "20px", textAlign: "center", lineHeight: "1.5" }}>
              🔐 We have sent a 4-digit verification code to your email. Check backend logs for the code!
            </div>

            {error && <div style={S.error}>{error}</div>}

            <form onSubmit={handleVerifyOTP}>
              <div style={S.formGroup}>
                <label style={S.label}>Enter 4-Digit Code</label>
                <input
                  type="text"
                  placeholder="1234"
                  maxLength="4"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ ...S.input, textAlign: "center", fontSize: "20px", letterSpacing: "8px" }}
                  required
                />
              </div>

              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? "Verifying..." : "Verify Code & Start"}
              </button>
            </form>

            <div style={S.linkContainer}>
              Incorrect details?
              <span style={{ cursor: "pointer" }} onClick={() => setVerificationPending(false)}>
                <span style={S.link}>Change registration info</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}