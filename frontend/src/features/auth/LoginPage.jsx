import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginLocal } from "../../lib/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("Enter username and password");
      return;
    }

    loginLocal("BUSINESS", "biz_demo");
    navigate("/", { replace: true });
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 24, border: "1px solid #ddd", borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" style={{ padding: 10 }} />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" style={{ padding: 10 }} />
        <button type="submit" style={{ padding: "10px 14px" }}>
          Sign in
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
