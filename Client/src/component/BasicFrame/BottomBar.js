import "./css/frame.css"
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './pic/logo.png'
import { NavLink } from "react-router-dom";
import Cookies from 'js-cookie';

const ScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight - 1, behavior: "smooth" });

    return null;
};

const BottomBar = () =>{
    return(
        <>
            <div className="BottomBarAreaCss">
                <Container className="BottomText">
                    <Row style={{width:"100%"}}>
                        <Col style={{flex:"4"}}>
                            <NavLink to="/" style={{display:"flex",justifyContent:"center"}}><img src={logo} alt="logo" className="BottomLogo"/></NavLink>
                            <div className="BText_content" style={{textAlign:"center"}}>精選美妝優雅入手，價格與美麗不將就</div>
                        </Col>
                        <Col style={{marginTop:"0.2vw", padding:"0 0 0 4vw", flex:"3"}}>
                            <div className="BText_content"><NavLink to="/AboutUsPage">關於我們</NavLink> |  <button onClick={ScrollToBottom}>聯絡我們</button> </div>
                            <div className="BText_Title" style={{marginTop:"2vw"}}>客服專線</div>
                            <div className="BText_content" style={{paddingLeft:"0.4vw"}}> (02) 2222- 2222</div>
                        </Col>
                        <Col style={{marginTop:"0.2vw", flex:"3"}}>
                            <div className="BText_Title" style={{marginBottom:"1vw"}}>社群</div>
                            <div className="BText_content"><NavLink to="/LoginPage">IG</NavLink></div>
                            <div className="BText_content"><NavLink to="/LoginPage">FB</NavLink></div>
                            <div className="BText_content"><NavLink to="/LoginPage">LINE</NavLink></div>
                        </Col>
                    </Row>
                </Container>    
                
            </div>
        </>
    );
}
// 468 70
export default BottomBar