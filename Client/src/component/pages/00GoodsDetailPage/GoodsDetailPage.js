import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import GDAboutBody from "./GDAboutBody";
import GDCompareBody from "./GDCompareBody";
import GDCommentBody from "./GDCommentBody";

const FixStyle = {
    position: "relative",

}


const GoodsDetailPage = () => {
    return (
        <div style={FixStyle}>
            <Frame />
            <div style={{ marginTop: "6vh" }}>
                <GDAboutBody />
            </div>
            <div style={{ marginTop: "6vh" }}>
                {<GDCompareBody />}
            </div>
            <div style={{ marginTop: "6vh" }}>
                {<GDCommentBody />}
            </div>

            <br /><br /><br /><br /><br /><br /><br /><br />
            <br /><br /><br />
        </div>
    );
}



export default GoodsDetailPage