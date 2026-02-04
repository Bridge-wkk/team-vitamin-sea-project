// src/App.js
import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App({ loginUser }) { 
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = React.useState(loginUser ? loginUser.balance : 0);
  
  // ★ 一週間経過した「未払い」の請求データを保持する
  const [urgentRequest, setUrgentRequest] = React.useState(null);
  // ★ 支払いリクエストボタンを表示するかどうかの判定
  const [hasPendingRequest, setHasPendingRequest] = React.useState(false);

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('loginUserId'); 
    navigate('/'); 
    window.location.reload(); 
  };

  React.useEffect(() => {
    if (loginUser && loginUser.id) {
      // 1. 最新の残高を取得
      fetch(`http://localhost:3010/friends/${loginUser.id}`)
        .then(res => res.json())
        .then(data => setCurrentBalance(Number(data.balance)))
        .catch(err => console.error("残高取得エラー:", err));

      // 2. 請求データのチェック（一週間以上の未払い判定）
      fetch(`http://localhost:3010/requests`)
        .then(res => res.json())
        .then(allRequests => {
          const now = new Date();
          const oneWeekMs = 7 * 24 * 60 * 60 * 1000; // 7日間をミリ秒で計算

          // 自分宛かつステータスが "unpaid" のものを抽出
          const myUnpaidRequests = allRequests.filter(req => 
            req.receiverName === loginUser.name && req.status === "unpaid"
          );

          // 1件でも未払いがあれば、通常の「リクエスト届いています」ボタンを出す
          setHasPendingRequest(myUnpaidRequests.length > 0);

          // その中で、作成から一週間（7日）以上経っているものを探す
          const urgent = myUnpaidRequests.find(req => {
            const requestDate = new Date(req.createdAt);
            return (now - requestDate) > oneWeekMs;
          });

          // 緊急のものが見つかった場合、ポップアップを表示し音を鳴らす
          if (urgent) {
            setUrgentRequest(urgent);
            const audio = new Audio('https://actions.google.com/google_assistant/notifications/emergency_alert.mp3'); 
            audio.play().catch(e => console.log("ブラウザの制限により、ユーザーが画面を触るまで音は鳴りません"));
          }
        });
    }
  }, [loginUser]);

  // ガード処理
  if (!loginUser) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="screen">
        {/* ヘッダー：アイコン、名前、ログアウト */}
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="avatar">
              <img src={loginUser.icon} alt="ユーザーアイコン" />
            </div>
            <div className="name">{loginUser.name}</div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#666' }}
          >
            ログアウト
          </button>
        </div>

        {/* 口座番号 / 残高表示 */}
        <div className="subRow" style={{ marginTop: '20px' }}>
          <div className="subLeft">口座番号：{loginUser.accountNumber}</div>
          <button className="subRight" type="button">残高表示</button>
        </div>

        <button className="balanceCard" type="button">
          <div className="balanceAmount">
            {currentBalance.toLocaleString()}円
          </div>
          <img className="chevron" src="/images/chevron-right.png" alt="" />
        </button>

        {/* アクションメニュー */}
        <button onClick={() => navigate("/transactionhistory")} className="actionButton"
          style={{ marginTop: '10px', backgroundColor: '#fff', border: '1px solid #ddd' }}
          type="button"
        >
          <img className="actionIcon" src="/images/history.png" alt="" />
          <span className="actionText" style={{ color: '#333' }}>請求・送金状況を確認する</span>

        </button>

        <button onClick={() => navigate("/recipientlist")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/wallet.png" alt="" />
          <span className="actionText">送金する</span>
        </button>

        <button onClick={() => navigate("/recipientlist", { state: { mode: "request" } })} 
          className="actionButton" type="button">
          <img className="actionIcon" src="/images/approval.png" alt="" />
          <span className="actionText">請求する</span>
        </button>

        {/* ★ 未払い（unpaid）がある時だけ表示される通知ボタン */}
        {hasPendingRequest && (
          <button 
            onClick={() => navigate("/payrequest")} 
            className="actionButton" 
            style={{ backgroundColor: '#fff5f5', border: '1px solid #ffcccc', marginTop: '10px' }}
            type="button"
          >
            <img className="actionIcon" src="/images/bikkurimark.png" alt="" />
            <span className="actionText" style={{ color: '#D11C1C', fontWeight: 'bold' }}>
              支払いリクエストが届いています
            </span>
          </button>
        )}
      </div>

      {/* ★ 一週間経過メッセージのポップアップ（最前面に表示） */}
      {urgentRequest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '15px',
            width: '85%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{ color: '#D11C1C', fontSize: '50px', marginBottom: '10px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 15px', color: '#D11C1C' }}>支払い期限超過</h2>
            <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.6', marginBottom: '25px' }}>
              {urgentRequest.requesterName}さんからの請求（{urgentRequest.amount.toLocaleString()}円）から一週間以上経過しています。速やかにお支払いください。
            </p>
            <button 
              onClick={() => navigate("/payrequest")}
              style={{
                width: '100%', backgroundColor: '#D11C1C', color: 'white', border: 'none',
                padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
              }}
            >
              今すぐ支払う
            </button>
            <button 
              onClick={() => setUrgentRequest(null)}
              style={{ background: 'none', border: 'none', color: '#999', marginTop: '15px', fontSize: '13px', cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}