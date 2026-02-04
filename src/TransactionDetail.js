import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const TransactionDetail = ({ loginUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { kind, id } = useParams(); // kind: "transfer" | "request"

  const [item, setItem] = useState(location.state?.item ?? null);
  const [friendsMap, setFriendsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // friends辞書
  useEffect(() => {
    fetch("http://localhost:3010/friends")
      .then((res) => res.json())
      .then((friendsData) => {
        const map = {};
        friendsData.forEach((u) => (map[u.id] = u));
        setFriendsMap(map);
      })
      .catch(() => {});
  }, []);

  // リロードでも表示できるように、itemが無ければDBから1件取得
  useEffect(() => {
    if (!loginUser) return;

    const fetchOne = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        if (item) {
          setLoading(false);
          return;
        }

        let url = "";
        if (kind === "transfer") url = `http://localhost:3010/send1/${id}`;
        else url = `http://localhost:3010/requests/${id}`;

        const res = await fetch(url);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setItem(data);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUser, kind, id]);

  const detail = useMemo(() => {
    if (!item || !loginUser) return null;

    const isTransfer =
      kind === "transfer" ||
      (item.senderId === loginUser.id &&
        (item.type === "transfer" || item.type === "request_payment"));

    const dateText = new Date(item.createdAt || item.date).toLocaleString();

    let partnerTitle = "";
    let partnerUser = null;

    if (isTransfer) {
      partnerTitle = "送金先";
      partnerUser = friendsMap[item.receiverId];
    } else {
      if (item.status === "paid") {
        partnerTitle = "支払った人";
        partnerUser = friendsMap[item.payerId];
      } else {
        partnerTitle = "請求先";
        partnerUser = friendsMap[item.receiverId];
      }
    }

    const partnerName =
      partnerUser?.name ||
      item.receiverName ||
      "不明";

    const partnerIcon =
      partnerUser?.icon ||
      item.receiverIcon ||
      "/images/human1.png";

    const statusLabel = isTransfer
      ? "送金完了"
      : item.status === "paid"
      ? "受取済"
      : "請求中(未払)";

    const amountPrefix = isTransfer ? "-" : "";
    const amountText = `${amountPrefix}¥${Number(item.amount || 0).toLocaleString()}`;

    const messageText = (item.message ?? "").trim();

    return {
      isTransfer,
      dateText,
      partnerTitle,
      partnerName,
      partnerIcon,
      statusLabel,
      amountText,
      messageText,
      txId: item.id,
    };
  }, [item, loginUser, friendsMap, kind]);

  if (!loginUser) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <p>ログイン情報がありません。</p>
        <button onClick={() => navigate("/")}>ログインへ</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <p>取引が見つかりませんでした。</p>
        <button onClick={() => navigate(-1)}>戻る</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "center", padding: "15px", borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
        >
          ＜ 戻る
        </button>
        <h2 style={{ fontSize: "16px", margin: "0 auto", fontWeight: "bold" }}>取引詳細</h2>
      </div>

      <div style={{ padding: "18px" }}>
        {/* 相手 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
          <img
            src={detail.partnerIcon}
            alt=""
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#888" }}>{detail.partnerTitle}</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#222" }}>{detail.partnerName}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#888" }}>ステータス</div>
            <div style={{ fontWeight: "bold" }}>{detail.statusLabel}</div>
          </div>
        </div>

        {/* 金額 */}
        <div style={{ padding: "18px 0", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 12, color: "#888" }}>金額</div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: detail.isTransfer ? "#D11C1C" : "#111" }}>
            {detail.amountText}
          </div>
        </div>

        {/* コメント */}
        <div style={{ padding: "18px 0", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 12, color: "#888" }}>コメント / メッセージ</div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#333", whiteSpace: "pre-wrap" }}>
            {detail.messageText ? detail.messageText : "（なし）"}
          </div>
        </div>

        {/* 日時 */}
        <div style={{ padding: "18px 0", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 12, color: "#888" }}>日時</div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#333" }}>{detail.dateText}</div>
        </div>

        {/* ID */}
        <div style={{ padding: "18px 0" }}>
          <div style={{ fontSize: 12, color: "#888" }}>取引ID</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#333" }}>
            {kind}:{detail.txId}
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/transactionhistory")}
            style={{
              flex: 1,
              padding: "14px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            履歴一覧へ
          </button>
          <button
            onClick={() => navigate("/home")}
            style={{
              flex: 1,
              padding: "14px 12px",
              border: "none",
              borderRadius: 8,
              background: "#333",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ホームへ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
