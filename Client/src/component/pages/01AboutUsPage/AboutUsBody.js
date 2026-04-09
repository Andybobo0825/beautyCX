import "./css/AboutUsPage.css"
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "./pic/logo.png"

const FixStyle = {
    position: "relative"
}

const AboutUsBody = () => {


    return(
        <div className="AboutUsBody"> 
            <div className="AUBTitle">平台簡介</div>
            <div className="AUBLine"></div>
            <div className="AUBBox">
                <div className="AUBLogo"><img src={logo} alt="" /></div>
                <div className="AUBContent">
                    在琳瑯滿目的美妝世界裡，找到最適合自己的產品與價格從未如此簡單。我們的美妝比價平台，致力於為消費者提供即時、透明的價格資訊，集結多家電商與品牌的商品，讓你輕鬆比較、聰明購物。不論是熱門彩妝、保養聖品，還是限定聯名款，通通一網打盡。從此，不再為找優惠而煩惱，讓你用最聰明的方式，打造屬於自己的美麗風格。<br/>
                </div>
            </div>

            

        </div>
    );
}
  

export default AboutUsBody