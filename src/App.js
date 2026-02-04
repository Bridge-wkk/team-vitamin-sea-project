// src/App.js
import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App({ loginUser }) { 
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = React.useState(loginUser ? loginUser.balance : 0);

  // ★ ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('loginUserId'); 
    navigate('/'); 
    window.location.reload(); 
  };

  // ★ 最新の残高を取得する処理
  React.useEffect(() => {
    if (loginUser && loginUser.id) {
      fetch(`http://localhost:3010/friends/${loginUser.id}`)
        .then(res => res.json())
        .then(data => setCurrentBalance(Number(data.balance)))
        .catch(err => console.error("残高取得エラー:", err));
    }
  }, [loginUser]);

  // ★ ガード処理：データがない場合は読み込み中を表示
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
        {/* ヘッダー：アイコン、名前、ログアウトボタン */}
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="avatar">
              <img src={loginUser.icon} alt="ユーザーアイコン" />
            </div>
            <div className="name">{loginUser.name}</div>
          </div>

          <button 
            onClick={handleLogout} 
            style={{ 
              fontSize: '11px', 
              padding: '4px 8px', 
              backgroundColor: '#f0f0f0', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ログアウト
          </button>
        </div>

        {/* 口座番号 / 残高表示 */}
        <div className="subRow" style={{ marginTop: '20px' }}>
          <div className="subLeft">口座番号：{loginUser.accountNumber}</div>
          <button className="subRight" type="button">残高表示</button>
        </div>

        {/* 残高カード：currentBalanceを表示 */}
        <button className="balanceCard" type="button">
          <div className="balanceAmount">
            {currentBalance.toLocaleString()}円
          </div>
          <img className="chevron" src="/images/chevron-right.png" alt="" />
        </button>

        {/* 各種アクション */}
        <button onClick={() => navigate("/recipientlist")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/wallet.png" alt="" />
          <span className="actionText">送金する</span>
        </button>

        <button onClick={() => navigate("/createrequest")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/approval.png" alt="" />
          <span className="actionText">請求する</span>
        </button>

        <button 
          onClick={() => navigate("/payrequest")} 
          className="actionButton" 
          style={{ backgroundColor: '#fff5f5', border: '1px solid #ffcccc', marginTop: '10px' }}
          type="button"
        >
          <img className="actionIcon" src="/images/notification.png" alt="" />
          <span className="actionText" style={{ color: '#D11C1C', fontWeight: 'bold' }}>
            支払いリクエストが届いています
          </span>
        </button>
      </div>
    </div>
  );
}