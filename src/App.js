// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  // ユーザー情報を保持するステート
  const [userData, setUserData] = useState({ name: "読込中...", balance: 0, accountNumber: "-------" });

  // 画面が表示されるたびに最新のDB情報を取得
  useEffect(() => {
    fetch('http://localhost:3010/user')
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.error("データ取得エラー:", err));
  }, []);

  return (
    <div className="page">
      <div className="screen">
        {/* 上：アイコン + 氏名 */}
        <div className="header">
          <div className="avatar">
            <img src="/images/human1.png" alt="ユーザーアイコン" />
          </div>
          <div className="name">{userData.name}</div>
        </div>

        {/* 口座番号 / 残高表示 */}
        <div className="subRow">
          <div className="subLeft">口座番号：{userData.accountNumber}</div>
          <button className="subRight" type="button">残高表示</button>
        </div>

        {/* 残高カード：DBの値を表示 */}
        <button className="balanceCard" type="button">
          <div className="balanceAmount">{userData.balance.toLocaleString()}円</div>
          <img className="chevron" src="/images/chevron-right.png" alt="" />
        </button>

        {/* 送金ボタン */}
        <button onClick={() => navigate("/recipientlist")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/wallet.png" alt="" />
          <span className="actionText">送金する</span>
        </button>

        {/* 請求ボタン */}
        <button className="actionButton" type="button">
          <img className="actionIcon" src="/images/approval.png" alt="" />
          <span className="actionText">請求する</span>
        </button>
      </div>
    </div>
  );
}