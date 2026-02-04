// src/App.js
import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App({ loginUser }) {
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = React.useState(loginUser ? loginUser.balance : 0);

  // 支払い期限超過（一週間以上）の請求データを保持
  const [urgentRequest, setUrgentRequest] = React.useState(null);
  // 未払い請求がある時だけボタンを表示するための判定
  const [hasPendingRequest, setHasPendingRequest] = React.useState(false);
  // このセッションで警告を一度でも閉じたかを記録
  const [isWarningClosed, setIsWarningClosed] = React.useState(false);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('loginUserId');
    navigate('/');
    window.location.reload();
  };

  // 警告を閉じる時の処理
  const handleCloseWarning = () => {
    setUrgentRequest(null);
    setIsWarningClosed(true);
  };

  // ★ 追加：請求を拒否（削除）する処理
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("この請求を拒否して削除しますか？\n身に覚えがない場合はこちらを押してください。")) return;

    try {
      // db.json から該当の請求を削除する
      const res = await fetch(`http://localhost:3010/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert("請求を拒否・削除しました。");
        setUrgentRequest(null);
        setIsWarningClosed(true);
        // データの整合性を保つため画面をリロード
        window.location.reload();
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error("拒否エラー:", err);
      alert("通信エラーが発生しました。");
    }
  };

  React.useEffect(() => {
    if (loginUser && loginUser.id) {
      // 1. 最新の残高を取得
      fetch(`http://localhost:3010/friends/${loginUser.id}`)
        .then(res => res.json())
        .then(data => setCurrentBalance(Number(data.balance)))
        .catch(err => console.error("残高取得エラー:", err));

      // 2. 請求データのチェック
      fetch(`http://localhost:3010/requests`)
        .then(res => res.json())
        .then(allRequests => {
          const now = new Date();
          const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

          // 自分宛かつ未払い(unpaid)を抽出
          const myUnpaidRequests = allRequests.filter(req =>
            req.receiverName === loginUser.name && req.status === "unpaid"
          );

          setHasPendingRequest(myUnpaidRequests.length > 0);

          // 一週間経過、かつ「まだこの回で閉じていない」場合のみ警告セット
          const urgent = myUnpaidRequests.find(req => {
            const requestDate = new Date(req.createdAt);
            return (now - requestDate) > oneWeekMs;
          });

          if (urgent && !isWarningClosed) {
            setUrgentRequest(urgent);
            const audio = new Audio('https://actions.google.com/google_assistant/notifications/emergency_alert.mp3');
            audio.play().catch(e => console.log("音声再生制限中"));
          }
        });
    }
  }, [loginUser, isWarningClosed]);

  if (!loginUser) return <div className="page">読み込み中...</div>;

  return (
    <div className="page">
      <div className="screen">
        {/* ヘッダー */}
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="avatar"><img src={loginUser.icon} alt="icon" /></div>
            <div className="name">{loginUser.name}</div>
          </div>
          <button onClick={handleLogout} className="logout-btn">ログアウト</button>
        </div>

        <div className="subRow" style={{ marginTop: '20px' }}>
          <div className="subLeft">口座番号：{loginUser.accountNumber}</div>
        </div>

        {/* 残高カード */}
        <button className="balanceCard" type="button" onClick={() => navigate("/balance")}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "12px", color: "#666" }}>残高</span>
            <div className="balanceAmount">{currentBalance.toLocaleString()}円</div>
          </div>
          <img className="chevron" src="/images/chevron-right.png" alt="" style={{ width: "16px", opacity: 0.4 }} />
        </button>

        {/* メニュー */}
        <button onClick={() => navigate("/transactionhistory")} className="actionButton" style={{ marginTop: '10px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
          <img className="actionIcon" src="/images/rireki.png" alt="" />
          <span className="actionText" style={{ color: '#333' }}>請求・送金状況を確認する</span>
        </button>

        <button onClick={() => navigate("/recipientlist")} className="actionButton">
          <img className="actionIcon" src="/images/wallet.png" alt="" />
          <span className="actionText">送金する</span>
        </button>

        <button onClick={() => navigate("/recipientlist", { state: { mode: "request" } })} className="actionButton">
          <img className="actionIcon" src="/images/approval.png" alt="" />
          <span className="actionText">請求する</span>
        </button>

        {hasPendingRequest && (
          <button onClick={() => navigate("/requestlist")} className="actionButton" style={{ backgroundColor: '#fff5f5', border: '1px solid #ffcccc', marginTop: '10px' }}>
            <img className="actionIcon" src="/images/bikkurimark.png" alt="" />
            <span className="actionText" style={{ color: '#D11C1C', fontWeight: 'bold' }}>支払いリクエストが届いています</span>
          </button>
        )}
      </div>

      {/* ★ 期限超過警告ポップアップ */}
      {urgentRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '85%', textAlign: 'center' }}>
            <div style={{ color: '#D11C1C', fontSize: '50px' }}>⚠️</div>
            <h2 style={{ color: '#D11C1C' }}>支払い期限超過</h2>
            <p style={{ fontSize: '14px', margin: '15px 0' }}>
              {urgentRequest.requesterName}さんからの請求（{urgentRequest.amount.toLocaleString()}円）から一週間以上経過しています。
            </p>
            
            <button onClick={() => navigate("/payrequest")} style={{ width: '100%', backgroundColor: '#D11C1C', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              今すぐ支払う
            </button>

            {/* ★ 拒否ボタン */}
            <button 
              onClick={() => handleRejectRequest(urgentRequest.id)}
              style={{ width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', color: '#555', cursor: 'pointer' }}
            >
              身に覚えがないので拒否する
            </button>

            <button onClick={handleCloseWarning} style={{ background: 'none', border: 'none', color: '#999', marginTop: '15px', cursor: 'pointer' }}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}