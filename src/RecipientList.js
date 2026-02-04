// RecipientList.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // navigateをインポート

function RecipientList({ loginUser }) {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate(); // navigateを使えるようにする
  const location = useLocation();

  const handleSelect = (user) => {
  // App.js から渡されたモードを確認
  if (location.state?.mode === "request") {
    // ★請求モードなら CreateRequest へ相手情報を渡して飛ばす
    navigate("/createrequest", { state: { selectedUser: user } });
  } else {
    // ★通常（送金）なら STEP4.js へ
    navigate("/step4", { state: { selectedUser: user } });
  }
};

  useEffect(() => {
    fetch('http://localhost:3010/friends')
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => console.error("データ取得エラー:", err));
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '10px 15px', 
      borderBottom: '1px solid #ddd',
      position: 'relative', // タイトルを中央にするための基準
      height: '50px'        // 高さを固定すると安定します
    }}>
      {/* 戻るボタン：左端に配置 */}
      <button 
        onClick={() => navigate("/home")} 
        style={{ 
          background: 'none',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 1 // タイトルの上に持ってくる
        }}
      >
        ＜ 戻る
      </button>

      {/* タイトル：画面の真ん中に配置 */}
      <h2 style={{ 
        fontSize: '18px', 
        margin: 0,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none' // ボタンのクリックを邪魔しない設定
      }}>
        送金相手を選択
      </h2>
    </div>

      <div>
        {friends
        .filter(friend => friend.id !== loginUser?.id)
        .map(friend => (
          <div 
            key={friend.id} 
            onClick={() => handleSelect(friend)} // ここを追加！
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '15px', 
              borderBottom: '1px solid #eee', 
              cursor: 'pointer' // マウスを乗せたときに指の形にする
            }}
          >
            <img 
              src={friend.icon}
              alt={friend.name}
              style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} 
            />
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{friend.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipientList;