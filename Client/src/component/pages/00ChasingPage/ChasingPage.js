import { useEffect, useState } from "react";
import Frame from "../../BasicFrame/frame";
import ChasingBody from "./ChasingBody";
import axios from 'axios'

const FixStyle = {
    position: "relative",
    
}


const ChasingPage = () => {
    return(
        <div style={FixStyle}>
            <Frame/>
            <div style={{marginTop: "6vh"}}>
                <ChasingBody/>
            </div>
            
            <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        </div>
    );
}
  

export default ChasingPage