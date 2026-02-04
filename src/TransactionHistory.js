import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ loginUser }) => {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [friendsMap, setFriendsMap] = useState({}); // IDからユーザー情報を引く辞書

  useEffect(() => {
    // 1. 全ユーザー情報を取得して、IDで引ける辞書を作る
    // これにより、payerId: "2" → "images/human2.png" が分かるようになります
    fetch("http://localhost:3010/friends")
      .then((res) => res.json())
      .then((users) => {
        const map = {};
        users.forEach((u) => {
          map[u.id] = u;
        });
        setFriendsMap(map);
      });

    // 2. 自分が作成した請求履歴を取得
    fetch("http://localhost:3010/requests")
      .then((res) => res.json())
      .then((data) => {
        // 自分のIDでフィルタリングし、新しい順に並び替え
        const filtered = data.filter((req) => req.requesterId === loginUser.id);
        const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyRequests(sorted);
      });
  }, [loginUser.id]);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => navigate("/home")} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>＜ 戻る</button>
        <h2 style={{ fontSize: '16px', margin: '0 auto', fontWeight: 'bold' }}>請求・送金履歴</h2>
      </div>

      <div style={{ padding: '15px' }}>
        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>作成した請求</h3>

        {myRequests.map((req) => {
          // 支払い情報があるかチェック
          const isPaid = req.status === "paid";
          const payer = isPaid && req.payerId ? friendsMap[req.payerId] : null;

          return (
            <div key={req.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f5f5f5' }}>

              {/* アイコン部分 */}
              <div style={{ marginRight: '15px', width: '50px', textAlign: 'center' }}>
                {isPaid && payer ? (
                  // ★支払い済みなら、支払ってくれた人のアイコン
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={payer.icon}
                      alt={payer.name}
                      style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2ecc71' }}
                    />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#fff', borderRadius: '50%', fontSize: '12px' }}>✅</div>
                  </div>
                ) : (
                  // ★未払いならデフォルトの封筒アイコン
                  <div style={{
                    width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                  }}>
                    ✉️
                  </div>
                )}
              </div>

              {/* 詳細テキスト */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                  {req.message || "メッセージなし"}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                  {/* 支払い済みなら名前も出す */}
                  {isPaid && payer && (
                    <span style={{ marginLeft: '8px', color: '#2ecc71', fontWeight: 'bold' }}>
                      From: {payer.name}
                    </span>
                  )}
                </div>
              </div>

              {/* 金額とステータス */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                  ¥{Number(req.amount).toLocaleString()}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginTop: '4px',
                  color: isPaid ? '#2ecc71' : '#f39c12',
                  border: `1px solid ${isPaid ? '#2ecc71' : '#f39c12'}`,
                  display: 'inline-block',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {isPaid ? "支払済" : "請求中"}
                </div>
              </div>

            </div>
          );
        })}

        {myRequests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <p>まだ請求履歴がありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;