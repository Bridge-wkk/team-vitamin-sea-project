// RecipientList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // navigateをインポート

function RecipientList() {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate(); // navigateを使えるようにする

  useEffect(() => {
    fetch('http://localhost:3010/friends')
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => console.error("データ取得エラー:", err));
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>送金相手を選択</h2>
      </div>

      <div>
        {friends.map(friend => (
          <div 
            key={friend.id} 
            onClick={() => navigate('/step4', { state: { selectedUser: friend } })} // ここを追加！
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