import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import AboutUsBody from "./AboutUsBody";

const FixStyle = {
    position: "relative",
    
}


const AboutUsPage = () => {

    return(
        <div style={FixStyle}>
            <Frame/>
            <div style={{marginTop: "6vh"}}>
                <AboutUsBody/>
                
            </div>
            
            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        </div>
    );
}
  
export default AboutUsPage