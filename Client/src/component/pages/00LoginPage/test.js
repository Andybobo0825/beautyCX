import "./css/test.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { LoginContext, MaskContext } from "../../../ContextAPI";
import SidePic from "./pic/pic.jpg"; // 引入您的圖片

const TestLogin = () => {
    const { setLogin } = useContext(LoginContext);
    const { setMask } = useContext(MaskContext);
    const navigate = useNavigate();

    const { register, handleSubmit, setError, formState: { errors } } = useForm({
        mode: "onSubmit"
    });

    const onSubmit = (data) => {
        const url = `${process.env.REACT_APP_API_URL}/loginpage/login`;
        setMask(true);
        axios.post(url, {
            account: data.account,
            password: data.password
        })
        .then(response => {
            if (response.status === 200) {
                setMask(false);
                setLogin(1);
                localStorage.setItem('accessToken', response.data.token);
                navigate('/');
            }
        })
        .catch(error => {
            setMask(false);
            setError("password", { type: "custom", message: "帳號或密碼錯誤" });
        });
    };

    return (
        <div className="TestLogin-wrapper">
            <div className="TestLogin-card">
                {/* 左側圖片區 */}
                <div className="TestLogin-image-side">
                    <img src={SidePic} alt="login-visual" />
                </div>

                {/* 右側表單區 */}
                <div className="TestLogin-form-side">
                    <h2 className="TestLogin-title">Welcome Back</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="TestLogin-form-group">
                            <label className="TestLogin-label">ACCOUNT</label>
                            <input 
                                type="text" 
                                className="TestLogin-input"
                                placeholder="帳號" 
                                {...register("account", { required: "請輸入帳號" })} 
                            />
                            {errors.account && <p className="TestLogin-error">{errors.account.message}</p>}
                        </div>

                        <div className="TestLogin-form-group">
                            <label className="TestLogin-label">PASSWORD</label>
                            <input 
                                type="password" 
                                className="TestLogin-input"
                                placeholder="密碼" 
                                {...register("password", { required: "請輸入密碼" })} 
                            />
                            {errors.password && <p className="TestLogin-error">{errors.password.message}</p>}
                        </div>

                        <div className="TestLogin-actions">
                            <button className="TestLogin-btn-submit" type="submit">登入</button>
                            <NavLink to="/RegisterPage" className="TestLogin-btn-link">
                                還不是會員？註冊帳號
                            </NavLink>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TestLogin; 