// src/STEP4.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Step4Screen({ loginUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUser } = location.state || {};

  // 金額は「文字列」で持つ（入力制御しやすい）
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [message, setMessage] = useState("");

  // 半角数字のみ（空は許可）
  const handleAmountChange = (e) => {
    const value = e.target.value;

    // 空文字はOK（消せないと不便）
    if (value === "") {
      setAmount("");
      setAmountError("");
      return;
    }

    // 半角数字のみ許可（全角、-、.、e、文字は弾く）
    if (!/^[0-9]+$/.test(value)) {
      return; // 入力自体を反映しない
    }

    // 先頭ゼロを許す/許さないは好み。今回は許す（"001" も入力可）
    // もし嫌ならここで /^0[0-9]+$/ のとき return など。

    const n = Number(value);
    const balance = Number(loginUser?.balance || 0);

    if (!Number.isInteger(n) || n < 1) {
      setAmountError("1円以上の半角数字で入力してください");
    } else if (n > balance) {
      setAmountError("残高を超えています");
    } else {
      setAmountError("");
    }

    setAmount(value);
  };

  const handleTransfer = async () => {
    // ★最終防衛ライン：送金直前でも必ずチェック
    const sendAmount = Number(amount);
    const balance = Number(loginUser?.balance || 0);

    if (!Number.isInteger(sendAmount) || sendAmount < 1) {
      alert("送金金額は1円以上の半角数字で入力してください");
      return;
    }

    if (sendAmount > balance) {
      alert("残高が不足しています");
      return;
    }

    // 計算時に数値であることを保証
    const myNewBalance = balance - sendAmount;
    const friendNewBalance = (Number(selectedUser.balance) || 0) + sendAmount;

    // ★ 送金履歴データの作成（CreateRequestのロジックを応用）
    const sendData = {
      senderId: loginUser.id,
      senderName: loginUser.name,
      receiverId: selectedUser.id,
      receiverName: selectedUser.name,
      receiverIcon: selectedUser.icon,
      amount: sendAmount,
      message: message,
      date: new Date().toLocaleString("ja-JP"),
      type: "transfer",
    };

    try {
      // 両方の残高をDBで更新
      await fetch(`http://localhost:3010/friends/${loginUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: myNewBalance }),
      });

      await fetch(`http://localhost:3010/friends/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: friendNewBalance }),
      });

      // 履歴を db.json の "send1" に保存
      await fetch("http://localhost:3010/send1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });

      // 完了画面へ移動し、メッセージを渡す
      navigate("/step6", { state: { selectedUser, amount: sendAmount, message } });
    } catch (err) {
      console.error("送金エラー:", err);
      alert("送金に失敗しました。");
    }
  };

  const isButtonDisabled =
    !amount ||
    !!amountError || // エラーが出てたら押せない
    !Number.isInteger(Number(amount)) ||
    Number(amount) < 1 ||
    Number(amount) > (loginUser?.balance || 0);

  if (!selectedUser || !loginUser) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>データが不足しています。</p>
        <button onClick={() => navigate("/recipientlist")}>戻る</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "left" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ border: "none", background: "none", cursor: "pointer" }}
        >
          ＜ 戻る
        </button>
      </header>

      <div style={{ marginTop: "20px" }}>
        <p style={{ fontSize: "14px", color: "#666" }}>送金先</p>
        <img
          src={selectedUser.icon}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
          alt=""
        />
        <h3 style={{ margin: "10px 0" }}>{selectedUser.name}</h3>

        <div
          style={{
            margin: "20px auto",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            width: "80%",
          }}
        >
          <p style={{ fontSize: "12px", margin: "0", color: "#888" }}>
            送金上限額（自身の預金金額）
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: "5px 0" }}>
            {loginUser.balance.toLocaleString()}円
          </p>
        </div>

        <div style={{ margin: "30px 0" }}>
          <p style={{ fontSize: "14px", fontWeight: "bold" }}>
            送金金額を入力してください
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            {/* ★ type=number は信用しない。text + 正規表現で制御する */}
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="金額"
              inputMode="numeric"
              pattern="[0-9]*"
              style={{
                fontSize: "24px",
                padding: "10px",
                width: "180px",
                textAlign: "right",
                border: amountError ? "1px solid red" : "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <span style={{ fontSize: "20px", marginLeft: "10px" }}>円</span>
          </div>

          {amountError && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "8px" }}>
              {amountError}
            </p>
          )}
        </div>

        {/* メッセージ入力欄 */}
        <div style={{ margin: "20px 0" }}>
          <p style={{ fontSize: "14px", fontWeight: "bold" }}>メッセージ（任意）</p>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="いつもありがとう！"
            style={{
              width: "80%",
              padding: "12px",
              marginTop: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={isButtonDisabled}
          style={{
            marginTop: "20px",
            padding: "15px 80px",
            backgroundColor: isButtonDisabled ? "#ccc" : "#D11C1C",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "18px",
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
          }}
        >
          送金
        </button>
      </div>
    </div>
  );
}

export default Step4Screen;
