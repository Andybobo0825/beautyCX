import "./css/SettingPage.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from 'react-hook-form'; // 仍然需要 useForm

const FixStyle = {
    position: "relative"
};

const SettingBody = () => {
    const navigate = useNavigate();

    // --- 用於個人資料更新的表單 ---
    const { 
        register, 
        handleSubmit, 
        setValue, 
        formState: { errors } 
    } = useForm({
        mode: "onBlur" // 在欄位失去焦點時觸發驗證
    });

    // --- 用於密碼修改的表單 ---
    const { 
        register: registerPassword, 
        handleSubmit: handlePasswordSubmit, 
        watch, // 用於即時監聽密碼欄位的值
        setValue: setPasswordValue, 
        formState: { errors: passwordErrors } 
    } = useForm({
        mode: "onBlur" // 在欄位失去焦點時觸發驗證
    });

    // 監聽新密碼欄位的值，用於確認密碼的即時比較
    const newPassword = watch("password", "");


    const fetchClientData = () => {
        const token = localStorage.getItem('accessToken'); 

        if (!token) {
            alert("請先登入以查看您的個人資料。");
            navigate('/LoginPage'); 
            return; 
        }

        const url = `${process.env.REACT_APP_API_URL}/clientPage/client`;

        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        })
        .then((response) => {
            const fetchedData = response.data.results; 
            console.log("成功獲取 API 資料:", fetchedData);
            
            // 使用 setValue 更新個人資料表單的欄位值
            setValue('account', fetchedData.account || '');
            setValue('cName', fetchedData.cName || '');
            setValue('sex', fetchedData.sex || '');
            setValue('birthday', fetchedData.birthday ? fetchedData.birthday.split('T')[0] : '');
            setValue('phone', fetchedData.phone || '');
            setValue('email', fetchedData.email || '');
            
        })
        .catch((error) => {
            console.error("拿API資料失敗", error);

            if (error.response) {
                console.error("錯誤狀態碼:", error.response.status);
                console.error("錯誤訊息:", error.response.data);

                if (error.response.status === 401) {
                    alert("您的登入已過期，請重新登入。");
                    localStorage.removeItem('accessToken');
                    navigate('/LoginPage');
                } else if (error.response.status === 403) {
                    alert("您沒有權限訪問此資源。");
                } else {
                    alert(`API 請求失敗: ${error.response.status} - ${error.response.data.message || '未知錯誤'}`);
                }
            } else if (error.request) {
                console.error("沒有收到回應:", error.request);
                alert("網路錯誤，請檢查您的連線。");
            } else {
                console.error("請求設定錯誤:", error.message);
                alert("請求發生未知錯誤。");
            }
        });
    };

    useEffect(() => {
        fetchClientData();
    }, []);


    // 處理「一鍵修改」表單提交 (由 react-hook-form 的 handleSubmit 包裝)
    const onUpdateClientData = (data) => { // data 會包含所有表單驗證通過的值
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("請先登入以進行修改。");
            navigate('/LoginPage');
            return;
        }

        const url = `${process.env.REACT_APP_API_URL}/clientPage/data/update`;
        const updateData = {
            cName: data.cName,
            sex: data.sex,
            phone: data.phone,
            email: data.email
        };

        axios.post(url, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 200) {
                alert("個人資料修改成功！");
                fetchClientData(); // 重新獲取資料以更新 UI
            } else {
                // 後端返回的錯誤訊息
                alert(`個人資料修改失敗: ${response.data.message || '未知錯誤'}`);
            }
        })
        .catch(error => {
            console.error("更新個人資料失敗:", error);
            if (error.response) {
                if (error.response.status === 401) {
                    alert("您的登入已過期，請重新登入。");
                    localStorage.removeItem('accessToken');
                    navigate('/LoginPage');
                } else if (error.response.data && error.response.data.message) {
                    // 顯示後端傳回的具體錯誤訊息，例如Email已存在
                    alert(`更新個人資料失敗: ${error.response.data.message}`);
                } else {
                    alert(`更新個人資料失敗: ${error.response.status} - 伺服器錯誤`);
                }
            } else {
                alert("網路錯誤或請求失敗，請稍後再試。");
            }
        });
    };

    // 處理「修改密碼」表單提交 (由 react-hook-form 的 handlePasswordSubmit 包裝)
    const onChangePassword = (data) => { // data 會包含驗證通過的 password 和 confirmPassword
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("請先登入以修改密碼。");
            navigate('/LoginPage');
            return;
        }

        const url = `${process.env.REACT_APP_API_URL}/clientPage/password/update`;
        const updatePasswordData = {
            password: data.password // 後端應該會對這個密碼進行加密
        };

        axios.post(url, updatePasswordData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 200) {
                alert("密碼修改成功！下次登入請使用新密碼。");
                setPasswordValue('password', ''); // 清空密碼輸入框
                setPasswordValue('confirmPassword', '');
            } else {
                alert(`密碼修改失敗: ${response.data.message || '未知錯誤'}`);
            }
        })
        .catch(error => {
            console.error("修改密碼失敗:", error);
            if (error.response) {
                if (error.response.status === 401) {
                    alert("您的登入已過期，請重新登入。");
                    localStorage.removeItem('accessToken');
                    navigate('/LoginPage');
                } else if (error.response.data && error.response.data.message) {
                     alert(`修改密碼失敗: ${error.response.data.message}`);
                } else {
                    alert(`修改密碼失敗: ${error.response.status} - 伺服器錯誤`);
                }
            } else {
                alert("網路錯誤或請求失敗，請稍後再試。");
            }
        });
    };


    return (
        <div className="SettingBody">

            <div style={{ display: "flex", gap: "0.5vw" }}>
                <NavLink to="/SettingPage"><button className="SBIASettingButtom">設定</button></NavLink>
                <NavLink to="/ChasingPage"><button className="SBIAFollowButtom">追蹤商品</button></NavLink>
            </div>

            <hr className="Shr-line" />

            {/* 個人資料修改表單 */}
            <form onSubmit={handleSubmit(onUpdateClientData)}>
                <div className="SBInputArea">
                    <div className="SBIArow">
                        <div className="SBIATitle">帳號</div>
                        <div className="SBIAtext">
                            <input 
                                type="text" 
                                placeholder="您的帳號名稱" 
                                readOnly 
                                // account 欄位通常是只讀的，不需要驗證，但仍需註冊以保持表單完整性
                                {...register("account")} 
                            />
                        </div>
                    </div>
            
                    <div className="SBIArow">
                        <div className="SBIATitle">用戶名稱</div>
                        <div className="SBIAtext">
                            <input 
                                type="text" 
                                placeholder="請輸入用戶名稱" 
                                {...register("cName", {
                                    required: "用戶名稱為必填",
                                    minLength: {
                                        value: 1,
                                        message: "用戶名稱至少需要 1 個字元"
                                    },
                                    maxLength: {
                                        value: 30,
                                        message: "用戶名稱不能超過 30 個字元"
                                    }
                                })} 
                            />
                        </div>
                        {errors.cName && <p className="error-message">{errors.cName.message}</p>}
                    </div>
            
                    <div className="SBIArow">
                        <div className="SBIATitle">性別</div>
                        <div className="SBIAtext">
                            <select 
                                {...register("sex", {
                                    required: "性別為必填",
                                    validate: value => 
                                        ['male', 'female', 'other', ''].includes(value) || "請選擇有效的性別"
                                })} 
                            >
                                <option value="" disabled>請選擇性別</option>
                                <option value="male">男</option> 
                                <option value="female">女</option>
                                <option value="other">其他</option>
                            </select>
                        </div>
                        {errors.sex && <p className="error-message">{errors.sex.message}</p>}
                    </div>
            
                    <div className="SBIArow">
                        <div className="SBIATitle">生日</div>
                        <div className="SBIAtext">
                            <input 
                                type="text" 
                                placeholder="您的生日" 
                                readOnly 
                                {...register("birthday")} 
                            />
                        </div>
                    </div>
            
                    <div className="SBIArow">
                        <div className="SBIATitle">電話</div>
                        <div className="SBIAtext">
                            <input 
                                type="text" 
                                placeholder="請輸入電話" 
                                {...register("phone", {
                                    required: "電話號碼為必填",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "電話號碼必須是 10 位數字"
                                    }
                                })} 
                            />
                        </div>
                        {errors.phone && <p className="error-message">{errors.phone.message}</p>}
                    </div>
            
                    <div className="SBIArow">
                        <div className="SBIATitle">電子郵件</div>
                        <div className="SBIAtext">
                            <input 
                                type="text" 
                                placeholder="請輸入電子郵件" 
                                {...register("email", {
                                    required: "電子郵件為必填",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message: "電子郵件格式不正確"
                                    },
                                    minLength: {
                                        value: 8,
                                        message: "電子郵件至少需要 8 個字元"
                                    },
                                    maxLength: {
                                        value: 64,
                                        message: "電子郵件不能超過 64 個字元"
                                    }
                                })} 
                            />
                        </div>
                        {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>
                    <div style={{ display: "flex" }}>
                        <button type="submit" className="SBIAModifyButtom">一鍵修改</button>
                    </div>
                </div>
            </form>
            
            {/* 密碼修改表單 */}
            <form onSubmit={handlePasswordSubmit(onChangePassword)}>
                <div className="SBIArowtwo">
                    <div className="SBIATitletwo">密碼</div>
                    <div className="SBIAtexttwo">
                        <input 
                            type="password" 
                            placeholder="請輸入新密碼" 
                            {...registerPassword("password", {
                                required: "新密碼為必填",
                                minLength: {
                                    value: 8,
                                    message: "密碼長度至少為 8 個字元"
                                },
                                maxLength: {
                                    value: 20,
                                    message: "密碼長度不能超過 20 個字元"
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).{8,20}$/,
                                    message: "密碼需包含大小寫字母、數字及特殊符號"
                                }
                            })} 
                        />
                    </div>
                    {passwordErrors.password && <p className="error-message">{passwordErrors.password.message}</p>}
                </div>
                <div className="SBIArowtwo">
                    <div className="SBIATitletwo">確認密碼</div>
                    <div className="SBIAtexttwo">
                        <input 
                            type="password" 
                            placeholder="請再次輸入新密碼" 
                            {...registerPassword("confirmPassword", {
                                required: "請再次輸入密碼",
                                validate: value => 
                                    value === newPassword || "兩次輸入的密碼不一致" // 驗證與 password 欄位是否一致
                            })} 
                        />
                    </div>
                    {passwordErrors.confirmPassword && <p className="error-message">{passwordErrors.confirmPassword.message}</p>}
                </div>
                <div style={{ display: "flex" }}>
                    <button type="submit" className="SBIAModifyButtomtwo">修改密碼</button>
                </div>
            </form>

        </div>
    );
};

export default SettingBody;