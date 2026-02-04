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

  // 旧仕様の名残（requestIdがない場合のフォールバック用）
  const amountStrFromQuery = params.get("amount") ?? "0";
  const messageFromQuery = params.get("message") ?? "";

  const [request, setRequest] = useState(null);      // requestsテーブルの請求データ

  const [selectedUser, setSelectedUser] = useState(null); // 請求者（相手）
  const [invalidReason, setInvalidReason] = useState(""); // 無効理由
  const [isSending, setIsSending] = useState(false);

  // ✅ 表示用：請求額・メッセージ・請求者IDは request から優先的に取る
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

  // 1) 未ログインならログインへ（戻り先付き）
  useEffect(() => {
    if (!loginUser) {
      navigate("/", {
        replace: true,
        state: { redirectTo: `${location.pathname}${location.search}` },
      });
    }
  }, [loginUser, navigate, location.pathname, location.search]);

  // 2) requestId があるなら請求データを取得して
  //    - 支払済みなら無効
  //    - 支払者(receiverId)がログインユーザーと一致しなければ NotYourRequestへ 
  useEffect(() => {
    if (!loginUser) return;

    (async () => {
      try {
        if (requestId) {
          // A: 特定のIDが指定されている場合（QRやリンクから）
          const res = await fetch(`http://localhost:3010/requests/${requestId}`);
          if (!res.ok) {
            setInvalidReason("この請求は存在しません。");
            return;
          }
          const data = await res.json();
          if (data.status === "paid") {
            setInvalidReason("この請求はすでに支払い済みです。");
            return;
          }
          setRequest(data);
        } else {
          // B: ID指定がない場合（ホームのボタンから）→ 自分宛の未払いを1件見つける
          const res = await fetch(`http://localhost:3010/requests`);
          const allRequests = await res.json();
          const myRequest = allRequests.find(req => 
            req.receiverName === loginUser.name && req.status === "unpaid"
          );

          if (myRequest) {
            setRequest(myRequest);
          } else {
            setInvalidReason("支払いが必要なリクエストは見つかりませんでした。");
          }
        }

        const data = await res.json();

        // ✅ 支払済みなら無効化
        if (data.status === "paid") {
          setInvalidReason("この請求はすでに支払い済みです。");
          return;
        }

        // ✅ 追加：支払者チェック（receiverId）
        // receiverId が入っている請求は「その人だけが支払える」
        const receiverId = String(data.receiverId ?? "");
        const loginId = String(loginUser.id ?? "");

        if (receiverId && receiverId !== loginId) {
          navigate("/notyourrequest", {
            replace: true,
            state: {
              payerName: data.receiverName, // 本来支払うべき人
              requesterName: data.requesterName, // 請求者
              redirectTo: `${location.pathname}${location.search}`, // 正しい人で再ログイン後に戻す先
            },
          });
          return;
        }

        // ✅ 未払い＆本人なら保持
        setRequest(data);

      } catch (e) {
        console.error("データ取得エラー:", e);
        setInvalidReason("請求情報の取得に失敗しました。");
      }
    })();
  }, [loginUser, requestId, navigate, location.pathname, location.search]);

  // 3) 請求者（相手）の情報を取得
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

  // --- 送金実行処理 ---
  const handleSend = async () => {
    if (!loginUser || !selectedUser || isSending) return;

    if (invalidReason) {
      alert(invalidReason);
      return;
    }

    if (Number(loginUser.balance) < amount) {
      alert("残高が不足しています");
      return;
    }

    setIsSending(true);

    try {
      // (A) 自分の残高を減らす
      const myNewBalance = Number(loginUser.balance) - amount;
      await fetch(`http://localhost:3010/friends/${loginUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: myNewBalance }),
      });

      // (B) 相手（請求者）の残高を増やす
      const partnerNewBalance = (Number(selectedUser.balance) || 0) + amount;
      await fetch(`http://localhost:3010/friends/${requesterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: partnerNewBalance }),
      });

      // (C) 送金履歴(send1)への保存
      const sendData = {
        senderId: loginUser.id,
        senderName: loginUser.name,
        receiverId: requesterId,
        receiverName: selectedUser.name,
        receiverIcon: selectedUser.icon, // 履歴でアイコンが出るように追加
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

      // (D) ✅ 請求データのステータス更新：unpaidをpaidに変更
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

      // 完了画面へ遷移
      navigate("/step6", {
        state: { selectedUser, amount, message },
      });
    } catch (err) {
      console.error("送金エラー", err);
      alert("送金に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  // 表示
  if (!loginUser) {
    return <div style={{ padding: "20px", textAlign: "center" }}>ログイン画面へ移動しています…</div>;
  }

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
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={() => navigate("/home")} style={{ float: "left", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>
        ＜ 戻る
      </button>
      <div style={{ clear: "both" }}></div>

      <div style={{ marginTop: "30px" }}>
        <img
          src={selectedUser.icon}
          alt=""
          style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "12px 0" }}
        />
        <h3>{selectedUser.name} さんからの請求</h3>
      </div>

      <p style={{ fontSize: "28px", fontWeight: "bold", margin: "20px 0" }}>
        {amount.toLocaleString()} 円
      </p>

      {message && (
        <div style={{ backgroundColor: "#f0f7ff", padding: "10px", borderRadius: "8px", display: "inline-block", marginTop: "10px" }}>
          「{message}」
        </div>
      )}

      <br />

      <button
        style={{
          marginTop: "40px", padding: "15px 60px", background: isSending ? "#999" : "#d32f2f",
          color: "#fff", border: "none", borderRadius: "30px", cursor: isSending ? "not-allowed" : "pointer",
          fontSize: "18px", fontWeight: "bold", opacity: isSending ? 0.7 : 1,
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
