// src/PayRequest.js
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const PayRequest = ({ loginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const requesterId = params.get("requesterId") ?? "";
  const requesterNameFromQuery = params.get("from") ?? "";
  const amountStr = params.get("amount") ?? "0";
  const amount = Number(amountStr);
  const message = params.get("message") ?? "";

  const [selectedUser, setSelectedUser] = useState(null);

  // 1) 未ログインならログインへ飛ばす（戻り先付き）
  useEffect(() => {
    if (!loginUser) {
      navigate("/", {
        replace: true,
        state: { redirectTo: location.pathname + location.search },
      });
    }
  }, [loginUser, navigate, location.pathname, location.search]);

  // 2) ログイン後：requesterId から friends を取得して icon を決める
  useEffect(() => {
    if (!loginUser) return;

    // requesterId が無い古いリンク対策（最低限表示はできるようにする）
    if (!requesterId) {
      setSelectedUser({
        name: requesterNameFromQuery,
        icon: "/images/human1.png", // フォールバック（適宜変更OK）
      });
      return;
    }

    fetch(`http://localhost:3010/friends/${requesterId}`)
      .then((res) => res.json())
      .then((friend) => {
        setSelectedUser({
          name: friend?.name ?? requesterNameFromQuery,
          icon: friend?.icon ?? "/images/human1.png",
        });
      })
      .catch((err) => {
        console.error("friends取得エラー:", err);
        setSelectedUser({
          name: requesterNameFromQuery,
          icon: "/images/human1.png",
        });
      });
  }, [loginUser, requesterId, requesterNameFromQuery]);

  // loginUser と selectedUser が揃うまで描画しない
  if (!loginUser || !selectedUser) return null;

  const handleSend = () => {
    navigate("/step6", {
      state: { selectedUser, amount, message },
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={() => navigate("/home")}>＜ 戻る</button>

      <h3>{selectedUser.name} さんからの請求</h3>

      {/* ★相手のアイコン（DB由来） */}
      <img
        src={selectedUser.icon}
        alt=""
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          objectFit: "cover",
          marginTop: "12px",
          marginBottom: "12px",
        }}
      />

      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        {Number.isFinite(amount) ? amount.toLocaleString() : "0"} 円
      </p>

      {message && <p>「{message}」</p>}

      <button
        style={{
          marginTop: "20px",
          padding: "12px 40px",
          background: "#d32f2f",
          color: "#fff",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer",
        }}
        onClick={handleSend}
      >
        送金する
      </button>
    </div>
  );
};

export default PayRequest;
