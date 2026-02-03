// src/step6.js
import React from 'react';

function Step6Screen({ selectedUser, amount, onHome }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ marginTop: '80px', color: '#28a745' }}>
        <div style={{ fontSize: '60px' }}>✔</div>
        <h3 style={{ marginBottom: '30px' }}>送金が完了しました</h3>
      </div>

      <div style={{ backgroundColor: '#fdfdfd', padding: '25px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '40px' }}>
        <img src={selectedUser.icon} style={{ width: '60px', borderRadius: '50%' }} alt="" />
        <p style={{ margin: '10px 0', color: '#666' }}>{selectedUser.name} さんへ</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>{amount} 円</p>
      </div>

      <button 
        onClick={onHome}
        style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px' }}
      >
        ホーム画面へ戻る
      </button>
    </div>
  );
}

export default Step6Screen;