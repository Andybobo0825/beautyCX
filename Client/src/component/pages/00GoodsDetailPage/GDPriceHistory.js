import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./css/GDHistoryCompare.css";
import { DrawPriceChart } from "./GDLineChart";
import { MaskContext } from "../../../ContextAPI";

const GDHistoryCompare = ({ pId, productName, brand, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [rangeType, setRangeType] = useState("days"); 
  const [days, setDays] = useState(0); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { setMask } = useContext(MaskContext);

  // 1. 取得歷史資料 (修正處：加上了閉合括號)
  useEffect(() => {
    if (!isOpen || !pId) return;
    setMask(true);
    
    axios
      .get(`${process.env.REACT_APP_API_URL}/gooddetail/priceHistory/${pId}`)
      .then((res) => {
        const data = res.data?.results || [];
        setHistory(data);
        setFilteredHistory(data);
        if (data.length > 0) {
          DrawPriceChart("GDPriceChart", data);
        }
      })
      .catch((err) => {
        console.error("取得價格歷史失敗", err);
      })
      .finally(() => setMask(false));
  }, [isOpen, pId]); // <--- 之前這裡漏掉了閉合括號與相依陣列

  // 2. 計算最低價 (放置於組件頂層，JSX 才能抓到)
  const lowest = filteredHistory.length
    ? filteredHistory.reduce((min, item) => item.prePrice < min.prePrice ? item : min)
    : null;

  // 3. 篩選邏輯
  useEffect(() => {
    if (!history.length) return;
    let filtered = [...history];
    if (rangeType === "days") {
      if (days !== 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = history.filter((item) => new Date(item.updateTime) >= cutoff);
      }
    } else if (rangeType === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = history.filter((item) => {
        const t = new Date(item.updateTime);
        return t >= start && t <= end;
      });
    }
    setFilteredHistory(filtered);
    if (filtered.length > 0) { DrawPriceChart("GDPriceChart", filtered); }
  }, [rangeType, days, startDate, endDate, history]);

  if (!isOpen) return null;

  return (
    <div className="GDHCOverlay">
      <div className="GDHCContent">
        <div className="GDHCTitle">
          <p className="GDHCBrand">{brand || pId}</p>
          <p className="GDHCName">{productName || pId}</p>
          <button className="GDHCClose-btn" onClick={onClose}>✖</button>
        </div>

        <div className="GDHCBody">
          <div className="GDHCChart">
            <canvas id="GDPriceChart"></canvas>
          </div>

          <div className="GDHCTable">
            {/* 滾動容器：第一個表格 */}
            <div className="GDHCTableScroll">
              <table className="GDHCTableName">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>日期</th>
                    <th style={{ width: '30%' }}>價格</th>
                    <th style={{ width: '30%' }}>通路</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, i) => (
                    <tr key={i}>
                      <td>{item.updateTime}</td>
                      <td>${item.prePrice}</td>
                      <td>{item.storeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                    <td className="GDHCHighlight">${lowest.prePrice}</td>
                    <td>{lowest.storeName}</td>
                  </tr>
                </tbody>
              </table>
            ) : <p>無資料</p>}
          </div>
        </div>

        <div className="GDHCFilter">
          <label><input type="radio" checked={rangeType === "days"} onChange={() => setRangeType("days")} /> 選取範圍</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={0}>全部</option>
            <option value={60}>近60天</option>
            <option value={90}>近90天</option>
            <option value={180}>近180天</option>
          </select>
          <label><input type="radio" checked={rangeType === "custom"} onChange={() => setRangeType("custom")} /> 日期區間</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={rangeType !== "custom"} />
          {" - "}
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={rangeType !== "custom"} />
        </div>
      </div>
    </div>
  );
};

export default GDHistoryCompare;