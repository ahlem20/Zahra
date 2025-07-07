import { useState } from "react";
import { toast } from "react-toastify";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const Login = () => {
  const { setAuthUser } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [idCardFront, setIdCardFront] = useState({ file: null, url: "" });
  const [idCardBack, setIdCardBack] = useState({ file: null, url: "" });
  const [holdingIdCard, setHoldingIdCard] = useState({ file: null, url: "" });
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const HandleImage = (e, setter) => {
    if (e.target.files[0]) {
      setter({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const HandleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      const res = await fetch("http://localhost:3500/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "فشل تسجيل الدخول");
        return;
      }

      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/");

    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تسجيل الدخول");
    }
  };

  const HandleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    if (!avatar.file || !idCardFront.file || !idCardBack.file || !holdingIdCard.file) {
      toast.error("يرجى رفع جميع الصور المطلوبة");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append("avatar", avatar.file);
      formData.append("idCardFront", idCardFront.file);
      formData.append("idCardBack", idCardBack.file);
      formData.append("holdingIdCard", holdingIdCard.file);

      const res = await fetch("http://localhost:3500/auth/signup", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "فشل إنشاء الحساب");
        return;
      }

      toast.success("تم إنشاء الحساب بنجاح!");
      setIsLogin(true);

    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إنشاء الحساب");
    }
  };

  const handleGuest = () => {
    navigate("/welcome");
  };

  return (
    <div className="login" dir="rtl">
      <div className="form-container">
        <div className="toggle-buttons">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            تسجيل الدخول
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            إنشاء حساب
          </button>
          <button
            className="guest-button"
            onClick={handleGuest}
          >
            كن ضيفًا
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={HandleLogin}>
            <h2>مرحبًا بعودتك</h2>
            <input
              type="text"
              placeholder="البريد الإلكتروني"
              name="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              name="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">دخول</button>
          </form>
        ) : (
          <form onSubmit={HandleSignUp}>
            <h2>إنشاء حساب جديد</h2>

            <label htmlFor="avatar" className="avatar-label">
              <img src={avatar.url || "./avatar.png"} alt="الصورة الشخصية" className="avatar-img" />
              رفع صورة شخصية
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              style={{ display: "none" }}
              onChange={(e) => HandleImage(e, setAvatar)}
              accept="image/*"
            />

            <input
              type="text"
              placeholder="اسم المستخدم"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="البريد الإلكتروني"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="gender-selection">
              <span>الجنس:</span>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  onChange={(e) => setGender(e.target.value)}
                /> ذكر
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  onChange={(e) => setGender(e.target.value)}
                /> أنثى
              </label>
            </div>

            <div className="ids">
              <label htmlFor="idCardFront" className="avatar-label">
                <img src={idCardFront.url || "./upload.png"} alt="الوجه الأمامي" className="idCards" />
                رفع صورة البطاقة (أمامي)
              </label>
              <input
                type="file"
                id="idCardFront"
                name="idCardFront"
                style={{ display: "none" }}
                onChange={(e) => HandleImage(e, setIdCardFront)}
                accept="image/*"
              />

              <label htmlFor="idCardBack" className="avatar-label">
                <img src={idCardBack.url || "./upload.png"} alt="الوجه الخلفي" className="idCards" />
                رفع صورة البطاقة (خلفي)
              </label>
              <input
                type="file"
                id="idCardBack"
                name="idCardBack"
                style={{ display: "none" }}
                onChange={(e) => HandleImage(e, setIdCardBack)}
                accept="image/*"
              />

              <label htmlFor="holdingIdCard" className="avatar-label">
                <img src={holdingIdCard.url || "./upload.png"} alt="صورة بالبطاقة" className="idCards" />
                رفع صورة مع البطاقة
              </label>
              <input
                type="file"
                id="holdingIdCard"
                name="holdingIdCard"
                style={{ display: "none" }}
                onChange={(e) => HandleImage(e, setHoldingIdCard)}
                accept="image/*"
              />
            </div>

            <button className="buttonS" type="submit">إنشاء حساب</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
