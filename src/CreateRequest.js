import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./CreateRequest.css";

// 1. 引数で user を受け取るように変更
const CreateRequest = ({ user }) => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
  if (!amount) return;

  const requestData = {
    requesterId: user.id,
    requesterName: user.name,
    amount: Number(amount),
    message,
    createdAt: new Date().toISOString()
  };

  try {
    // ★ db.json に保存
    await fetch("http://localhost:3010/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    // ★ 請求リンク生成
    const link = `/payrequest?from=${encodeURIComponent(
      user.name
    )}&amount=${amount}&message=${encodeURIComponent(message)}`;

    navigate("/requestcomplete", {
      state: { link }
    });

  } catch (err) {
    alert("請求の保存に失敗しました");
    console.error(err);
  }
};

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title">請求リンクの作成</h2>

        <div className="form-group">
          <label className="input-label">請求金額</label>
          <input
            type="number"
            className="text-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="3000"
          />
          <span className="currency-unit">円</span>
        </div>

        <div className="form-group">
          <label className="input-label">メッセージ（任意）</label>
          <textarea
            className="text-input"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="飲み会代お願いします！"
          />
        </div>

        <button onClick={handleCreate} className="create-link-btn">
          リンクを作成
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          トップ画面に戻る
        </button>
      </div>
    </div>
  );
};

export default CreateRequest;