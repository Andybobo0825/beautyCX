import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import LoginBody from "./LoginBody";
import axios from 'axios'
const FixStyle = {
    position: "relative",
    
}


const LoginPage = () => {
    return(
        <div style={FixStyle}>
            <Frame/>
            <div style={{marginTop: "6vh"}}>
                <LoginBody/>
            </div>
            
            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        </div>
    );
}
  

export default LoginPage