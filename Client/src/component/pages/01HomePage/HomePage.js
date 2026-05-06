import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import HomeBody from "./HomeBody";
import BannerCarousel from "./BannerCarousel";
import HotProducts from "./HotProducts";
import "./css/HomePage.css";

// ↑↑這邊上面import的Body文件名記得改

const FixStyle = {
  position: "relative",
};

const HomePage = () => {
  // ↑↑這邊上面變數名記得改成跟文件名一樣
  return (
    <div style={FixStyle}>
      <div className="HomePage">
        <Frame />
        <BannerCarousel />

        <HotProducts />
        <div style={{ marginTop: "6vh" }}>
          <HomeBody />
          {/* ↑↑這邊上面使用的組件變數名記得改 */}
        </div>
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
