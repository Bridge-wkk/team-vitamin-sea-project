import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

// ★修正1：Routers.js から渡される { user } を受け取る
export default function App({ user }) {
  const navigate = useNavigate();

  // ユーザー情報を保持するステート
  // 初期値：ログイン情報(user)があればそれを使い、なければ読込中の表示にする
  const [userData, setUserData] = useState(user || {
    name: "読込中...",
    balance: 0,
    accountNumber: "-------",
    icon: "/images/human1.png"
  });

  // ★修正2：画面が表示されるたびに、IDを使って最新の情報を取得
  useEffect(() => {
    // ユーザー情報（ID）がない場合は処理しない
    if (!user || !user.id) return;

    // ★重要：ポートを3010、パスを friends に指定し、ログイン中のIDで絞り込む
    fetch(`http://localhost:3010/friends/${user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log("最新データを取得:", data);
        setUserData(data); // サーバーの最新情報で上書き
      })
      .catch(err => console.error("データ取得エラー:", err));

  }, [user]); // userが変わるたびに再実行

  return (
    <div className="page">
      <div className="screen">
        {/* 上：アイコン + 氏名 */}
        <div className="header">
          <div className="avatar">
            {/* ★修正3：DBのアイコン画像を表示（なければ human1.png） */}
            <img src={userData.icon || "/images/human1.png"} alt="ユーザーアイコン" />
          </div>
          <div className="name">{userData.name} 様</div>
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
        <button onClick={() => navigate("/createrequest")} className="actionButton" type="button">
          <img className="actionIcon" src="/images/approval.png" alt="" />
          <span className="actionText">請求する</span>
        </button>
      </div>
    </div>
  );
}