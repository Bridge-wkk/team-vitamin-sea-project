import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ loginUser }) => {
  const navigate = useNavigate();
  // ★ 請求と送金を混ぜた「履歴全体」を管理する箱
  const [history, setHistory] = useState([]); 

  useEffect(() => {
    if (!loginUser) return;

    // 1. db.json の requests と send1 の両方からデータを取得
    Promise.all([
      fetch("http://localhost:3010/requests").then((res) => res.json()),
      fetch("http://localhost:3010/send1").then((res) => res.json())
    ]).then(([requests, sends]) => {
      
      // 2. 自分が作成した請求だけを抽出
      const myRequests = requests.filter(req => req.requesterId === loginUser.id);
      
      // 3. 自分が実行した送金だけを抽出
      const mySends = sends.filter(send => send.senderId === loginUser.id);
      
      // 4. 二つを合体させて、日付の新しい順に並べ替える
      const combined = [...myRequests, ...mySends].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA; // 新しい順
      });
      
      setHistory(combined);
    });
  }, [loginUser.id]);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ddd' }}>
        {/* ★ navigate("/home") にしてログイン画面に戻るのを防ぐ */}
        <button onClick={() => navigate("/home")} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>＜ 戻る</button>
        <h2 style={{ fontSize: '17px', margin: '0 auto' }}>請求・送金履歴</h2>
      </div>

      <div style={{ padding: '15px' }}>
        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>送金・請求履歴</h3>
        
        {history.map((item) => (
          <div key={item.id + (item.type || 'req')} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '15px 0', 
            borderBottom: '1px solid #f5f5f5' 
          }}>
            {/* アイコン表示：送金なら相手のアイコン、請求なら封筒 */}
            <div style={{ marginRight: '12px' }}>
              {item.type === "transfer" ? (
                <img src={item.receiverIcon} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
              ) : (
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                }}>
                  ✉️
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {/* 表示テキストの出し分け */}
              <div style={{ fontWeight: 'bold' }}>
                {item.type === "transfer" ? `${item.receiverName} さんへ送金` : (item.message || "請求リクエスト")}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(item.createdAt || item.date).toLocaleString()}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {/* 送金の場合は金額を赤字にするなどの演出 */}
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '16px', 
                color: item.type === "transfer" ? '#D11C1C' : '#333' 
              }}>
                {item.type === "transfer" ? "-" : ""}¥{Number(item.amount).toLocaleString()}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: item.type === "transfer" ? '#28a745' : '#f39c12' 
              }}>
                ● {item.type === "transfer" ? "送金完了" : "請求済み"}
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '30px' }}>履歴はありません</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;