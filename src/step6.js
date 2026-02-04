// src/step6.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Step6Screen() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Step4 から渡された「送金相手」「金額」「メッセージ」を受け取る
  const { selectedUser, amount, message } = location.state || {};

  // データがない（直接URLを叩いた場合など）は、何も表示せずにホームへ戻すガード
  if (!selectedUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>エラーが発生しました。最初からやり直してください。</p>
        <button onClick={() => navigate('/')}>ホームへ戻る</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      {/* 完了アイコンとタイトル */}
      <div style={{ marginTop: '60px', color: '#28a745' }}>
        <div style={{ fontSize: '70px', marginBottom: '10px' }}>✔</div>
        <h3 style={{ marginBottom: '30px', color: '#333' }}>送金が完了しました</h3>
      </div>

      {/* 送金内容のカード表示 */}
      <div style={{ 
        backgroundColor: '#fdfdfd', 
        padding: '30px 20px', 
        borderRadius: '15px', 
        border: '1px solid #eee', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        marginBottom: '40px' 
      }}>
        {/* 相手のアイコンと名前 */}
        <img 
          src={selectedUser.icon} 
          style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} 
          alt="" 
        />
        <p style={{ margin: '15px 0 5px', color: '#666', fontSize: '14px' }}>
          {selectedUser.name} さんへ
        </p>
        
        {/* 金額 */}
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#333' }}>
          {Number(amount).toLocaleString()} 円
        </p>

        {/* ★メッセージがあれば吹き出し風に表示 */}
        {message && (
          <div style={{ 
            marginTop: '25px', 
            padding: '15px', 
            backgroundColor: '#f0f7ff', 
            borderRadius: '10px', 
            fontSize: '15px', 
            color: '#444',
            position: 'relative',
            textAlign: 'left'
          }}>
            <small style={{ color: '#007bff', display: 'block', marginBottom: '5px' }}>メッセージ</small>
            "{message}"
          </div>
        )}
      </div>

      {/* ホームに戻るボタン */}
      <button 
        onClick={() => navigate('/home')} 
        style={{ 
          width: '100%', 
          padding: '16px', 
          backgroundColor: '#333', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '10px', 
          fontWeight: 'bold', 
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        ホーム画面へ戻る
      </button>
    </div>
  );
}

export default Step6Screen;