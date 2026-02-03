import React, { useState, useEffect } from "react"; // ★ useState, useEffect を追加
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App({ user, onLogout }) {
  const navigate = useNavigate();

  // ★修正1：表示用のデータを管理する。初期値はログイン情報(user)にしておく
  const [userData, setUserData] = useState(user);

  // ★修正2：画面が表示されるたびに、サーバーから最新情報を取ってくる
  useEffect(() => {
    if (!user || !user.id) return;

    // 最新の自分自身の情報を取得
    fetch(`http://localhost:3010/friends/${user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log("App.js: 最新データを取得しました", data);
        setUserData(data); // ★ここで最新情報に上書き！
      })
      .catch(err => console.error("データ取得エラー:", err));
  }, [user]);

  // ログイン情報がない場合のガード
  if (!userData) return null;

  return (
    <div className="page">
      <div className="screen">
        <div className="header">
          <div className="avatar">
            {/* ★修正3：user ではなく userData を使う */}
            <img src={userData.icon} alt="ユーザーアイコン" />
          <div className="name">{userData.name}</div>
        </div>

        {/* ★ ログアウトボタンをヘッダーの右側に追加 */}
          <button 
            onClick={onLogout} 
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

        <div className="subRow">
          <div className="subLeft">口座番号：{userData.accountNumber}</div>
          <button className="subRight" type="button">残高表示</button>
        </div>

        <button className="balanceCard" type="button">
          {/* ★修正4：ここが一番重要！最新の残高(userData.balance)を表示 */}
          <div className="balanceAmount">{userData.balance.toLocaleString()}円</div>
          <img className="chevron" src="/images/chevron-right.png" alt="" />
        </button>

        <button onClick={() => navigate("/recipientlist")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/wallet.png" alt="" />
          <span className="actionText">送金する</span>
        </button>

        <button onClick={() => navigate("/createrequest")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/approval.png" alt="" />
          <span className="actionText">請求する</span>
        </button>
      </div>
    </div>
  );
}