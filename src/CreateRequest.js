// src/CreateRequest.js
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import "./CreateRequest.css";

const CreateRequest = ({ loginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedUser } = location.state || {};

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [message, setMessage] = useState("");

  const balance = useMemo(
    () => Number(loginUser?.balance || 0),
    [loginUser]
  );

  const handleAmountChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      setAmountError("1円以上の半角数字で入力してください");
      return;
    }

    if (!/^[0-9]+$/.test(value)) return;

    const n = Number(value);

    if (n < 1) {
      setAmountError("1円以上の半角数字で入力してください");
    } else if (n > balance) {
      setAmountError("残高を超えています");
    } else {
      setAmountError("");
    }

    setAmount(value);
  };

  const handleCreate = async () => {
    if (!loginUser) return;

    const n = Number(amount);
    if (n < 1 || n > balance) return;

    const requestData = {
      requesterId: loginUser.id,
      requesterName: loginUser.name,
      receiverId: selectedUser.id,
      receiverName: selectedUser.name,
      amount: n,
      message,
      createdAt: new Date().toLocaleString("ja-JP"),
      status: "unpaid",
    };

    try {
      const res = await fetch("http://localhost:3010/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const created = await res.json();
      const requestId = created.id;

      const link = `/payrequest?requestId=${requestId}&requesterId=${loginUser.id}&from=${loginUser.name}`;

      navigate("/requestcomplete", { state: { link } });
    } catch (e) {
      alert("請求の保存に失敗しました");
    }
  };

  const isCreateDisabled = !amount || !!amountError;

  return (
    <div className="page crPage">
      {/* 🔽 左上固定ヘッダー */}
      <div className="crHeader">
        <button className="crBackButton" onClick={() => navigate(-1)}>
          ＜ 戻る
        </button>
        <h2 className="crHeaderTitle">請求リンクの作成</h2>
      </div>

      <div className="screen">
        <div className="form-group">
          <label className="input-label">請求金額</label>
          <input
            type="text"
            className="text-input"
            value={amount}
            onChange={handleAmountChange}
            placeholder="3000"
          />
          <span className="currency-unit">円</span>

          {amountError && (
            <div className="error-text">{amountError}</div>
          )}
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

        <button
          className="create-link-btn"
          onClick={handleCreate}
          disabled={isCreateDisabled}
        >
          リンクを作成
        </button>
      </div>
    </div>
  );
};

export default CreateRequest;
