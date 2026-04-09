import styles from "./css/SettingPage.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { MaskContext } from "../../../ContextAPI";

const SettingBody = () => {
    const navigate = useNavigate();
    const { setMask } = useContext(MaskContext);

    // React Hook Form 設定
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({ mode: "onBlur" });
    const { 
        register: registerPassword, 
        handleSubmit: handlePasswordSubmit, 
        watch, 
        setValue: setPasswordValue, 
        formState: { errors: passwordErrors } 
    } = useForm({ mode: "onBlur" });
    
    const newPassword = watch("password", "");

    // 取得資料邏輯
    const fetchClientData = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { navigate('/LoginPage'); return; }

        setMask(true);
        axios.get(`${process.env.REACT_APP_API_URL}/clientPage/client`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then((response) => {
                const fetchedData = response.data.results;
                setValue('account', fetchedData.account || '');
                setValue('cName', fetchedData.cName || '');
                setValue('sex', fetchedData.sex || '');
                setValue('birthday', fetchedData.birthday ? fetchedData.birthday.split('T')[0] : '');
                setValue('phone', fetchedData.phone || '');
                setValue('email', fetchedData.email || '');
            })
            .catch((error) => {
                if (error.response?.status === 401) { 
                    localStorage.removeItem('accessToken'); 
                    navigate('/LoginPage'); 
                }
            })
            .finally(() => setMask(false));
    };

    useEffect(() => { fetchClientData(); }, []);

    // 修改資料送出
    const onUpdateClientData = (data) => {
        const token = localStorage.getItem('accessToken');
        setMask(true);
        axios.post(`${process.env.REACT_APP_API_URL}/clientPage/data/update`, data, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(() => { alert("個人資料修改成功！"); fetchClientData(); })
            .catch(error => alert(`更新失敗：\n${error.response?.data?.message || '伺服器錯誤'}`))
            .finally(() => setMask(false));
    };

    // 修改密碼送出
    const onChangePassword = (data) => {
        const token = localStorage.getItem('accessToken');
        setMask(true);
        axios.post(`${process.env.REACT_APP_API_URL}/clientPage/password/update`, { password: data.password }, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(() => { 
                alert("密碼修改成功！"); 
                setPasswordValue('password', ''); 
                setPasswordValue('confirmPassword', ''); 
            })
            .catch(error => alert(`修改失敗：\n${error.response?.data?.message || '伺服器錯誤'}`))
            .finally(() => setMask(false));
    };

    return (
        <div className={styles.SettingBody}>
            {/* 導覽區域：使用 styles 物件套用 Class */}
            <div className={styles.SettingNav}>
                <NavLink to="/SettingPage">
                    <button className={styles.SBIASettingButtom}>個人設定</button>
                </NavLink>
                <NavLink to="/ChasingPage">
                    <button className={styles.SBIAFollowButtom}>追蹤清單</button>
                </NavLink>
            </div>

            <hr className={styles["Shr-line"]} /> {/* 帶橫線的名稱建議使用方括號存取 */}

            <div className={styles.SBFormWrapper}>
                {/* 個人資料表單 */}
                <form onSubmit={handleSubmit(onUpdateClientData)}>
                    <div className={styles.SBInputArea}>
                        <div className={styles.SBIArow}>
                            <label className={styles.SBIATitle}>帳號</label>
                            <div className={styles.SBIAtext}>
                                <input type="text" readOnly {...register("account")} />
                            </div>
                        </div>
                        
                        <div className={styles.SBIArow}>
                            <label className={styles.SBIATitle}>用戶名稱</label>
                            <div className={styles.SBIAtext}>
                                <input type="text" {...register("cName", { required: "必填" })} />
                            </div>
                            {errors.cName && <p className={styles["error-message"]}>{errors.cName.message}</p>}
                        </div>

                        <div className={styles.SBIArow}>
                            <label className={styles.SBIATitle}>性別</label>
                            <div className={styles.SBIAtext}>
                                <select {...register("sex")}> 
                                    <option value="male">男</option>
                                    <option value="female">女</option>
                                    <option value="other">其他</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.SBIArow}>
                            <label className={styles.SBIATitle}>生日</label>
                            <div className={styles.SBIAtext}>
                                <input type="date" readOnly {...register("birthday")} />
                            </div>
                        </div>

                        <div className={styles.SBIArow}>
                            <label className={styles.SBIATitle}>電話</label>
                            <div className={styles.SBIAtext}>
                                <input type="tel" {...register("phone", { required: "必填" })} />
                            </div>
                            {errors.phone && <p className={styles["error-message"]}>{errors.phone.message}</p>}
                        </div>

                        <div className={styles.SBIArow}>
                            <label className={styles.SBIATitle}>電子郵件</label>
                            <div className={styles.SBIAtext}>
                                <input type="email" {...register("email", { required: "必填" })} />
                            </div>
                            {errors.email && <p className={styles["error-message"]}>{errors.email.message}</p>}
                        </div>

                        <button type="submit" className={styles.SBIAModifyButtom}>更新個人資料</button>
                    </div>
                </form>
                
                <hr className={styles["Shr-line"]} />

                {/* 密碼修改表單 */}
                <form onSubmit={handlePasswordSubmit(onChangePassword)}>
                    <div className={styles.SBPasswordArea}>
                        <div className={styles.SBIArowtwo}>
                            <label className={styles.SBIATitletwo}>新密碼</label>
                            <div className={styles.SBIAtexttwo}>
                                <input type="password" {...registerPassword("password", { required: "必填" })} />
                            </div>
                            {passwordErrors.password && <p className={styles["error-message"]}>{passwordErrors.password.message}</p>}
                        </div>

                        <div className={styles.SBIArowtwo}>
                            <label className={styles.SBIATitletwo}>確認新密碼</label>
                            <div className={styles.SBIAtexttwo}>
                                <input type="password" {...registerPassword("confirmPassword", { validate: v => v === newPassword || "密碼不一致" })} />
                            </div>
                            {passwordErrors.confirmPassword && <p className={styles["error-message"]}>{passwordErrors.confirmPassword.message}</p>}
                        </div>

                        <button type="submit" className={styles.SBIAModifyButtomtwo}>修改密碼</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingBody;