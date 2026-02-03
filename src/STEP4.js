// src/step4.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Step4Screen({ loginUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUser } = location.state || {};

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [myBalance, setMyBalance] = useState(0);

  // 起動時に現在の自分の情報を取得
  useEffect(() => {
    useEffect(() => {
  if (!loginUser) return;

  fetch(`http://localhost:3010/friends/${loginUser.id}`)
    .then(res => res.json())
    .then(data => setMyBalance(data.balance))
    .catch(err => console.error("データ取得エラー:", err));
  }, [loginUser]);

  // 送金ボタンを押した時の処理
  const handleTransfer = () => {
    const sendAmount = Number(amount);
    const newBalance = myBalance - sendAmount; // 新しい残高を計算

    // 1. DB(db.json)の残高を更新する
    fetch(`http://localhost:3010/friends/${loginUser.id}`, {
      method: 'PATCH', // 指定した項目（balance）だけを上書き
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: newBalance }),
    })
    .then(res => {
      if (res.ok) {
        // 2. 更新が成功したら完了画面へ（お土産を持っていく）
        navigate('/step6', { state: { selectedUser, amount: sendAmount, message } });
      } else {
        alert("送金に失敗しました。サーバーの状態を確認してください。");
      }
    })
    .catch(err => {
      console.error("通信エラー:", err);
      alert("通信エラーが発生しました。");
    });
  };

  const isButtonDisabled = !amount || Number(amount) <= 0 || Number(amount) > myBalance;

  if (!selectedUser) return <div style={{ padding: '20px' }}>ユーザーを選択し直してください。</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'left' }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>＜ 戻る</button>
      </header>
      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>送金先</p>
        <img src={selectedUser.icon} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
        <h3 style={{ margin: '10px 0' }}>{selectedUser.name}</h3>
        
        <div style={{ margin: '20px auto', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '80%' }}>
          <p style={{ fontSize: '12px', margin: '0', color: '#888' }}>送金上限額（自身の預金金額）</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>{myBalance.toLocaleString()}円</p>
        </div>

        <div style={{ margin: '30px 0' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>送金金額を入力してください</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="金額" style={{ fontSize: '24px', padding: '10px', width: '180px', textAlign: 'right', border: '1px solid #ccc', borderRadius: '5px' }} />
            <span style={{ fontSize: '20px', marginLeft: '10px' }}>円</span>
          </div>
        </div>

        <div style={{ margin: '20px 0' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>メッセージ（任意）</p>
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="いつもありがとう！" style={{ width: '80%', padding: '12px', marginTop: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>

        <button onClick={handleTransfer} disabled={isButtonDisabled} style={{ marginTop: '20px', padding: '15px 80px', backgroundColor: isButtonDisabled ? '#ccc' : '#D11C1C', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '18px', cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }}>
          送金
        </button>
      </div>
    </div>
  );
}

export default Step4Screen;