import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="screen">
        {/* 上：アイコン + 氏名 */}
        <div className="header">
          <div className="avatar">
            {/* public/images 配下は /images/〜 で参照 */}
            <img src="/images/human1.png" alt="ユーザーアイコン" />
          </div>

          <div className="name">サンプル 氏名</div>
        </div>

        {/* 口座番号 / 残高表示 */}
        <div className="subRow">
          <div className="subLeft">口座番号：0000000</div>
          <button className="subRight" type="button">
            残高表示
          </button>
        </div>

        {/* 残高カード */}
        <button className="balanceCard" type="button">
          <div className="balanceAmount">50,000円</div>
          <img className="chevron" src="/images/chevron-right.png" alt="" />
        </button>

        {/* 送金ボタン（残高の下） */}
        <button onClick={() => navigate("/recipientlist")} className="sendButton" type="button">
          <img className="sendIcon" src="/images/wallet.png" alt="" />
          <span className="sendText">送金する</span>
        </button>
      </div>
    </div>
  );
}
