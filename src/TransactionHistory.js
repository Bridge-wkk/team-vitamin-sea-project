import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ loginUser }) => {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]); // 自分が送った請求

  useEffect(() => {
    // 1. db.json の requests からデータを取得
    fetch("http://localhost:3010/requests")
      .then((res) => res.json())
      .then((data) => {
        // 2. ログインユーザーが作成した請求だけをフィルタリング
        const filtered = data.filter(req => req.requesterId === loginUser.id);
        setMyRequests(filtered.reverse()); // 新しい順にする
      });
  }, [loginUser.id]);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => navigate("/")} style={{ background: 'none', border: 'none', fontSize: '18px' }}>＜ 戻る</button>
        <h2 style={{ fontSize: '17px', margin: '0 auto' }}>請求・送金履歴</h2>
      </div>

      <div style={{ padding: '15px' }}>
        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>送金・請求履歴</h3>
        
        {myRequests.map((req) => (
          <div key={req.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '15px 0', 
            borderBottom: '1px solid #f5f5f5' 
          }}>
            {/* 請求時のアイコン（固定、または友達リストから検索） */}
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              backgroundColor: '#eee', marginRight: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
            }}>
              ✉️
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{req.message || "メッセージなし"}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                作成日: {new Date(req.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                ¥{Number(req.amount).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#f39c12' }}>● 請求済み</div>
            </div>
          </div>
        ))}

        {myRequests.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '30px' }}>履歴はありません</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;