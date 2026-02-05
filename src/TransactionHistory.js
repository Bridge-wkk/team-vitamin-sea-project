import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ loginUser }) => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [friendsMap, setFriendsMap] = useState({});

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("1month");

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

      const myRequests = requestsData.filter(req =>
        req.requesterId === loginUser.id || req.receiverId === loginUser.id
      );

      const mySends = sendsData.filter(send =>
        (send.senderId === loginUser.id || send.receiverId === loginUser.id) && send.type === "transfer"
      );

      const combined = [...myRequests, ...mySends].map(item => ({
        ...item,
        dateObj: new Date(item.createdAt || item.date)
      })).sort((a, b) => b.dateObj - a.dateObj);

      setHistory(combined);
    });
  }, [loginUser]);

  // フィルタリングロジック
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const isTransferType = item.type === "transfer" || item.type === "request_payment";

      // 自分主体のアクションか（送金した/請求した）
      const isMyAction = item.senderId === loginUser.id || item.requesterId === loginUser.id;

      // ★受取済（入金）判定： 「請求の支払いを受けた」 または 「送金を受け取った」
      const isReceived = (!isTransferType && item.status === "paid" && isMyAction) || (isTransferType && !isMyAction);

      // ステータスフィルター
      if (filterStatus === "paid") {
        // 「受取済」タブ: 入金があったもの（支払ったものは除外）
        if (!isReceived) return false;
      } else if (filterStatus === "unpaid") {
        // 未払い（請求中）
        if (isTransferType || item.status !== "unpaid") return false;
      } else if (filterStatus === "transfer") {
        // 送金（出金）: 送金タイプかつ自分が送ったもの + 請求の支払い
        // 「送金」タブの意味合いによりますが、ここでは「自分のお金が出ていったもの」と定義する場合
        const isPayment = (isTransferType && isMyAction) || (!isTransferType && item.status === "paid" && !isMyAction);
        if (!isPayment) return false;
      }

      // 期間フィルター
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

  const openDetail = (item) => {
    const isTransferType = item.type === "transfer" || item.type === "request_payment";
    const kind = isTransferType ? "transfer" : "request";
    navigate(`/transaction/${kind}/${item.id}`, { state: { item } });
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => navigate("/home")} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>＜ 戻る</button>
        <h2 style={{ fontSize: '16px', margin: '0 auto', fontWeight: 'bold' }}>請求・入出金履歴</h2>
      </div>

      <div style={{ padding: '15px' }}>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "5px", marginBottom: "20px" }}>
          {[
            { id: "all", label: "すべて" },
            { id: "unpaid", label: "請求中(未払)" },
            { id: "paid", label: "受取済" },
            { id: "transfer", label: "送金(出金)" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              style={{
                padding: "6px 14px", borderRadius: "20px", border: "none", cursor: 'pointer', fontSize: "13px", whiteSpace: "nowrap",
                backgroundColor: filterStatus === btn.id ? "#333" : "#f0f0f0",
                color: filterStatus === btn.id ? "#fff" : "#666",
                fontWeight: filterStatus === btn.id ? "bold" : "normal",
                transition: "all 0.2s",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            履歴一覧 <span style={{ fontSize: "12px" }}>({filteredHistory.length})</span>
          </h3>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={() => { setFilterPeriod("1month"); setStartDate(""); setEndDate(""); }} style={{ padding: "4px 10px", borderRadius: "15px", border: "1px solid #ccc", fontSize: "11px", cursor: "pointer", backgroundColor: filterPeriod === "1month" ? "#666" : "#fff", color: filterPeriod === "1month" ? "#fff" : "#666", borderColor: filterPeriod === "1month" ? "#666" : "#ccc" }}>直近1ヶ月</button>
            <button onClick={() => { setFilterPeriod("all"); setStartDate(""); setEndDate(""); }} style={{ padding: "4px 10px", borderRadius: "15px", border: "1px solid #ccc", fontSize: "11px", cursor: "pointer", backgroundColor: filterPeriod === "all" ? "#666" : "#fff", color: filterPeriod === "all" ? "#fff" : "#666", borderColor: filterPeriod === "all" ? "#666" : "#ccc" }}>全期間</button>
            <button onClick={() => setFilterPeriod("custom")} style={{ padding: "4px 10px", borderRadius: "15px", border: "1px solid #ccc", fontSize: "11px", cursor: "pointer", backgroundColor: filterPeriod === "custom" ? "#666" : "#fff", color: filterPeriod === "custom" ? "#fff" : "#666", borderColor: filterPeriod === "custom" ? "#666" : "#ccc" }}>指定</button>
          </div>
        </div>

        {filterPeriod === "custom" && (
          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "5px", fontSize: "12px" }}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <span>~</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }} />
          </div>
        )}

        {filteredHistory.map((item) => {
          const isTransferType = item.type === "transfer" || item.type === "request_payment";
          const isPaid = item.status === "paid";
          const isMyAction = item.senderId === loginUser.id || item.requesterId === loginUser.id;

          let targetUser = null;
          if (isTransferType) {
            targetUser = isMyAction ? friendsMap[item.receiverId] : friendsMap[item.senderId];
          } else {
            if (isPaid) {
              targetUser = friendsMap[item.payerId === loginUser.id ? item.requesterId : item.payerId];
            } else {
              targetUser = isMyAction ? friendsMap[item.receiverId] : friendsMap[item.requesterId];
            }
          }

          let titleText = "";
          let amountColor = "#333";
          let amountPrefix = "";
          let statusBadge = null;

          if (isTransferType) {
            if (isMyAction) {
              // 自分が送金した
              titleText = `To: ${targetUser?.name || '不明'}`;
              amountColor = "#D11C1C";
              amountPrefix = "-";
              statusBadge = <span style={{ fontSize: '11px', color: '#28a745' }}>● 送金完了</span>;
            } else {
              // 自分が送金を受け取った
              titleText = `From: ${targetUser?.name || '不明'}`;
              amountColor = "#28a745";
              amountPrefix = "+";
              // ★修正: 送金受取も「受取済」バッジ
              statusBadge = (
                <span style={{
                  fontSize: '11px', fontWeight: 'bold',
                  color: '#2ecc71',
                  border: '1px solid #2ecc71',
                  padding: '2px 6px', borderRadius: '4px'
                }}>
                  受取済
                </span>
              );
            }
          } else {
            // 請求タイプ
            if (isMyAction) {
              titleText = `To: ${targetUser?.name || '不明'} (請求)`;
              if (isPaid) {
                amountColor = "#28a745"; // 緑
                amountPrefix = "+";      // プラス
              }
            } else {
              titleText = `From: ${targetUser?.name || '不明'} (請求)`;
              if (isPaid) {
                amountColor = "#D11C1C"; // 赤
                amountPrefix = "-";
              }
            }

            // ★修正: バッジの文言を「受取済」と「支払済」で出し分け
            let badgeText = "請求中";
            let badgeColor = "#f39c12"; // デフォルト（未完了）の色

            if (isPaid) {
              badgeColor = "#2ecc71"; // 完了の色
              if (isMyAction) {
                badgeText = "受取済"; // 自分が請求して完了 ＝ 受け取った
              } else {
                badgeText = "支払済"; // 自分が請求されて完了 ＝ 支払った
              }
            } else {
              if (!isMyAction) {
                badgeText = "未払";   // 請求されている状態
              }
            }

            statusBadge = (
              <span style={{
                fontSize: '11px', fontWeight: 'bold',
                color: badgeColor,
                border: `1px solid ${badgeColor}`,
                padding: '2px 6px', borderRadius: '4px'
              }}>
                {badgeText}
              </span>
            );
          }

          return (
            <div
              key={item.id + (item.type || 'req')}
              onClick={() => openDetail(item)}
              style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
            >
              <div style={{ marginRight: '12px', width: '50px', textAlign: 'center' }}>
                {isTransferType ? (
                  <img src={targetUser?.icon || "/images/human1.png"} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                ) : isPaid ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={targetUser?.icon} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2ecc71' }} />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#fff', borderRadius: '50%', fontSize: '12px' }}>✅</div>
                  </div>
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    ✉️
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                  {titleText}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {new Date(item.createdAt || item.date).toLocaleString()}
                  <div style={{ fontSize: '10px', color: '#ccc' }}>{item.message}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {/* ★修正: ¥マーク削除 */}
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: amountColor }}>
                  {amountPrefix}{Number(item.amount).toLocaleString()}
                </div>
                <div style={{ marginTop: '4px' }}>
                  {statusBadge}
                </div>
                <div style={{ fontSize: "16px", color: "#bbb", marginTop: "6px" }}>›</div>
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