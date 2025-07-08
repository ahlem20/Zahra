import React, { useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { SiImessage } from "react-icons/si";
import "./WelcomePage.css";
import axios from "axios";
function WelcomePage() {
  const { authUser } = useAuthContext();
  const [openIndex, setOpenIndex] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("https://zahrabackend.onrender.com/users");
        const doctorUsers = res.data.filter(user => user.roles === "doctor");
        setDoctors(doctorUsers);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    { question: "ما هي منصة زهرة الفجر للرعاية الصحية؟", answer: "منصة زهرة الفجر تقدم خدمات الرعاية الصحية بسهولة وأمان." },
    { question: "ما هي خدمات منصة زهرة الفجر؟", answer: "خدمات منصة زهرة الفجر تشمل الاستشارات الطبية والاشتراكات الصحية." },
    { question: "هل الاستشارات الطبية مجانية؟", answer: "تختلف حسب نوع الخدمة: بعض الاستشارات مجانية والأخرى برسوم." },
    { question: "كم سعر الاشتراك في خدمات زهرة الفجر للاستشارات الطبية عن بعد؟", answer: "الاشتراك الشهري يبدأ من سعر معين حسب الخدمة المختارة." },
    { question: "هل الاستشارات الطبية عن بعد سرية وآمنة؟", answer: "نعم، جميع الاستشارات مشفرة وآمنة." },
    { question: "كيف يمكن التسجيل في زهرة الفجر؟", answer: "التسجيل يتم عبر موقع زهرة الفجر بسهولة." },
    { question: "كيف يمكنني الحصول على استشارة طبية؟", answer: "يمكنك حجز موعد بسهولة عبر موقع زهرة الفجر أو التطبيق." },
    { question: "هل يمكنني إجراء استشارة طبية عبر الجوال؟", answer: "نعم، يمكنك استخدام تطبيق زهرة الفجر لإجراء استشارات عبر الجوال." },
  ];

  return (
    <div className="myapp-container">
      {/* Navbar */}
      <motion.nav className="nav-bar" initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
  <div className="nav-left">
    {authUser ? (
      <>
        <Link to="/">
          <button className="icon-button"><SiImessage size={20} /></button>
        </Link>
        <span className="username-text">{authUser.username} ,مرحبًا</span>
      </>
    ) : (
      <Link to="/login">
        <button className="login-button">تسجيل الدخول</button>
      </Link>
    )}
  </div>
  <div className="nav-title">زهرة الفجر</div>
</motion.nav>


      {/* Hero Section */}
      <section className="hero-section">
        <motion.div className="hero-video" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
          <iframe className="video-frame" src="https://www.youtube.com/embed/k7x9T5-jAxY" title="Video" frameBorder="0" allowFullScreen></iframe>
        </motion.div>

        <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="hero-title">إبدء <span className="highlight-text">من جديد</span></h1>
          <p className="hero-description">زهرة الفجر: منصة تساعدك في النهوض من جديد من أجل مستقبل أفضل</p>
          <button className="discover-button">اكتشف المزيد</button>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section id="Mission" className="mission-section">
        <div className="mission-grid" dir="rtl">
          <div className="mission-image">
            <img src="/aboutus.jpg" alt="Preview" className="image" />
          </div>
          <div className="mission-text">
            <h1>منصتنا <span className="highlight-text">منفذك للتغيير</span></h1>
            <p>منصة تقدم استشارات نفسية وأسرية وزوجية عن بُعد مع سرية تامة وسهولة استخدام وأسعار مناسبة.</p>
            <p>نسعى لسد فجوة السوق بدمج التكنولوجيا مع الخدمات الإنسانية وتحقيق توازن نفسي وأسري.</p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-item"><h3>+1000</h3><p>مريض</p><p>تعالج</p></div>
          <div className="stat-item"><h3>+1000</h3><p>مريض</p><p>يتعالج</p></div>
          <div className="stat-item"><h3>+10</h3><p>اطباء اكفاء</p><p>والمزيد</p></div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="doctors-section">
  <h2>أطباؤنا <span className="highlight-text">المميزون</span></h2>
  <div className="doctors-grid">
    {doctors.map((doc) => (
      <div className="doctor-card" key={doc._id}>
        <img
          className="doctor-image"
          src={doc?.avatar ? `https://zahrabackend.onrender.com${doc.avatar}` : "./avatar.png"}
          alt="doctor"
        />
        <h3>{doc.username}</h3>
        <p>طبيب</p>
        <p>{doc.description || "لا يوجد وصف متاح"}</p>

        <Link to={`/?receiverId=${doc._id}`}>
  <button className="start-session-button">ابدأ جلسة</button>
</Link>
      </div>
    ))}
  </div>
</section>


      {/* Call to Action */}
      <section className="call-to-action">
        <motion.h2 initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7 }}>احجز مكالمة مع مؤسسنا!</motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>تواصل معنا لبدأ مسار جديد</motion.p>
        <div className="calendly-inline-widget" data-url="https://calendly.com/dzahlem96/new-meeting" style={{ minWidth: '320px', height: '700px' }}></div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>الأسئلة الأكثر شيوعًا</h2>
        <p>اعرف أكثر عن منصة زهرة الفجر وخدمات الرعاية الصحية.</p>
        <div className="faq-grid">
          {faqData.map((item, index) => (
            <div className="faq-item" key={index} onClick={() => toggleAccordion(index)}>
              <div className="faq-question">
                <FaQuestionCircle /> <span>{item.question}</span> <span>{openIndex === index ? '▲' : '▼'}</span>
              </div>
              {openIndex === index && <div className="faq-answer">{item.answer}</div>}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="contact-button">تواصل معنا</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <motion.p initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>© 2024 زهرة الفجر. جميع الحقوق محفوظة.</motion.p>
        <p><a href="/terms">شروط الاستخدام</a> | <a href="/privacy">سياسة الخصوصية</a></p>
      </footer>
    </div>
  );
}

export default WelcomePage;
