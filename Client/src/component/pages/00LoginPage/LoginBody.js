import "./css/LoginPage.css"
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext } from "../../../ContextAPI";
import { useForm } from 'react-hook-form';
import Button from 'react-bootstrap/Button';

const FixStyle = {
    position: "relative"
}









const LoginBody = () => {
    const { login, setLogin } = useContext(LoginContext);

    const navigate = useNavigate();

    const { register, handleSubmit, setError, formState: { errors } } = useForm({
        mode:"onSubmit",
        reValidateMode:"onBlur",

    });


    const onSubmit = (data) => { 
        console.log(data);
        const url = `${process.env.REACT_APP_API_URL}/loginpage/login`;
        const info = {
            account : data.LBinputAccount,
            password: data.LBinputPassword
        }
        console.log("url:", url)
        console.log("info:", info)
        axios.post(url, info)
        .then(
            response=>{
                console.log("Status Code:", response.status);            
                // console.log(response)
                if(response.status === 200){
                    alert('會員登入');
                    setLogin(1);
                    const { token, refresh_token } = response.data; // 從回應中解構出 token 和 refresh_token
                    
                    localStorage.setItem('accessToken', token); // 儲存訪問 Token
                    localStorage.setItem('refreshToken', refresh_token); // 儲存刷新 Token (如果需要)
                    
                    navigate('/')
                    
                }
                // else if(response.status === 401){

                // }
                else if(response.status === 401){
                    setError("LBinputPassword",{type:"custom", message:"帳號或密碼錯誤"})
                    // alert("登入失敗");
                }
            }
        ).catch(
            error =>{
                console.log(error);
                console.log("Status Code:", error.response.status);    
                console.log(error.response.data.message);
                if (error.response && error.response.status === 401){
                    setError("LBinputAccount",{type:"custom", message:"帳號或密碼錯誤"})
                    setError("LBinputPassword",{type:"custom", message:"帳號或密碼錯誤"})
                    // alert('登入失敗，帳號或密碼錯誤');
                }
                else
                {
                    throw error;
                }
                 
            }
        )
    }

    return(

        <div className="LoginBody">
            <div className="LBTitle">登入</div>
            <form name="login" onSubmit={handleSubmit(onSubmit)}>
                <div className="LBInputArea">
                    <div className="LBIArow">
                        <div className="LBIATitle">帳號</div>
                        <div className="LBIAtext">
                            <input type="text" placeholder="請輸入帳號名稱" id="LBinputAccount" 
                            {...register("LBinputAccount", {required: true, minLength: {value: 8, message: "帳號至少會有8位字元"}, maxLength: {value: 20, message: "帳號不會超過20位字元"}})} />
                            {!!errors.LBinputAccount && <p>{errors.LBinputAccount.message.toString() || "請輸入帳號"}</p> }
                        </div>
                    </div>
                    <div className="LBIArow">
                        <div className="LBIATitle">密碼</div>
                        <div className="LBIAtext">
                            <input type="text" placeholder="請輸入密碼" id="LBinputPassword"
    {...register("LBinputPassword", {
        required: true, 
        // minLength: {value: 8, message: "密碼至少會有8位字元"}, // 暫時註解掉密碼最小長度限制
        // maxLength: {value: 20, message: "密碼不會超過20位字元"}  // 暫時註解掉密碼最大長度限制
    })} />
{!!errors.LBinputPassword && <p>{errors.LBinputPassword.message.toString() || "請輸入密碼"}</p> }
                        </div>
                    </div>
                    <div style={{display:"flex"}}>
                        <NavLink to="/RegisterPage"><button className="LBIAConfirmButtom LBIAforColorRegisterButtom" variant="light" style={{backgroundColor:"#FFDAD0"}}>註冊帳號</button></NavLink>
                        <button className="LBIAConfirmButtom LBIAforColorConfirmButtom"  type="submit" style={{backgroundColor:"#ED8A8A"}}>確認</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
  

export default LoginBody