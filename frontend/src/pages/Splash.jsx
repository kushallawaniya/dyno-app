import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (api.auth.isAuthenticated()) {
        navigate("/app");
      } else {
        navigate("/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        background: "#0A0A0F",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ color: "#FF6B00", fontSize: "60px" }}>
        DYNO
      </h1>

      <p style={{ color: "#aaa", marginTop: 10 }}>
        Hire by Work. Hire by Time.
      </p>

      <div style={{ marginTop: 30 }}>
        Loading...
      </div>
    </div>
  );
}