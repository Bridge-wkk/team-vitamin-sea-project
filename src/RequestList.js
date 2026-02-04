import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RequestList.css"; // 必要に応じてスタイルを作成してください

const RequestList = ({ loginUser }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // 自分宛ての未払い請求（pending）を取得
    fetch(`http://localhost:3010/requests?targetId=${loginUser.id}&status=pending`)
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, [loginUser]);

  // ★ 経過日数を計算する関数
  const getDaysElapsed = (dateString) => {
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
          <p style={{ textAlign: 'center', color: '#999' }}>新しい請求はありません</p>
        ) : (
          <div className="history-list">
            {requests.map((req) => (
              <div 
                key={req.id} 
                className="history-item"
                onClick={() => navigate(`/payrequest?requesterId=${req.requesterId}&amount=${req.amount}&message=${req.message}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #eee', padding: '15px 0' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{req.requesterName} 様</span>
                  <span style={{ color: '#D11C1C', fontWeight: 'bold' }}>{Number(req.amount).toLocaleString()} 円</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  <span>作成日: {new Date(req.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: '#ff4d4f' }}>（{getDaysElapsed(req.createdAt)}）</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/")} style={{ marginTop: '20px' }}>
          トップへ戻る
        </button>
      </div>
    </div>
  );
};

export default RequestList;