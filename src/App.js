// src/App.js
import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

// ★ 引数を { loginUser } に統一
export default function App({ loginUser }) { 
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = React.useState(loginUser.balance);

  React.useEffect(() => {
    // ログイン直後に最新の残高を取得し直す
    fetch(`http://localhost:3010/friends/${loginUser.id}`)
      .then(res => res.json())
      .then(data => setCurrentBalance(Number(data.balance)));
  }, [loginUser.id]);

  // ★ データが届くまでの間、真っ白にならないようにガード
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
        {/* 上部：アイコン + 氏名 */}
        <div className="header">
          <div className="avatar">
            <img src={loginUser.icon} alt="ユーザーアイコン"/>
          </div>
          <div className="name">{loginUser.name}</div>
        </div>

        {/* 口座番号 / 残高表示 */}

        <div className="subRow">
          <div className="subLeft">口座番号：{loginUser.accountNumber}</div>
          <button className="subRight" type="button">残高表示</button>
        </div>

        {/* 残高カード */}
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

        {/* 支払い通知（Step8） */}
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