// src/PayRequest.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const PayRequest = ({ loginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // URLパラメータ
  const requestId = params.get("requestId"); 
  const requesterIdFromQuery = params.get("requesterId") ?? "";
  const requesterNameFromQuery = params.get("from") ?? "";

  // 旧仕様の名残
  const amountStrFromQuery = params.get("amount") ?? "0";
  const messageFromQuery = params.get("message") ?? "";

  const [request, setRequest] = useState(null);      
  const [selectedUser, setSelectedUser] = useState(null); 
  const [invalidReason, setInvalidReason] = useState(""); 
  const [isSending, setIsSending] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  // 表示用データのメモ化
  const amount = useMemo(() => {
    if (request) return Number(request.amount || 0);
    return Number(amountStrFromQuery || 0);
  }, [request, amountStrFromQuery]);

  const message = useMemo(() => {
    if (request) return request.message || "";
    return messageFromQuery || "";
  }, [request, messageFromQuery]);

  const requesterId = useMemo(() => {
    if (request) return String(request.requesterId ?? "");
    return String(requesterIdFromQuery ?? "");
  }, [request, requesterIdFromQuery]);

  const requesterName = useMemo(() => {
    if (request) return request.requesterName || requesterNameFromQuery || "";
    return requesterNameFromQuery || "";
  }, [request, requesterNameFromQuery]);

  // 1) 未ログインならログインへ
  useEffect(() => {
    if (!loginUser) {
      navigate("/", {
        replace: true,
        state: { redirectTo: `${location.pathname}${location.search}` },
      });
    }
  }, [loginUser, navigate, location.pathname, location.search]);

  // 2) ✅ 修正箇所：fetchのレスポンス定義(res2など)を確実に定義
  useEffect(() => {
    if (!loginUser) return;

    (async () => {
      try {
        if (requestId) {
          // A: requestIdがある場合
          const res1 = await fetch(`http://localhost:3010/requests/${requestId}`);
          if (!res1.ok) {
            setInvalidReason("この請求は存在しません。");
            return;
          }
          const data = await res1.json();
          if (data.status === "paid") {
            setInvalidReason("この請求はすでに支払い済みです。");
            return;
          }
          setRequest(data);
        } else {
          // B: ホーム画面から来た場合（自動検索）
          const res2 = await fetch(`http://localhost:3010/requests`);
          const allRequests = await res2.json(); // ★ ここで res2 が定義されているのでエラーになりません
          const myRequest = allRequests.find(req => 
            req.receiverName === loginUser.name && req.status === "unpaid"
          );

          if (myRequest) {
            setRequest(myRequest);
          } else {
            setInvalidReason("支払いが必要なリクエストは見つかりませんでした。");
          }
        }
      } catch (e) {
        console.error("データ取得エラー:", e);
        setInvalidReason("請求情報の取得に失敗しました。");
      }
    })();
  }, [loginUser, requestId]);

  // 3) 請求者情報の取得
  useEffect(() => {
    if (!loginUser || invalidReason || !requesterId) return;

    fetch(`http://localhost:3010/friends/${requesterId}`)
      .then((res) => res.json())
      .then((friend) => {
        setSelectedUser({
          ...friend,
          name: friend.name || requesterName || "不明",
          icon: friend.icon || "/images/human1.png",
        });
      })
      .catch((err) => {
        console.error("friends取得エラー:", err);
        setSelectedUser({
          name: requesterName || "不明",
          icon: "/images/human1.png",
          balance: 0,
        });
      });
  }, [loginUser, invalidReason, requesterId, requesterName]);

  // 送金実行
  const handleSend = async () => {
    if (!loginUser || !selectedUser || isSending) return;
    if (invalidReason) { alert(invalidReason); return; }
    if (Number(loginUser.balance) < amount) { alert("残高が不足しています"); return; }

    setIsSending(true);
    try {
      const myNewBalance = Number(loginUser.balance) - amount;
      await fetch(`http://localhost:3010/friends/${loginUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: myNewBalance }),
      });

      const partnerNewBalance = (Number(selectedUser.balance) || 0) + amount;
      await fetch(`http://localhost:3010/friends/${requesterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: partnerNewBalance }),
      });

      const sendData = {
        senderId: loginUser.id,
        senderName: loginUser.name,
        receiverId: requesterId,
        receiverName: selectedUser.name,
        receiverIcon: selectedUser.icon,
        amount: amount,
        message: message,
        date: new Date().toLocaleString("ja-JP"),
        type: "transfer",
      };
      await fetch("http://localhost:3010/send1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });

      if (request?.id) {
        await fetch(`http://localhost:3010/requests/${request.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "paid",
            payerId: loginUser.id,
            paidAt: new Date().toLocaleString("ja-JP"),
          }),
        });
      }

      navigate("/step6", { state: { selectedUser, amount, message } });
    } catch (err) {
      console.error("送金エラー", err);
      alert("送金に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  if (!loginUser) return <div style={{ padding: "20px", textAlign: "center" }}>読み込み中…</div>;

  if (invalidReason) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>この請求リンクは無効です</h3>
        <p>{invalidReason}</p>
        <button onClick={() => navigate("/home")}>トップへ戻る</button>
      </div>
    );
  }

  if (!selectedUser) return null;

  return (
    <div className="page" style={{ padding: '20px', textAlign: 'center' }}>
      {/* 1. 戻るボタン */}
      <button onClick={() => navigate("/home")} style={{ float: "left", background: "none", border: "none", cursor: "pointer" }}>
        ＜ 戻る
      </button>
      <div style={{ clear: "both" }}></div>

      {/* 2. 請求者情報 */}
      <div style={{ marginTop: "30px" }}>
        <img src={selectedUser.icon} alt="" style={{ width: '80px', height: '80px', borderRadius: "50%" }} />
        <h3>{selectedUser.name} さんからの請求</h3>
      </div>

      {/* 3. 金額と元のメッセージ */}
      <p style={{ fontSize: "28px", fontWeight: "bold", margin: "20px 0" }}>
        {amount.toLocaleString()} 円
      </p>
      {message && (
        <div style={{ backgroundColor: "#f0f7ff", padding: "10px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
          {message}
        </div>
      )}

      {/* ★ 4. メッセージ入力欄（ここが正しい位置です！） */}
      <div className="form-group" style={{ padding: '0 20px', marginBottom: '20px', textAlign: 'left' }}>
        <label className="input-label" style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>
          支払いメッセージ（任意）
        </label>
        <textarea
          className="text-input"
          rows="3"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="支払いました！ご確認お願いします。"
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      </div>

      {/* 5. 送金ボタン */}
      <button
        className="submit-button"
        style={{ 
          marginTop: "20px", 
          padding: "15px 60px", 
          background: isSending ? "#999" : "#d32f2f", 
          color: "white", 
          border: "none", 
          borderRadius: "8px",
          cursor: isSending ? "not-allowed" : "pointer"
        }}
        onClick={handleSend}
        disabled={isSending}
      >
        {isSending ? "送金中..." : "送金する"}
      </button>
    </div>
  );
};

export default PayRequest;