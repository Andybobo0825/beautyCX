import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import SettingBody from "./SettingBody";
import axios from 'axios'

const FixStyle = {
    position: "relative",
    
}


const SettingPage = () => {
    return(
        <div style={FixStyle}>
            <Frame/>
            <div style={{marginTop: "6vh"}}>
                <SettingBody/>
            </div>
            
            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        </div>
    );
}
  

export default SettingPage