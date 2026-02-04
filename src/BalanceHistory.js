import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BalanceHistory = ({ loginUser }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const [processedHistory, setProcessedHistory] = useState([]);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [filterType, setFilterType] = useState("1month"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!loginUser) return;

    Promise.all([
      fetch(`http://localhost:3010/friends/${loginUser.id}`).then(res => res.json()),
      fetch("http://localhost:3010/send1").then(res => res.json())
    ])
    .then(([userData, transactionData]) => {
        const latestBalance = Number(userData.balance);
        setDisplayBalance(latestBalance);

        const myData = transactionData.filter(
          (item) => item.senderId === loginUser.id || item.receiverId === loginUser.id
        );

        const sortedDesc = myData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 最新の残高から過去へ逆算
        let currentCalcBalance = latestBalance;
        
        const historyWithBalance = sortedDesc.map((item) => {
          const isPayment = item.senderId === loginUser.id;
          const amount = Number(item.amount);
          
          // その時点の残高（マイナスも許容してそのまま表示）
          const balanceAtThatTime = currentCalcBalance;

          if (isPayment) currentCalcBalance += amount; 
          else currentCalcBalance -= amount;

          return {
            ...item,
            amount,
            balance: balanceAtThatTime,
            isPayment,
            diff: isPayment ? -amount : amount,
            dateKey: new Date(item.date).toISOString().split('T')[0],
            dateObj: new Date(item.date)
          };
        });

        setProcessedHistory(historyWithBalance);
      })
      .catch((err) => console.error("データ取得エラー:", err));

  }, [loginUser]);


  const { groupedList, graphData } = useMemo(() => {
    let data = [...processedHistory];

    if (filterType === "1month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      data = data.filter(d => d.dateObj >= oneMonthAgo);
    } else if (filterType === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      data = data.filter(d => d.dateObj >= start && d.dateObj <= end);
    }

    const groups = new Map();
    data.forEach(tx => {
      if (!groups.has(tx.dateKey)) {
        groups.set(tx.dateKey, {
          dateKey: tx.dateKey,
          dateLabel: tx.dateObj.toLocaleDateString(),
          totalDiff: 0,
          closingBalance: 0,
          transactions: []
        });
      }
      const group = groups.get(tx.dateKey);
      
      // その日の最初のデータ（＝時系列で最も新しいデータ）の残高を、その日の最終残高とする
      if (group.transactions.length === 0) {
        group.closingBalance = tx.balance;
      }

      group.totalDiff += tx.diff;
      group.transactions.push(tx);
    });
    const groupedList = Array.from(groups.values());

    const graphDataRaw = [];
    Array.from(groups.values()).reverse().forEach(group => {
       graphDataRaw.push({
         dateLabel: group.dateLabel, 
         balance: group.closingBalance, 
         totalDiff: group.totalDiff
       });
    });

    return { groupedList, graphData: graphDataRaw };
  }, [processedHistory, filterType, startDate, endDate]);


  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [graphData]); 


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          padding: "8px 12px", 
          border: "1px solid #eee", 
          borderRadius: "6px", 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
          minWidth: "160px", 
          whiteSpace: "nowrap"
        }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888" }}>{data.dateLabel}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#333" }}>残高</span>
            <span>
              <span style={{ fontSize: "15px", fontWeight: "bold", color: "#333" }}>{data.balance.toLocaleString()}</span>
              <span style={{ fontSize: "11px", color: "#888", marginLeft: "2px" }}>円</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartWidth = Math.max(window.innerWidth - 40, graphData.length * 50);

  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "40px" }}>
      {/* ヘッダー */}
      <div style={{ backgroundColor: "#fff", padding: "15px", display: "flex", alignItems: "center", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/home")} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#007bff" }}>
          ＜
        </button>
        <h2 style={{ fontSize: "16px", margin: "0 auto", fontWeight: "bold", color: "#333" }}>残高推移</h2>
        <div style={{ width: "20px" }}></div>
      </div>

      <div style={{ padding: "20px" }}>
        
        {/* 現在の残高 */}
        <div style={{ textAlign: "center", marginBottom: "25px", marginTop: "10px" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>現在の残高</span>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#333", marginTop: "4px" }}>
             {displayBalance.toLocaleString()}
             <span style={{ fontSize: "16px", color: "#888", fontWeight: "normal", marginLeft: "4px" }}>円</span>
          </div>
        </div>

        {/* 期間切り替え */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "25px" }}>
            {["1month", "all"].map(type => (
              <button 
                key={type}
                onClick={() => { setFilterType(type); setStartDate(""); setEndDate(""); }}
                style={{ 
                  padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold",
                  backgroundColor: filterType === type ? "#333" : "#e0e0e0",
                  color: filterType === type ? "#fff" : "#666",
                  transition: "all 0.2s"
                }}
              >
                {type === "1month" ? "直近1ヶ月" : "全期間"}
              </button>
            ))}
            <button 
                onClick={() => setFilterType("custom")}
                style={{ 
                  padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold",
                  backgroundColor: filterType === "custom" ? "#333" : "#e0e0e0",
                  color: filterType === "custom" ? "#fff" : "#666",
                  transition: "all 0.2s"
                }}
            >
              指定
            </button>
        </div>
        
        {filterType === "custom" && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "12px" }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "#fff" }} />
              <span style={{ color: "#888" }}>~</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "#fff" }} />
            </div>
        )}

        {/* グラフエリア */}
        <div 
          ref={scrollContainerRef}
          style={{ 
            backgroundColor: "#fff", 
            borderRadius: "16px", 
            height: "240px", 
            marginBottom: "30px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)", 
            overflowX: "auto", 
            whiteSpace: "nowrap",
            padding: "20px 10px 10px 0"
          }}
        >
          {graphData.length > 0 ? (
            <div style={{ width: `${chartWidth}px`, height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 10, fill: '#aaa' }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    dy={10}
                  />
                  <YAxis 
                    width={50} 
                    tick={{ fontSize: 10, fill: '#aaa' }} 
                    axisLine={false} 
                    tickLine={false} 
                    domain={['auto', 'auto']} 
                    tickFormatter={(val) => `${(val/10000).toFixed(0)}万`} // 簡略表示ですっきりさせる
                  />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: '#ddd', strokeWidth: 1, strokeDasharray: '4 4' }} 
                    position={{ y: -40 }} // ツールチップをグラフの上に逃がす
                  />
                  <Line 
                    type="monotone" dataKey="balance" stroke="#007bff" strokeWidth={2.5} dot={{ r: 3, fill: "#fff", stroke: "#007bff", strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: "#007bff", stroke: "#fff", strokeWidth: 3 }} animationDuration={500} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ccc', fontSize: '13px' }}>
              データがありません
            </div>
          )}
        </div>

        {/* 明細リスト（残高明細形式・スッキリ版） */}
        <h3 style={{ fontSize: "13px", color: "#888", marginBottom: "12px", marginLeft: "4px" }}>明細</h3>
        
        {groupedList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "13px" }}>
            表示する明細がありません
          </div>
        ) : (
          groupedList.map((group) => (
            <div key={group.dateKey} style={{ marginBottom: "24px" }}>
              {/* 日付ヘッダー（シンプル化：日付と変動計のみ） */}
              <div style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                marginBottom: "8px", padding: "0 4px"
              }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#888" }}>{group.dateLabel}</span>
                <span style={{ fontSize: "11px", color: "#888" }}>
                  日計: 
                  <span style={{ color: group.totalDiff < 0 ? "#D11C1C" : "#28a745", fontWeight: "bold", marginLeft: "4px" }}>
                    {group.totalDiff > 0 ? "+" : ""}{group.totalDiff.toLocaleString()}
                  </span>
                </span>
              </div>

              {/* 取引詳細カード */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {group.transactions.map((tx) => (
                  <div key={tx.id} style={{ 
                    backgroundColor: "#fff", 
                    borderRadius: "12px", 
                    padding: "14px 16px", 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    {/* 左側：相手と内容 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "60%" }}>
                       <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                         {tx.isPayment ? `To: ${tx.receiverName}` : `From: ${tx.senderName}`}
                       </div>
                       <div style={{ fontSize: "11px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                         {tx.message || "メッセージなし"}
                       </div>
                    </div>

                    {/* 右側：金額と残高（縦並びで整理） */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                       {/* 変動額 */}
                       <div style={{ fontSize: "15px", fontWeight: "bold", color: tx.isPayment ? "#D11C1C" : "#28a745" }}>
                         {tx.isPayment ? "-" : "+"}{tx.amount.toLocaleString()}
                       </div>
                       {/* その時点の残高（控えめな色で表示） */}
                       <div style={{ fontSize: "11px", color: "#aaa" }}>
                         残高: {tx.balance.toLocaleString()}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BalanceHistory;