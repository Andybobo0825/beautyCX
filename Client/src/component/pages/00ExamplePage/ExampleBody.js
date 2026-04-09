import "./css/ExamplePage.css"
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

// ↓↓使用時需要新增的部分
import { useContext } from 'react';
import { PidProvider } from "../../../ContextAPI";

const FixStyle = {
    position: "relative"
}

const ExampleBody = () => {

    const ButtonFunc_setPid = () =>{
        setPid("p12345")
    }

    // ↓↓使用時需要新增的部分，取用pid: pid，變更pid: setPid
    const { pid, setPid } = useContext(LoginContext);

    return(
        <div className="ExampleBody"> 
            
            <div className="EBYourCodeHere"> 

                <button onClick={ButtonFunc_setPid}>某個商品</button>
            </div>

        </div>
    );
}
  

export default ExampleBody