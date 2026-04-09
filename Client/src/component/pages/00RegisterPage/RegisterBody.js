import "./css/RegisterPage.css";
import { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MaskContext } from "../../../ContextAPI";
import { useForm } from 'react-hook-form';

const RegisterBody = () => {
  const navigate = useNavigate();
  const { setMask } = useContext(MaskContext);

  // 初始化 useForm
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    mode: "onBlur" // 失去焦點時觸發驗證
  });

  // 監聽密碼欄位，供「確認密碼」比對
  const password = watch("password", "");

  const onSubmit = async (data) => {
    try {
      setMask(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/registerpage/register`, {
        cName: data.cName,
        account: data.account,
        password: data.password,
        email: data.email,
        phone: data.phone,
        sex: data.sex,
        birthday: data.birthday
      });

      alert(`註冊成功！您的 ID 是：${response.data.clientId}`);
      reset(); // 清空表單
      navigate("/LoginPage");
      
    } catch (error) {
      if (error.response) {
        // 後端整合成字串的錯誤訊息會在這裡顯示
        alert(`註冊失敗：\n${error.response.data.message}`);
      } else {
        alert("無法連線到伺服器");
      }
    } finally {
      setMask(false);
    }
  };

  return (
    <div className="RegisterBody">
      <div className="RBTitle">註冊帳號</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="RBInputArea">

          {/* 帳號 */}
          <div className="RBIArow">
            <div className="RBIATitle">帳號</div>
            <div className="RBIAtext">
              <input 
                type="text" 
                placeholder="請輸入帳號 (8-20 字元，含大小寫字母及符號)" 
                {...register("account", { 
                  required: "帳號為必填",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).{8,20}$/,
                    message: "帳號格式錯誤 (需 8-20 字元，包含大小寫字母及符號)"
                  }
                })} 
              />
            </div>
            {errors.account && <p className="error-message">{errors.account.message}</p>}
          </div>

          {/* 用戶名稱 */}
          <div className="RBIArow">
            <div className="RBIATitle">用戶名稱</div>
            <div className="RBIAtext">
              <input 
                type="text" 
                placeholder="請輸入用戶名稱" 
                {...register("cName", { 
                  required: "用戶名稱為必填",
                  maxLength: { value: 30, message: "長度不能超過 30 個字元" }
                })} 
              />
            </div>
            {errors.cName && <p className="error-message">{errors.cName.message}</p>}
          </div>

          {/* 性別 */}
          <div className="RBIArow">
            <div className="RBIATitle">性別</div>
            <div className="RBIAtext">
              <select {...register("sex", { required: "請選擇性別" })}>
                <option value="">請選擇性別</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            {errors.sex && <p className="error-message">{errors.sex.message}</p>}
          </div>

          {/* 生日 */}
          <div className="RBIArow">
            <div className="RBIATitle">生日</div>
            <div className="RBIAtext">
              <input 
                type="date" 
                {...register("birthday", { 
                  required: "生日為必填",
                  validate: value => new Date(value) < new Date() || "生日必須是過去的日期"
                })} 
              />
            </div>
            {errors.birthday && <p className="error-message">{errors.birthday.message}</p>}
          </div>

          {/* 電話 */}
          <div className="RBIArow">
            <div className="RBIATitle">電話</div>
            <div className="RBIAtext">
              <input 
                type="tel" 
                placeholder="請輸入 10 位數字電話" 
                {...register("phone", { 
                  required: "電話為必填",
                  pattern: { value: /^[0-9]{10}$/, message: "電話號碼必須是 10 位數字" }
                })} 
              />
            </div>
            {errors.phone && <p className="error-message">{errors.phone.message}</p>}
          </div>

          {/* 電子郵件 */}
          <div className="RBIArow">
            <div className="RBIATitle">電子郵件</div>
            <div className="RBIAtext">
              <input 
                type="email" 
                placeholder="請輸入電子郵件 (8-64 字元)" 
                {...register("email", { 
                  required: "電子郵件為必填",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "電子郵件格式錯誤"
                  },
                  minLength: { value: 8, message: "長度至少 8 字元" },
                  maxLength: { value: 64, message: "長度不能超過 64 字元" }
                })} 
              />
            </div>
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          {/* 密碼 */}
          <div className="RBIArow">
            <div className="RBIATitle">密碼</div>
            <div className="RBIAtext">
              <input 
                type="password" 
                placeholder="請輸入密碼 (8-20 字元，含大小寫字母及符號)" 
                {...register("password", { 
                  required: "密碼為必填",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).{8,20}$/,
                    message: "密碼格式錯誤 (需 8-20 字元，包含大小寫字母及符號)"
                  }
                })} 
              />
            </div>
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          {/* 密碼確認 */}
          <div className="RBIArow">
            <div className="RBIATitle">密碼確認</div>
            <div className="RBIAtext">
              <input 
                type="password" 
                placeholder="請再次輸入密碼" 
                {...register("confirmPassword", { 
                  required: "請再次確認密碼",
                  validate: value => value === password || "密碼與確認密碼不一致"
                })} 
              />
            </div>
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
          </div>

          {/* 確認按鈕 */}
          <div className="RBButtonArea">
            <button className="RBIAConfirmButtom" type="submit">
              確認
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default RegisterBody;