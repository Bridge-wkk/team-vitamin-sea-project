// src/STEP4.js
import React, { useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';

// 引数の名前を Routers.js と同じ「loginUser」にします
function Step4Screen({ loginUser }) { 
  const location = useLocation();
  const navigate = useNavigate();
  
  // 前の画面（宛先リスト）から届いた相手の情報
  const { selectedUser } = location.state || {}; 

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  // 送金確定処理
  const handleTransfer = async () => {
    const sendAmount = Number(amount);
    
    // 自分の最新残高から引く
    const myNewBalance = loginUser.balance - sendAmount; 
    // 相手の残高を増やす計算
    const friendNewBalance = (selectedUser.balance || 0) + sendAmount;

    try {
      // 自分と相手、両方の残高をDBで更新する
      await fetch(`http://localhost:3010/friends/${loginUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: myNewBalance }),
      });

      await fetch(`http://localhost:3010/friends/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: friendNewBalance }),
      });

      // 完了画面へ移動
      navigate('/step6', { state: { selectedUser, amount: sendAmount, message } });
    } catch (err) {
      console.error("送金エラー:", err);
      alert("送金に失敗しました。");
    }
  };

  // ★ 修正箇所：loginUser.balance を使って判定
  const isButtonDisabled = !amount || Number(amount) <= 0 || Number(amount) > (loginUser?.balance || 0);

  // ★ 修正箇所：チェックする名前を loginUser に統一
  if (!selectedUser || !loginUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>読み込み中、またはデータが不足しています。</p>
        <button onClick={() => navigate("/recipientlist")}>宛先一覧に戻る</button>
      </div>
    );
  }

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
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>
            {loginUser.balance.toLocaleString()}円
          </p>
        </div>

        <div style={{ margin: '30px 0' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>送金金額を入力してください</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="金額" 
              style={{ fontSize: '24px', padding: '10px', width: '180px', textAlign: 'right', border: '1px solid #ccc', borderRadius: '5px' }} 
            />
            <span style={{ fontSize: '20px', marginLeft: '10px' }}>円</span>
          </div>
        </div>

        <button 
          onClick={handleTransfer} 
          disabled={isButtonDisabled} 
          style={{ 
            marginTop: '20px', 
            padding: '15px 80px', 
            backgroundColor: isButtonDisabled ? '#ccc' : '#D11C1C', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px', 
            fontWeight: 'bold', 
            fontSize: '18px',
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          送金
        </button>
      </div>
    </div>
  );
}

export default Step4Screen;