// src/App.js
import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App({ user }) { // 引数で user を受け取る
  const navigate = useNavigate();

  // ログイン情報がない場合のガード
  if (!user) return null;

  return (
    <div className="page">
      <div className="screen">
        <div className="header">
          <div className="avatar">
            {/* ログインユーザーのアイコンを動的に表示 */}
            <img src={user.icon} alt="ユーザーアイコン" />
          </div>
          <div className="name">{user.name}</div>
        </div>

        <div className="subRow">
          <div className="subLeft">口座番号：{user.accountNumber}</div>
          <button className="subRight" type="button">残高表示</button>
        </div>

        <button className="balanceCard" type="button">
          {/* ログインユーザーの残高を表示 */}
          <div className="balanceAmount">{user.balance.toLocaleString()}円</div>
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