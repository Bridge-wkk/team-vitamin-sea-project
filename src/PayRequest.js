import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PayRequest = () => {
  const navigate = useNavigate();
  const [myBalance, setMyBalance] = useState(0);

  // ステップ8の要件：請求リンクから情報を取得する想定の固定データ [cite: 432, 434, 442]
  const requestData = {
    requesterName: "サンプル 氏名", // 請求元の名前
    requesterIcon: "/images/human1.png", // 請求元のアイコン
    amount: 3000, // 指定された請求金額
    message: "飲み会代お願いします！" // 添付メッセージ
  };

  // 自分の残高を取得（送金可能かチェックするため）
  useEffect(() => {
    fetch("http://localhost:3010/user")
      .then((res) => res.json())
      .then((data) => setMyBalance(data.balance));
  }, []);

  const handlePay = () => {
    // 実際の送金処理（自分の残高を減らす等）をここに記述 [cite: 345, 435]
    console.log(`${requestData.amount}円を送金しました`);
    navigate("/requestcomplete"); // 完了画面へ
  };

  // 残高不足チェック [cite: 317, 318]
  const isBalanceLow = myBalance < requestData.amount;

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'left' }}>
        <button onClick={() => navigate("/")} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          ＜ 戻る
        </button>
      </header>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>支払い先</p>
        {/* 送信先アイコンを中央に配置 [cite: 202, 277] */}
        <img 
          src={requestData.requesterIcon} 
          alt="請求元" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <h3 style={{ margin: '10px 0' }}>{requestData.requesterName}</h3>
      </div>

      <div style={{ margin: '20px auto', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', maxWidth: '400px' }}>
        <p style={{ fontSize: '12px', margin: '0', color: '#888' }}>請求内容</p>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
            {requestData.amount.toLocaleString()} 円
        </p>
        <p style={{ fontSize: '14px', color: '#444', fontStyle: 'italic' }}>"{requestData.message}"</p>
      </div>

      {isBalanceLow && (
        <p style={{ color: 'red', fontSize: '12px' }}>※残高が不足しているため送金できません</p>
      )}

      <button 
        onClick={handlePay} 
        disabled={isBalanceLow}
        style={{ 
          marginTop: '20px', 
          padding: '15px 80px', 
          backgroundColor: isBalanceLow ? '#ccc' : '#d32f2f', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '25px', 
          fontSize: '16px',
          cursor: isBalanceLow ? 'not-allowed' : 'pointer'
        }}
      >
        送金する
      </button>
    </div>
  );
};

export default PayRequest;