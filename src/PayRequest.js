import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const PayRequest = ({ loginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // URLパラメータの取得
  const requestId = params.get("requestId"); // ★重要：請求データのID
  const requesterId = params.get("requesterId") ?? "";
  const requesterNameFromQuery = params.get("from") ?? "";
  const amountStr = params.get("amount") ?? "0";
  const amount = Number(amountStr);
  const message = params.get("message") ?? "";

  const [selectedUser, setSelectedUser] = useState(null);

  // 1. 未ログイン時のリダイレクト処理（元の場所を記憶）
  useEffect(() => {
    if (!loginUser) {
      navigate("/", {
        replace: true,
        state: { from: location }, // ログイン後に戻ってこれるようにする
      });
    }
  }, [loginUser, navigate, location]);

  // 2. 請求者（相手）の情報を取得
  useEffect(() => {
    if (!loginUser) return;

    // requesterIdがない場合（古いリンクなど）のフォールバック
    if (!requesterId) {
      setSelectedUser({
        name: requesterNameFromQuery,
        icon: "/images/human1.png",
      });
      return;
    }

    fetch(`http://localhost:3010/friends/${requesterId}`)
      .then((res) => res.json())
      .then((friend) => {
        // 相手の現在の残高なども含めてセットする
        setSelectedUser({
          ...friend,
          name: friend.name || requesterNameFromQuery,
          icon: friend.icon || "/images/human1.png"
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


  // --- 送金実行処理 ---
  const handleSend = async () => {
    if (!loginUser || !selectedUser) return;
    
    // 残高不足チェック
    if (Number(loginUser.balance) < amount) {
      alert("残高が不足しています");
      return;
    }

    try {
      // (A) 自分の残高を減らす
      const myNewBalance = Number(loginUser.balance) - amount;
      await fetch(`http://localhost:3010/friends/${loginUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: myNewBalance }),
      });

      // (B) 相手（請求者）の残高を増やす
      const partnerNewBalance = (Number(selectedUser.balance) || 0) + amount;
      await fetch(`http://localhost:3010/friends/${requesterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: partnerNewBalance }),
      });

      // (C) 送金履歴(send1)への保存（TransactionHistoryとは別の送金ログ）
      const sendData = {
        senderId: loginUser.id,
        senderName: loginUser.name,
        receiverId: requesterId,
        receiverName: selectedUser.name,
        amount: amount,
        message: message,
        date: new Date().toLocaleString('ja-JP'),
        type: "request_payment"
      };
      await fetch("http://localhost:3010/send1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData)
      });

      // ★(D) 請求データのステータス更新 (ここがポイント！)
      if (requestId) {
        await fetch(`http://localhost:3010/requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: "paid",       // 支払い済みに変更
            payerId: loginUser.id // 誰が払ったかを記録
          }),
        });
      }

      // 完了画面へ遷移
      navigate("/step6", {
        state: { selectedUser, amount, message },
      });

    } catch (err) {
      console.error("送金エラー", err);
      alert("送金に失敗しました");
    }
  };

  // データ読み込み中は何も表示しない
  if (!loginUser || !selectedUser) return null;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={() => navigate("/home")} style={{ float: "left" }}>＜ 戻る</button>
      <div style={{ clear: "both" }}></div>

      <div style={{ marginTop: "30px" }}>
        <img
          src={selectedUser.icon}
          alt=""
          style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "12px 0" }}
        />
        <h3>{selectedUser.name} さんからの請求</h3>
      </div>

      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        {amount.toLocaleString()} 円
      </p>

      {message && (
         <div style={{ backgroundColor: "#f0f7ff", padding: "10px", borderRadius: "8px", display: "inline-block", marginTop: "10px" }}>
          「{message}」
        </div>
      )}
      
      <br />

      <button
        style={{ marginTop: "30px", padding: "12px 40px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        onClick={handleSend}
      >
        送金する
      </button>
    </div>
  );
};

export default PayRequest;