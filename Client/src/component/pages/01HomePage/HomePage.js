import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import BannerCarousel from "./BannerCarousel";
import HotProducts from "./HotProducts";
import "./css/HomePage.css";
import ADWindow from "./ADWindow";

// ↑↑這邊上面import的Body文件名記得改

const FixStyle = {
  position: "relative",
};

const HomePage = () => {
  // 1. 設定 State：預設為 true (開啟)
  const [isAdOpen, setIsAdOpen] = useState(true);

  return (
    <div style={FixStyle}>
      <div className="HomePage">
        
        {/* 2. 將控制權傳給 ADWindow */}
        {/* isOpen={isAdOpen} : 告訴視窗現在要顯示 */}
        {/* onClose={() => setIsAdOpen(false)} : 告訴視窗點擊關閉時要把 state 設為 false */}
        <ADWindow isOpen={isAdOpen} onClose={() => setIsAdOpen(false)} />

        <Frame />
        <BannerCarousel />

        <HotProducts />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        
      </div>
    </div>
  );
};

// ↓↓這邊下面變數名記得改成跟文件名一樣
export default HomePage;