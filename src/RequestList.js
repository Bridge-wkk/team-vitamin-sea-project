import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequestList = ({ loginUser }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]); // 連絡先データを保存

  useEffect(() => {
    if (loginUser) {
      // 1. 連絡先（アイコン取得用）を読み込む
      fetch('http://localhost:3010/friends')
        .then(res => res.json())
        .then(data => setFriends(data));

      // 2. 自分宛ての未払い請求（unpaid）を読み込む
      fetch(`http://localhost:3010/requests?receiverId=${loginUser.id}&status=unpaid`)
        .then(res => res.json())
        .then(data => setRequests(data));
    }
  }, [loginUser]);

  // ★ アイコン画像を探す関数（これがないとエラーになります！）
  const getUserIcon = (userId) => {
    const friend = friends.find(f => f.id === userId);
    return friend ? friend.icon : "/images/human1.png"; 
  };

  // 経過日数を計算する関数
  const getDaysElapsed = (dateString) => {
    if (!dateString) return "";
    const start = new Date(dateString);
    const today = new Date();
    const diff = today - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "今日" : `${days}日前`;
  };

  return (
    <div className="page">
      <div className="screen">
        <h2 className="screen-title">未払いの請求一覧</h2>
        
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: '#999' }}>新しい請求はありません</p>
          </div>
        ) : (
          <div className="history-list">
            {requests.map((req) => (
              <div 
                key={req.id} 
                className="history-item"
                onClick={() => navigate(`/payrequest?requesterId=${req.requesterId}&amount=${req.amount}&message=${req.message}&requestId=${req.id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #eee', padding: '15px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  {/* アイコンの表示 */}
                  <img 
                    src={getUserIcon(req.requesterId)} 
                    alt="" 
                    style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '15px' }} 
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{req.requesterName} 様</span>
                      <span style={{ color: '#D11C1C', fontWeight: 'bold', fontSize: '16px' }}>
                        {Number(req.amount).toLocaleString()} 円
                      </span>
                    </div>

                    {/* メッセージの表示 */}
                    {req.message && (
                      <div style={{ 
                        backgroundColor: '#f9f9f9', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        marginTop: '8px',
                        fontSize: '13px',
                        color: '#555',
                        borderLeft: '3px solid #ddd'
                      }}>
                        {req.message}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginTop: '8px' }}>
                      <span>作成日: {new Date(req.createdAt).toLocaleDateString()}</span>
                      <span style={{ color: '#ff4d4f' }}>（{getDaysElapsed(req.createdAt)}）</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          className="back-btn" 
          onClick={() => navigate("/")} 
          style={{ 
            marginTop: '30px', 
            width: '100%', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            backgroundColor: '#fff'
          }}
        >
          トップへ戻る
        </button>
      </div>
    </div>
  );
};

export default RequestList;