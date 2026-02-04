import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const BalanceHistory = ({ loginUser }) => {
  const navigate = useNavigate();
  
  const [allDailyData, setAllDailyData] = useState([]);
  const [filterType, setFilterType] = useState("all"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!loginUser) return;

    // Fetch transactions from the JSON server
    fetch("http://localhost:3010/send1")
      .then((res) => res.json())
      .then((data) => {
        
        // 1. Filter data related to the logged-in user
        const myData = data.filter(
          (item) => item.senderId === loginUser.id || item.receiverId === loginUser.id
        );

        // 2. Sort by date descending (newest first) for reverse calculation
        const sortedDesc = myData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 3. Calculate balance history
        let currentCalcBalance = Number(loginUser.balance);
        const transactionsWithBalance = sortedDesc.map((item) => {
          const isPayment = item.senderId === loginUser.id;
          const amount = Number(item.amount);
          
          const balanceAtThatTime = currentCalcBalance;

          if (isPayment) currentCalcBalance += amount; 
          else currentCalcBalance -= amount;           

          return {
            ...item,
            amount,
            balance: balanceAtThatTime,
            isPayment,
            diff: isPayment ? -amount : amount,
            dateKey: new Date(item.date).toISOString().split('T')[0] // YYYY-MM-DD
          };
        });

        // 4. Aggregate data by date
        const dailyMap = new Map();
        // Process chronologically (oldest first) to stack balances correctly
        [...transactionsWithBalance].reverse().forEach(tx => {
          const dateKey = tx.dateKey;
          if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
              dateKey: dateKey,
              dateLabel: new Date(tx.date).toLocaleDateString(),
              balance: tx.balance, 
              totalDiff: 0,        
              transactions: []     
            });
          }
          const dayData = dailyMap.get(dateKey);
          dayData.balance = tx.balance; 
          dayData.totalDiff += tx.diff;
          dayData.transactions.push(tx);
        });

        setAllDailyData(Array.from(dailyMap.values()));
      })
      .catch((err) => console.error("Error fetching history data:", err));

  }, [loginUser]);

  // --- Filtering Logic ---
  const filteredList = useMemo(() => {
    let data = [...allDailyData];
    if (filterType === "1month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      data = data.filter(d => new Date(d.dateKey) >= oneMonthAgo);
    } else if (filterType === "custom" && startDate && endDate) {
      data = data.filter(d => {
        const target = new Date(d.dateKey);
        return target >= new Date(startDate) && target <= new Date(endDate);
      });
    }
    return data.reverse();
  }, [allDailyData, filterType, startDate, endDate]);


  // --- Custom Tooltip ---
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.98)", 
          padding: "8px 12px", 
          border: "1px solid #ccc", 
          borderRadius: "6px", 
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)", 
          minWidth: "200px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "baseline", 
          gap: "12px", 
          whiteSpace: "nowrap"
        }}>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#333" }}>
            {data.dateLabel}
          </span>
          <div>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: data.totalDiff < 0 ? "#D11C1C" : "#28a745" }}>
               {data.totalDiff > 0 ? "+" : ""}{data.totalDiff.toLocaleString()}
            </span>
            <span style={{ fontSize: "11px", color: "#333", marginLeft: "2px", fontWeight: "normal" }}>円</span>
          </div>
          <span style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>
             残高: <span style={{ color: "#333", fontSize: "13px" }}>{data.balance.toLocaleString()}</span>
             <span style={{ fontSize: "11px", color: "#333", marginLeft: "2px", fontWeight: "normal" }}>円</span>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: "#f9f9f9", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#fff", padding: "15px", display: "flex", alignItems: "center", borderBottom: "1px solid #ddd" }}>
        <button onClick={() => navigate("/home")} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>
          ＜ 戻る
        </button>
        <h2 style={{ fontSize: "16px", margin: "0 auto", fontWeight: "bold" }}>残高推移</h2>
      </div>

      <div style={{ padding: "20px" }}>
        
        {/* Current Balance */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "12px", color: "#666" }}>現在の残高</span>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
             {loginUser ? Number(loginUser.balance).toLocaleString() : 0}
             <span style={{ fontSize: "16px", color: "#333", fontWeight: "normal" }}> 円</span>
          </div>
        </div>

        {/* Graph Area */}
        <div style={{ 
          backgroundColor: "#fff", padding: "10px 10px 0 0", borderRadius: "15px", 
          height: "260px", marginBottom: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", position: "relative"
        }}>
          {allDailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={allDailyData} margin={{ top: 40, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="dateLabel" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} minTickGap={30} 
                />
                <YAxis 
                  width={60} tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} 
                  tickFormatter={(val) => `${val.toLocaleString()}円`}
                />
                <Tooltip 
                  content={<CustomTooltip />} position={{ y: 0 }} cursor={{ stroke: '#aaa', strokeWidth: 1 }} 
                />
                <Line 
                  type="monotone" dataKey="balance" stroke="#007bff" strokeWidth={3} dot={{ r: 0 }} 
                  activeDot={{ r: 6, fill: "#007bff", stroke: "#fff", strokeWidth: 2 }} animationDuration={1000} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999', fontSize: '12px' }}>
              データがありません
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div style={{ marginBottom: "20px", backgroundColor: "#fff", padding: "15px", borderRadius: "8px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#666", fontWeight: "bold" }}>明細絞り込み</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
            <button onClick={() => { setFilterType("all"); setStartDate(""); setEndDate(""); }} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", backgroundColor: filterType === "all" ? "#333" : "#eee", color: filterType === "all" ? "#fff" : "#333" }}>全期間</button>
            <button onClick={() => { setFilterType("1month"); setStartDate(""); setEndDate(""); }} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", backgroundColor: filterType === "1month" ? "#333" : "#eee", color: filterType === "1month" ? "#fff" : "#333" }}>直近1ヶ月</button>
            <button onClick={() => setFilterType("custom")} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", backgroundColor: filterType === "custom" ? "#333" : "#eee", color: filterType === "custom" ? "#fff" : "#333" }}>日付指定</button>
          </div>
          {filterType === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#666", fontSize: "12px" }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
              <span>~</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
          )}
        </div>

        {/* Detail List */}
        <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>日別明細一覧</h3>
        {filteredList.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", marginTop: "30px", fontSize: "12px" }}>該当する明細はありません</p>
        ) : (
          filteredList.map((dayData) => (
            <div key={dayData.dateKey} style={{ marginBottom: "15px" }}>
              {/* Date Header */}
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px", paddingBottom: "5px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>{dayData.dateLabel}</span>
                <span>日計: <span style={{ color: dayData.totalDiff < 0 ? "#D11C1C" : "#28a745", fontWeight: "bold", marginLeft: "4px", fontSize: "13px" }}>{dayData.totalDiff > 0 ? "+" : ""}{dayData.totalDiff.toLocaleString()}</span><span style={{ color: "#333", fontSize: "11px", fontWeight: "normal", marginLeft: "1px" }}>円</span></span>
              </div>
              {/* Transaction Details */}
              {dayData.transactions.map((tx) => (
                <div key={tx.id} style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "12px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>{tx.isPayment ? `To: ${tx.receiverName}` : `From: ${tx.senderName}`}</div>
                    <div style={{ fontSize: "11px", color: "#999" }}>{tx.message || "メッセージなし"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: tx.isPayment ? "#D11C1C" : "#28a745" }}>{tx.isPayment ? "-" : "+"}{tx.amount.toLocaleString()}<span style={{ color: "#333", fontSize: "12px", marginLeft: "2px", fontWeight: "normal" }}>円</span></div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BalanceHistory;