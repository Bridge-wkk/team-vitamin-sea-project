import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ loginUser }) => {
  const navigate = useNavigate();

  // 履歴全体
  const [history, setHistory] = useState([]);
  // ユーザー辞書
  const [friendsMap, setFriendsMap] = useState({});

  // ★ フィルター用のState
  const [filterStatus, setFilterStatus] = useState("all"); // all, paid, unpaid, transfer
  const [filterPeriod, setFilterPeriod] = useState("1month"); // デフォルト: 1month
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!loginUser) return;

    Promise.all([
      fetch("http://localhost:3010/friends").then((res) => res.json()),
      fetch("http://localhost:3010/requests").then((res) => res.json()),
      fetch("http://localhost:3010/send1").then((res) => res.json())
    ]).then(([friendsData, requestsData, sendsData]) => {
      
      const map = {};
      friendsData.forEach((u) => { map[u.id] = u; });
      setFriendsMap(map);

      const myRequests = requestsData.filter(req => req.requesterId === loginUser.id);
      const mySends = sendsData.filter(send => send.senderId === loginUser.id);
      
      const combined = [...myRequests, ...mySends].map(item => ({
        ...item,
        dateObj: new Date(item.createdAt || item.date)
      })).sort((a, b) => b.dateObj - a.dateObj);
      
      setHistory(combined);
    });
  }, [loginUser]);

  // ★ フィルタリングロジック
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // 1. データ種別判定
      const isTransfer = item.senderId === loginUser.id && (item.type === "transfer" || item.type === "request_payment");
      const isRequest = !isTransfer;

      // --- ステータスフィルター ---
      if (filterStatus === "paid") {
        if (!isRequest || item.status !== "paid") return false;
      } else if (filterStatus === "unpaid") {
        if (!isRequest || item.status !== "unpaid") return false;
      } else if (filterStatus === "transfer") {
        if (!isTransfer) return false;
      }

      // --- 期間フィルター ---
      if (filterPeriod === "1month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        if (item.dateObj.getTime() < oneMonthAgo.getTime()) return false;
      } else if (filterPeriod === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (item.dateObj < start || item.dateObj > end) return false;
      }

      return true;
    });
  }, [history, filterStatus, filterPeriod, startDate, endDate, loginUser.id]);


  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => navigate("/home")} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>＜ 戻る</button>
        <h2 style={{ fontSize: '16px', margin: '0 auto', fontWeight: 'bold' }}>請求・送金履歴</h2>
      </div>

      <div style={{ padding: '15px' }}>
        
        {/* ★ 種別・ステータス切り替え (上部に配置) */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', marginBottom: '20px' }}>
          {[
            { id: 'all', label: 'すべて' },
            { id: 'unpaid', label: '請求中(未払)' },
            { id: 'paid', label: '受取済' },
            { id: 'transfer', label: '送金' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
                backgroundColor: filterStatus === btn.id ? '#333' : '#f0f0f0',
                color: filterStatus === btn.id ? '#fff' : '#666',
                fontWeight: filterStatus === btn.id ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ★ 見出し行 + 期間絞り込みボタン (右寄せ) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            履歴一覧 <span style={{ fontSize: '12px' }}>({filteredHistory.length})</span>
          </h3>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => { setFilterPeriod("1month"); setStartDate(""); setEndDate(""); }}
              style={{ 
                padding: '4px 10px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '11px', cursor: 'pointer',
                backgroundColor: filterPeriod === '1month' ? '#666' : '#fff',
                color: filterPeriod === '1month' ? '#fff' : '#666',
                borderColor: filterPeriod === '1month' ? '#666' : '#ccc'
              }}
            >直近1ヶ月</button>
            <button 
              onClick={() => { setFilterPeriod("all"); setStartDate(""); setEndDate(""); }}
              style={{ 
                padding: '4px 10px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '11px', cursor: 'pointer',
                backgroundColor: filterPeriod === 'all' ? '#666' : '#fff',
                color: filterPeriod === 'all' ? '#fff' : '#666',
                borderColor: filterPeriod === 'all' ? '#666' : '#ccc'
              }}
            >全期間</button>
            <button 
              onClick={() => setFilterPeriod("custom")}
              style={{ 
                padding: '4px 10px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '11px', cursor: 'pointer',
                backgroundColor: filterPeriod === 'custom' ? '#666' : '#fff',
                color: filterPeriod === 'custom' ? '#fff' : '#666',
                borderColor: filterPeriod === 'custom' ? '#666' : '#ccc'
              }}
            >指定</button>
          </div>
        </div>

        {/* 日付指定入力エリア (指定が選ばれている時だけ表示) */}
        {filterPeriod === 'custom' && (
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <span>~</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
        )}

        {/* リスト表示 */}
        {filteredHistory.map((item) => {
          const isTransfer = item.senderId === loginUser.id && (item.type === "transfer" || item.type === "request_payment");
          const isPaidRequest = !isTransfer && item.status === "paid";
          
          let targetUser = null;
          if (isTransfer) {
            targetUser = friendsMap[item.receiverId];
          } else if (isPaidRequest) {
            targetUser = friendsMap[item.payerId];
          } else {
            targetUser = friendsMap[item.receiverId];
          }

          return (
            <div key={item.id + (item.type || 'req')} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f5f5f5' }}>
              {/* アイコン */}
              <div style={{ marginRight: '12px', width: '50px', textAlign: 'center' }}>
                {isTransfer ? (
                  <img src={targetUser?.icon || "/images/human1.png"} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                ) : isPaidRequest && targetUser ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={targetUser.icon} alt={targetUser.name} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2ecc71' }} />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#fff', borderRadius: '50%', fontSize: '12px' }}>✅</div>
                  </div>
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    ✉️
                  </div>
                )}
              </div>

              {/* テキスト */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                  {isTransfer ? `${targetUser?.name || '不明なユーザー'} さんへ送金` : `${item.receiverName} さんへの請求`}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {new Date(item.createdAt || item.date).toLocaleString()}
                  {!isTransfer && isPaidRequest && targetUser && (
                    <span style={{ marginLeft: '8px', color: '#2ecc71', fontWeight: 'bold' }}>From: {targetUser.name}</span>
                  )}
                </div>
              </div>

              {/* 金額・ステータス */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: isTransfer ? '#D11C1C' : '#333' }}>
                  {isTransfer ? "-" : ""}¥{Number(item.amount).toLocaleString()}
                </div>
                <div style={{ marginTop: '4px' }}>
                  {isTransfer ? (
                    <span style={{ fontSize: '11px', color: '#28a745' }}>● 送金完了</span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: isPaidRequest ? '#2ecc71' : '#f39c12', border: `1px solid ${isPaidRequest ? '#2ecc71' : '#f39c12'}`, padding: '2px 6px', borderRadius: '4px' }}>
                      {isPaidRequest ? "受取済" : "請求中"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <p>条件に一致する履歴はありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;