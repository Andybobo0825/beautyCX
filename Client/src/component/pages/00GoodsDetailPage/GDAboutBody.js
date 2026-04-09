import "./css/GDABody.css";
import { useEffect, useState } from "react";
import { ImStarFull } from "react-icons/im";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import Slider from "react-slick";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import GDHistoryCompare from "./GDPriceHistory";
import { getProductPic, getProductAllPic } from "../../util/util";
import { useMemo, useContext } from "react";
import { useRef } from "react";

import { MaskContext } from "../../../ContextAPI";

const GDAboutBody = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pId = queryParams.get("pId");
  const didSendClick = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [productData, setProductData] = useState({});
  const [isTracking, setIsTracking] = useState(false);
  const { setMask } = useContext(MaskContext);

  /**發送點擊次數更新請求*/
  const sendClickUpdate = (pId) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/gooddetail/click/${pId}`)
      .then((response) => {
        console.log("點擊數更新成功", response.data);
      })
  }

  /**取得商品資訊 */
  const getProductData = async (pId) => {
    setMask(true);

    const token = localStorage.getItem("accessToken");

    // 只有在 pId 存在且 Token 存在時才發送請求
    if (!pId) {
      return;
    }
    if (!token) {
      setIsTracking(false); // 確保未登入時按鈕顯示為「加入關注」
      return;
    }
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/gooddetail/product/${pId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (response.status === 200) {
      const imgs = await getProductAllPic(pId);
      const formatted = {
        ...response.data.results,
        images: imgs
      }
      formatted.isTrack === true ? setIsTracking(true) : setIsTracking(false);
      setProductData(formatted);
    }
    setMask(false);
  }

  //設置商品圖
  const settings = useMemo(() => ({
    customPaging: function (i) {
      if (!productData.images?.[i]) return null;
      return (
        <a>
          <img
            src={productData.images[i]}
            alt={`縮圖${i + 1}`}
            style={{ width: 40, height: 40, objectFit: "cover" }}
          />
        </a>
      );
    },
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }), [productData.images]);

  // Effect 1: 載入商品詳細資訊 (不變)
  useEffect(() => {
    if (didSendClick.current) return; // 開發模式下第二次呼叫直接略過
    didSendClick.current = true;
  
    sendClickUpdate(pId);
    getProductData(pId);
  }, [pId]);

  // 處理「加入關注」/「取消關注」按鈕點擊 (新增判斷是否登入)
  const handleToggleTrack = () => {
    const token = localStorage.getItem("accessToken");

    // 如果沒有 Token (未登入)，則提示用戶登入
    if (!token) {
      alert("請先登入以使用此功能。");
      return;
    }

    // 如果已登入且 pId 存在，則正常發送請求
    if (!pId) {
      console.warn("缺少 pId，無法切換追蹤狀態。");
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/gooddetail/track`,
        { pId: pId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.status === 200) {
          setIsTracking(response.data.status === 1);
          alert(response.data.message);
        }
      })
      .catch((error) => {
        console.error("切換追蹤狀態失敗:", error);
        if (error.response.status === 401) {
          alert("您的登入已過期，請重新登入。");
        }
      });
  };


  return (
    <div className="GDAbout">
      <div className="slider-container" style={{ width: "30%", marginRight: "10%" }}>
        {productData.images?.length > 0 && (
          <Slider key={productData.images.length} {...settings}>
            {productData.images.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
                  alt={`圖片${index}`}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </Slider>
        )}
      </div>
      <div className="GDAText" key={productData.pName || "loading"}>
        <div className="GDAContext">
          <div className="GDABrand">{productData.brand}</div>
          <div className="GDAName">{productData.pName}</div>
          <br />
          <br />
          <div className="GDAPrice">
            <span className="GDAOriginalPrice">${productData.price_max}</span>
            <span className="GDADiscount">${productData.price_min}</span>
          </div>
          <br />
          <span className="GDARate">
            <ImStarFull size={20} color="gold" />
            <span className="GDAScore">&nbsp;{productData.review}</span>
          </span>
          <br />
          <br />
          <br />
          <br />
        </div>
        <div className="GDAButton">
          <button className="GDAAddLike" onClick={handleToggleTrack}>
            {isTracking === true ? "取消關注" : "加入關注"}
          </button>
          <button
            className="GDAAddLike"
            onClick={() => setShowModal(true)}>
            查看價格走勢
          </button>
          {/* 彈出視窗 */}
          <GDHistoryCompare
            pId={pId}
            brand={productData.brand}
            productName={productData.pName}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default GDAboutBody;
