// src/NotYourRequest.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotYourRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.redirectTo || "/home";

  const handleReLogin = () => {
    // ✅ いまログイン中（間違ったユーザー）を強制ログアウト
    localStorage.removeItem("loginUserId");
    localStorage.removeItem("lastActiveAt");

    // ✅ Login.js は location.state?.redirectTo を見るので、stateで渡す
    navigate("/", { replace: true, state: { redirectTo } });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3 style={{ marginBottom: "10px" }}>
        この請求リンクはあなた宛てではありません
      </h3>

      <div
        style={{
          background: "#fff3cd",
          border: "1px solid #ffeeba",
          color: "#856404",
          borderRadius: "10px",
          padding: "12px",
          display: "inline-block",
          maxWidth: "420px",
          textAlign: "left",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
          ⚠️ 支払いできません
        </div>

        <div style={{ marginTop: "8px", fontSize: "13px" }}>
          正しいアカウントでログインし直してください。
        </div>
      </div>

      <div style={{ marginTop: "18px" }}>
        <button
          onClick={handleReLogin}
          style={{
            padding: "10px 18px",
            borderRadius: "18px",
            border: "none",
            background: "#d32f2f",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ログインし直す
        </button>

        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 18px",
            borderRadius: "18px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          トップへ戻る
        </button>
      </div>
    </div>
  );
};

export default NotYourRequest;
