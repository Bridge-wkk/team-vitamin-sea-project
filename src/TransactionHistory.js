import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ loginUser }) => {
  const navigate = useNavigate();

  // ★ 履歴全体（請求 + 送金）を管理する
  const [history, setHistory] = useState([]);
  // ★ IDからユーザー情報を引くための辞書
  const [friendsMap, setFriendsMap] = useState({});

  useEffect(() => {
    if (!loginUser) return;

    // 1. friends, requests, send1 の3つ全てからデータを取得
    Promise.all([
      fetch("http://localhost:3010/friends").then((res) => res.json()),
      fetch("http://localhost:3010/requests").then((res) => res.json()),
      fetch("http://localhost:3010/send1").then((res) => res.json())
    ]).then(([friendsData, requestsData, sendsData]) => {
      
      // A. ユーザー辞書(Map)を作成 (IDからアイコン等を引けるようにする)
      const map = {};
      friendsData.forEach((u) => {
        map[u.id] = u;
      });
      setFriendsMap(map);

      // B. 自分が作成した請求だけを抽出
      const myRequests = requestsData.filter(req => req.requesterId === loginUser.id);
      
      // C. 自分が実行した送金 もしくは 受け取り明細（請求によって支払われたものではない）だけを抽出
      const mySends = sendsData.filter(send => send.senderId === loginUser.id || (send.receiverId===loginUser.id && send.type === "transfer"));
      
      // D. 二つを合体させて、日付の新しい順に並べ替える
      const combined = [...myRequests, ...mySends].sort((a, b) => {
        // requestsは createdAt, send1は date という名前で日付を持っている前提
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA; // 新しい順
      });
      
      setHistory(combined);
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
        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>送金・請求履歴</h3>
        
        {history.map((item) => {
          // --- 1. データ種別の判定 ---
          // send1由来のデータには type="transfer" や "request_payment" が入っている想定
          // または receiverId があるかどうかで判定してもOK
          const isTransfer = item.senderId === loginUser.id && (item.type === "transfer" || item.type === "request_payment");
          const isMyReceived = item.receiverId === loginUser.id && item.type === "transfer";

          // --- 2. 請求の場合の支払い状態判定 ---
          // statusが"paid"なら支払い済み
          const isPaidRequest = !isTransfer && item.status === "paid";
          
          // --- 3. 相手の情報を特定 ---
          let targetUser = null;
          if (isTransfer) {
            // 送金なら「送った相手(receiverId)」
            targetUser = friendsMap[item.receiverId];
          } else if (isMyReceived) {
            targetUser = friendsMap[item.senderId];
          } else if (isPaidRequest) {
            // 支払済みの請求なら「払ってくれた人(payerId)」
            targetUser = friendsMap[item.payerId];
          }

          return (
            <div key={item.id + (item.type || 'req')} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '15px 0', 
              borderBottom: '1px solid #f5f5f5' 
            }}>
              
              {/* --- アイコン表示エリア --- */}
              <div style={{ marginRight: '12px', width: '50px', textAlign: 'center' }}>
                {isTransfer ? (
                  // パターンA: 自分が送金した (相手のアイコン)
                  <img 
                    src={targetUser?.icon || "/images/human1.png"} 
                    style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} 
                    alt="" 
                  />
                ) : isPaidRequest && targetUser ? (
                  // パターンB: 請求が支払われた (支払った人のアイコン + チェックマーク)
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={targetUser.icon} 
                      alt={targetUser.name}
                      style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2ecc71' }} 
                    />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#fff', borderRadius: '50%', fontSize: '12px' }}>✅</div>
                  </div>
                ) : isMyReceived ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={targetUser.icon} 
                      alt={targetUser.name}
                      style={{ width: '45px', height: '45px'}} 
                    />
                  </div>
                ) : (
                  // パターンC: 未払いの請求 (封筒アイコン)
                  <div style={{ 
                    width: '45px', height: '45px', borderRadius: '50%', 
                    backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                  }}>
                    ✉️
                  </div>
                )}
              </div>

              {/* --- メインテキストエリア --- */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                  {
                    isTransfer
                      ? `${targetUser?.name || '不明なユーザー'} さんへ送金`
                      : isMyReceived
                        ? `${targetUser?.name || '不明なユーザー'} さんから受取`
                        : `${item.receiverName} さんへの請求リクエスト`
                  }
                  
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {new Date(item.createdAt || item.date).toLocaleString()}
                  
                  {/* 請求が支払われている場合、誰からかも表示 */}
                  {!isTransfer && isPaidRequest && targetUser && (
                    <span style={{ marginLeft: '8px', color: '#2ecc71', fontWeight: 'bold' }}>
                       From: {targetUser.name}
                    </span>
                  )}
                </div>
              </div>

              {/* --- 金額とステータスエリア --- */}
              <div style={{ textAlign: 'right' }}>
                {/* 送金は赤字(-)、請求は黒字 */}
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  color: isTransfer ? '#D11C1C' : '#333' 
                }}>
                  {isTransfer ? "-" : ""}¥{Number(item.amount).toLocaleString()}
                </div>
                
                {/* ステータスバッジ */}
                <div style={{ marginTop: '4px' }}>
                  {isTransfer ? (
                    <span style={{ fontSize: '11px', color: '#28a745' }}>● 送金完了</span>
                  ) : !isMyReceived ? (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: isPaidRequest ? '#2ecc71' : '#f39c12',
                      border: `1px solid ${isPaidRequest ? '#2ecc71' : '#f39c12'}`,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {isPaidRequest ? "支払済" : "請求中"}
                    </span>
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>

            </div>
          );
        })}

        {history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <p>履歴はありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;