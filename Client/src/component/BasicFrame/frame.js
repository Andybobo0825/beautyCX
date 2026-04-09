import "./css/frame.css"
import BottomBar from "./BottomBar";
import TopBarText from "./TopBar_text";
import { useEffect } from "react";


const Frame = () =>{

    return(

        <div>
            <TopBarText/>
            
            <BottomBar/>
        </div>

    );
}


export default Frame