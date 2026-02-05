// RecipientList.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function RecipientList({ loginUser }) {
  const [friends, setFriends] = useState([]);
  const [sendHistory, setSendHistory] = useState([]);     // ★追加
  const [requests, setRequests] = useState([]);           // ★追加
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = (user) => {
    if (location.state?.mode === "request") {
      navigate("/createrequest", { state: { selectedUser: user } });
    } else {
      navigate("/step4", { state: { selectedUser: user } });
    }
  };

  // ★ 日付文字列を Date に変換（フォーマット揺れに強めにする）
  const toTime = (s) => {
    if (!s) return 0;
    // "2026/2/4 15:51:32" と "2026/02/04 14:00:00" が混在してるので / を - にしてISOっぽく寄せる
    const normalized = String(s).replace(/\//g, "-");
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  useEffect(() => {
    // friends
    fetch("http://localhost:3010/friends")
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error("friends取得エラー:", err));

    // send1（送金履歴）
    fetch("http://localhost:3010/send1")
      .then((res) => res.json())
      .then((data) => setSendHistory(data))
      .catch((err) => console.error("send1取得エラー:", err));

    // requests（請求履歴）
    fetch("http://localhost:3010/requests")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("requests取得エラー:", err));
  }, []);

  // ★ 検索時：一致するユーザーだけ表示（今まで通り）
  const searchedFriends = useMemo(() => {
    const q = search.trim();
    if (!q) return [];

    return friends
      .filter((f) => f.id !== loginUser?.id)
      .filter((f) => {
        return (
          f.id.includes(q) ||
          f.accountNumber?.includes(q) ||
          f.name?.includes(q)
        );
      });
  }, [friends, loginUser?.id, search]);

  // ★ デフォルト表示：最近やり取りした相手を新しい順に
  const recentFriends = useMemo(() => {
    if (!loginUser?.id) return [];

    // 1) 履歴から「相手ID」と「日時」を抽出して1本の配列にする
    const interactions = [];

    // 送金履歴: 自分が関わってるものだけ拾う
    sendHistory.forEach((t) => {
      const isMine = t.senderId === loginUser.id || t.receiverId === loginUser.id;
      if (!isMine) return;

      const otherId = t.senderId === loginUser.id ? t.receiverId : t.senderId;
      interactions.push({ otherId, time: toTime(t.date) });
    });

    // 請求履歴: 自分が請求した or 請求された
    requests.forEach((r) => {
      const isMine = r.requesterId === loginUser.id || r.receiverId === loginUser.id;
      if (!isMine) return;

      const otherId = r.requesterId === loginUser.id ? r.receiverId : r.requesterId;
      // 支払い済みなら paidAt、未払いなら createdAt を基準にすると自然
      const time = r.status === "paid" ? toTime(r.paidAt) : toTime(r.createdAt);
      interactions.push({ otherId, time });
    });

    // 2) 新しい順に並べる
    interactions.sort((a, b) => b.time - a.time);

    // 3) 同じ相手は最新の1件だけ残す（重複排除）
    const seen = new Set();
    const uniqueOtherIds = [];
    for (const it of interactions) {
      if (!it.otherId) continue;
      if (it.otherId === loginUser.id) continue;
      if (seen.has(it.otherId)) continue;
      seen.add(it.otherId);
      uniqueOtherIds.push(it.otherId);
    }

    // 4) friends から相手情報を引いて返す
    const friendMap = new Map(friends.map((f) => [f.id, f]));
    return uniqueOtherIds
      .map((id) => friendMap.get(id))
      .filter(Boolean);
  }, [friends, loginUser?.id, requests, sendHistory]);

  // ★ 画面に出すリスト（検索してなければ recentFriends、検索中は searchedFriends）
  const listToShow = search.trim() ? searchedFriends : recentFriends;

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 15px",
          borderBottom: "1px solid #ddd",
          position: "relative",
          height: "50px",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          ＜ 戻る
        </button>

        <h2
          style={{
            fontSize: "18px",
            margin: 0,
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          宛先を選択
        </h2>
      </div>

      {/* 検索欄 */}
      <div style={{ padding: "15px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ユーザーID / 口座番号 / 氏名で検索"
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          {search.trim()
            ? "一致するユーザーを表示中"
            : "最近やり取りした相手（新しい順）を表示します"}
        </div>
      </div>

      {/* リスト */}
      <div>
        {listToShow.length === 0 ? (
          <div style={{ padding: "0 15px", color: "#888" }}>
            {search.trim()
              ? "該当するユーザーが見つかりません"
              : "最近のやり取りがまだありません。検索して宛先を探してください"}
          </div>
        ) : (
          listToShow
            .filter((f) => f.id !== loginUser?.id)
            .map((friend) => (
              <div
                key={friend.id}
                onClick={() => handleSelect(friend)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
              >
                <img
                  src={friend.icon}
                  alt={friend.name}
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    marginRight: "15px",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {friend.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    ID: {friend.id} / 口座: {friend.accountNumber}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default RecipientList;
