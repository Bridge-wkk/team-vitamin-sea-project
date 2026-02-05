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
  // ★ 追加：確認画面の状態管理
  const [isConfirming, setIsConfirming] = useState(false);

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

    // 上下バーを出さないよう type="text" を維持し、数字以外を弾く
    if (!/^[0-9]+$/.test(value)) return;

    const n = Number(value);

    if (n < 1) {
      setAmountError("1円以上の半角数字で入力してください");
    } else {
      setAmountError("");
    }

    setAmount(value);
  };

  // ★ 変更：最初のリクエストボタンを押した時の処理
  const handleInitialClick = () => {
    if (!amount || !!amountError) return;
    setIsConfirming(true); // 確認画面へ切り替え
  };

  // ★ 実際のリクエスト保存処理
  const handleCreate = async () => {
    if (!loginUser) return;

    const n = Number(amount);
    
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
      <div className="crHeader">
        {/* 確認画面の時は入力に戻り、入力画面の時は前のページに戻る */}
        <button className="crBackButton" onClick={() => isConfirming ? setIsConfirming(false) : navigate(-1)}>
          ＜ 戻る
        </button>
        <h2 className="crHeaderTitle">
          {isConfirming ? "金額の最終確認" : "請求リンクの作成"}
        </h2>
      </div>

      <div className="screen">
        {!isConfirming ? (
          /* --- 入力画面 --- */
          <>
            <div className="form-group">
              <label className="input-label">請求金額</label>
              <input
                type="text"
                inputMode="numeric"
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
              onClick={handleInitialClick}
              disabled={isCreateDisabled}
            >
              リンクを作成
            </button>
          </>
        ) : (
          /* --- 確認画面 (追加した機能) --- */
          <div className="confirm-section" style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "#666" }}>以下の内容で請求リンクを作成しますか？</p>
            <div style={{ margin: "30px 0" }}>
              <span style={{ fontSize: "14px", color: "#888" }}>請求額</span>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "#d32f2f" }}>
                ¥{Number(amount).toLocaleString()}
              </div>
            </div>
            
            {message && (
              <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "30px", textAlign: "left" }}>
                <span style={{ fontSize: "12px", color: "#888" }}>メッセージ</span>
                <p style={{ margin: "5px 0 0" }}>{message}</p>
              </div>
            )}

            <button
              className="create-link-btn"
              onClick={handleCreate}
              style={{ backgroundColor: "#4CAF50" }}
            >
              はい、作成します
            </button>
            <button
              className="crBackButton"
              onClick={() => setIsConfirming(false)}
              style={{ marginTop: "15px", float: "none", color: "#666" }}
            >
              修正する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;