// src/step4.js
import React from 'react';

function Step4Screen({ selectedUser, onBack, onNext }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <header style={{ textAlign: 'left' }}>
        <button onClick={onBack}>＜ 戻る</button>
      </header>

      <div style={{ marginTop: '40px' }}>
        <h3>{selectedUser.name} さんへ送金</h3>
        <img src={selectedUser.icon} style={{ width: '80px', borderRadius: '50%' }} alt="" />
        
        <div style={{ margin: '30px 0' }}>
          <p>送金金額を入力してください</p>
          <input 
            type="number" 
            placeholder="金額を入力" 
            style={{ fontSize: '24px', padding: '10px', width: '200px', textAlign: 'right' }}
          />
          <span style={{ fontSize: '20px', marginLeft: '10px' }}>円</span>
        </div>

        <button 
          onClick={onNext}
          style={{ padding: '15px 50px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 'bold' }}
        >
          次へ
        </button>
      </div>
    </div>
  );
}

export default Step4Screen;