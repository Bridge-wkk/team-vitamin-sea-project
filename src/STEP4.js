import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Step4Screen({ loginUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUser } = location.state || {};

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [message, setMessage] = useState("");
  // ★ 追加：入力画面と確認画面を切り替えるための状態
  const [isConfirming, setIsConfirming] = useState(false);

  // 半角数字のみ（空は許可）
  const handleAmountChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      setAmountError("");
      return;
    }

    if (!/^[0-9]+$/.test(value)) {
      return; 
    }

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

  // ★ 変更：最初のボタンを押した時に「確認画面」へ移る処理
  const handleInitialClick = () => {
    const sendAmount = Number(amount);
    const balance = Number(loginUser?.balance || 0);

    // 最終防衛ラインとしてのチェック
    if (!amount || !!amountError || sendAmount < 1 || sendAmount > balance) {
      return;
    }
    
    setIsConfirming(true); // 確認画面へ切り替え
  };

  // ★ 実際の送金処理（確認画面の「はい、送金します」で実行）
  const handleTransfer = async () => {
    const sendAmount = Number(amount);
    const balance = Number(loginUser?.balance || 0);

    const myNewBalance = balance - sendAmount;
    const friendNewBalance = (Number(selectedUser.balance) || 0) + sendAmount;

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

      await fetch("http://localhost:3010/send1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });

      navigate("/step6", { state: { selectedUser, amount: sendAmount, message } });
    } catch (err) {
      console.error("送金エラー:", err);
      alert("送金に失敗しました。");
    }
  };

  const isButtonDisabled =
    !amount ||
    !!amountError ||
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
        {/* 確認画面なら入力に戻り、入力画面なら前画面に戻る */}
        <button
          onClick={() => isConfirming ? setIsConfirming(false) : navigate(-1)}
          style={{ border: "none", background: "none", cursor: "pointer" }}
        >
          ＜ 戻る
        </button>
      </header>

      {!isConfirming ? (
        /* --- 1. 送金入力画面（元のレイアウトを維持） --- */
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "14px", color: "#666" }}>送金先</p>
          <img src={selectedUser.icon} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} alt="" />
          <h3 style={{ margin: "10px 0" }}>{selectedUser.name}</h3>

          <div style={{ margin: "20px auto", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px", width: "80%" }}>
            <p style={{ fontSize: "12px", margin: "0", color: "#888" }}>送金上限額（自身の預金金額）</p>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: "5px 0" }}>{loginUser.balance.toLocaleString()}円</p>
          </div>

          <div style={{ margin: "30px 0" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>送金金額を入力してください</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="金額"
                inputMode="numeric"
                pattern="[0-9]*"
                style={{ fontSize: "24px", padding: "10px", width: "180px", textAlign: "right", border: amountError ? "1px solid red" : "1px solid #ccc", borderRadius: "5px" }}
              />
              <span style={{ fontSize: "20px", marginLeft: "10px" }}>円</span>
            </div>
            {amountError && <p style={{ color: "red", fontSize: "12px", marginTop: "8px" }}>{amountError}</p>}
          </div>

          <div style={{ margin: "20px 0" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>メッセージ（任意）</p>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="いつもありがとう！"
              style={{ width: "80%", padding: "12px", marginTop: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>

          <button
            onClick={handleInitialClick}
            disabled={isButtonDisabled}
            style={{ marginTop: "20px", padding: "15px 80px", backgroundColor: isButtonDisabled ? "#ccc" : "#D11C1C", color: "#fff", border: "none", borderRadius: "5px", fontWeight: "bold", fontSize: "18px", cursor: isButtonDisabled ? "not-allowed" : "pointer" }}
          >
            送金内容を確認
          </button>
        </div>
      ) : (
        /* --- 2. 新設：送金の最終確認画面 --- */
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "20px" }}>金額の最終確認</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>以下の内容で送金します。よろしいですか？</p>
          
          <div style={{ margin: "30px 0" }}>
            <img src={selectedUser.icon} style={{ width: "60px", height: "60px", borderRadius: "50%" }} alt="" />
            <p style={{ fontWeight: "bold", marginTop: "5px" }}>{selectedUser.name} さんへ</p>
          </div>

          <div style={{ margin: "30px 0" }}>
            <span style={{ fontSize: "14px", color: "#888" }}>送金金額</span>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: "#D11C1C" }}>
              ¥{Number(amount).toLocaleString()}
            </div>
          </div>

          {message && (
            <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", margin: "0 auto 30px", width: "80%", textAlign: "left" }}>
              <span style={{ fontSize: "12px", color: "#888" }}>メッセージ</span>
              <p style={{ margin: "5px 0 0" }}>{message}</p>
            </div>
          )}

          <button
            onClick={handleTransfer}
            style={{ width: "80%", padding: "16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "18px", cursor: "pointer" }}
          >
            はい、送金します
          </button>
          
          <button
            onClick={() => setIsConfirming(false)}
            style={{ display: "block", margin: "20px auto 0", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", textDecoration: "underline" }}
          >
            修正する
          </button>
        </div>
      )}
    </div>
  );
}

export default Step4Screen;
