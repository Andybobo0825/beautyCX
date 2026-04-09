import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import ExampleBody from "./ExampleBody";
// ↑↑這邊上面import的Body文件名記得改

const FixStyle = {
    position: "relative",
    
}


const ExamplePage = () => {
    // ↑↑這邊上面變數名記得改成跟文件名一樣
    return(
        <div style={FixStyle}>
            <Frame/>
            <div style={{marginTop: "6vh"}}>
                <ExampleBody/>
                {/* ↑↑這邊上面使用的組件變數名記得改 */}
            </div>
            
            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        </div>
    );
}
  
// ↓↓這邊下面變數名記得改成跟文件名一樣
export default ExamplePage