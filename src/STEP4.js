// src/step4.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Step4Screen() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. 前の画面（RecipientList）から渡されたユーザー情報を受け取る
  const { selectedUser } = location.state || {};

  // 2. 状態管理（入力金額と自分の残高）
  const [amount, setAmount] = useState(''); // 入力ボックスの値
  const [myBalance, setMyBalance] = useState(0); // 自分の口座残高

  // 3. db.jsonから自分の残高データを取得する
  useEffect(() => {
    // ポート番号はRecipientListに合わせる（3010 or 3001）
    fetch('http://localhost:3010/user') 
      .then(res => res.json())
      .then(data => {
        setMyBalance(data.balance);
      })
      .catch(err => console.error("残高取得エラー:", err));
  }, []);

  // 4. バリデーション：金額が空、または0以下の場合はボタンを押せなくする（要件[4]）
  const isButtonDisabled = !amount || Number(amount) <= 0;

  // 万が一、直接URLを叩いてアクセスされた場合のガード
  if (!selectedUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>ユーザーが選択されていません。</p>
        <button onClick={() => navigate('/recipientlist')}>宛先一覧へ戻る</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      {/* 上部ヘッダー：戻るボタン */}
      <header style={{ textAlign: 'left' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          ＜ 戻る
        </button>
      </header>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>送金先</p>
        {/* 送金先のアイコンと氏名（要件①） */}
        <img 
          src={selectedUser.icon} 
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
          alt="" 
        />
        <h3 style={{ margin: '10px 0' }}>{selectedUser.name}</h3>
        
        {/* 送金上限額（自分の残高）の表示（要件②） */}
        <div style={{ margin: '20px auto', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '80%' }}>
          <p style={{ fontSize: '12px', margin: '0', color: '#888' }}>送金上限額（自身の預金金額）</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>
            {myBalance.toLocaleString()}円
          </p>
        </div>

        {/* 送金金額入力ボックス（要件③） */}
        <div style={{ margin: '30px 0' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>送金金額を入力してください</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="金額" 
              style={{ 
                fontSize: '24px', 
                padding: '10px', 
                width: '180px', 
                textAlign: 'right', 
                border: '1px solid #ccc', 
                borderRadius: '5px' 
              }}
            />
            <span style={{ fontSize: '20px', marginLeft: '10px' }}>円</span>
          </div>
        </div>

        {/* 送金ボタン：入力がない時は非活性（要件④） */}
        <button 
          onClick={() => navigate('/step6', { state: { selectedUser, amount } })} 
          disabled={isButtonDisabled}
          style={{ 
            padding: '15px 80px', 
            backgroundColor: isButtonDisabled ? '#ccc' : '#D11C1C', // MUFG風の赤
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px', 
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            transition: '0.3s'
          }}
        >
          送金
        </button>
      </div>
    </div>
  );
}

export default Step4Screen;