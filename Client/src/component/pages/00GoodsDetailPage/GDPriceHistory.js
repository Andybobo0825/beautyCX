import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./css/GDHistoryCompare.css";
import { DrawPriceChart } from "./GDLineChart";
import { MaskContext } from "../../../ContextAPI";

const GDHistoryCompare = ({ pId, productName, brand, isOpen, onClose }) => {
  const [history, setHistory] = useState([]); // 原始資料
  const [filteredHistory, setFilteredHistory] = useState([]); // 篩選後資料
  const [loading, setLoading] = useState(false);
  const [rangeType, setRangeType] = useState("days"); // 篩選方式: days / custom
  const [days, setDays] = useState(0); // 預設全部
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { setMask } = useContext(MaskContext);

  // 1. 取得歷史資料
  useEffect(() => {
    if (!isOpen || !pId) return;
    setMask(true);
    setLoading(true); // 顯示 loading (選擇性)

    // 注意：這裡是 /gooddetail/priceHistory
    axios
      .get(`${process.env.REACT_APP_API_URL}/gooddetail/priceHistory/${pId}`)
      .then((res) => {
        const data = res.data.results || [];
        setHistory(data);
        setFilteredHistory(data);

        // 畫圖
        if (data.length > 0) {
          DrawPriceChart("GDPriceChart", data);
        }
      })
      .catch((err) => {
        console.error("取得價格歷史失敗", err);
        setHistory([]);
      })
      .finally(() => {
        setMask(false);
        setLoading(false);
      });
  }, [isOpen, pId, setMask]); // 加入依賴

  // 2. 計算最低價
  const lowest = filteredHistory.length
    ? filteredHistory.reduce((min, item) =>
      item.prePrice < min.prePrice ? item : min
    )
    : null;

  // 3. 篩選邏輯
  useEffect(() => {
    if (!history.length) return;

    let filtered = [...history];

    if (rangeType === "days") {
      if (days !== 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = history.filter(
          (item) => new Date(item.updateTime) >= cutoff
        );
      }
    } else if (rangeType === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // 加強日期比較邏輯 (如果不含時間，需注意邊界)
      filtered = history.filter((item) => {
        const t = new Date(item.updateTime);
        return t >= start && t <= end;
      });
    }

    setFilteredHistory(filtered);

    // 重新畫圖
    if (filtered.length > 0) {
      DrawPriceChart("GDPriceChart", filtered);
    }
  }, [rangeType, days, startDate, endDate, history]);

  if (!isOpen) return null;

  return (
    <div className="GDHCOverlay">
      <div className="GDHCContent">
        {/* 標題與關閉按鈕 */}
        <div className="GDHCTitle">
          <p className="GDHCBrand">{brand || pId}</p>
          <p className="GDHCName">{productName || pId}</p>
          <button className="GDHCClose-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* 主體內容 */}
        <div className="GDHCBody">
          {/* 左側：折線圖 */}
          <div className="GDHCChart">
            <canvas id="GDPriceChart"></canvas>
          </div>

          {/* 右側：價格歷史表格 */}
          <div className="GDHCTable">
            <div className="GDHCTableScroll">
              {loading ? (
                <p>載入中...</p>
              ) : filteredHistory.length > 0 ? (
                <table className="GDHCTableName">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>日期</th>
                      <th style={{ width: '30%' }}>價格</th>
                      <th style={{ width: '30%' }}>通路</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, index) => (
                      <tr key={index}>
                        <td>{item.updateTime}</td>
                        <td className="GDHCTablePrice">${item.prePrice}</td>
                        <td>{item.storeName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>無資料</p>
              )}
            </div>

            {/* 最低價區塊 */}
            <p className="GDHCNameLowest">最低價</p>
            {lowest ? (
              <table className="GDHCTableName">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>日期</th>
                    <th style={{ width: '30%' }}>價格</th>
                    <th style={{ width: '30%' }}>通路</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{lowest.updateTime}</td>
                    <td className="GDHCTablePrice">${lowest.prePrice}</td>
                    <td>{lowest.storeName}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>無資料</p>
            )}
          </div>
        </div>

        {/* 篩選區塊 */}
        <div className="GDHCFilter">
          <label>
            <input
              type="radio"
              name="range"
              checked={rangeType === "days"}
              onChange={() => setRangeType("days")}
            />{" "}
            選取範圍
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}>
            <option value={0}>全部</option>
            <option value={60}>近60天</option>
            <option value={90}>近90天</option>
          </select>

          <label>
            <input
              type="radio"
              name="range"
              checked={rangeType === "custom"}
              onChange={() => setRangeType("custom")}
            />{" "}
            日期區間
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={rangeType !== "custom"}
          />
          {" - "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={rangeType !== "custom"}
          />
        </div>
      </div>
    </div>
  );
};

export default GDHistoryCompare;