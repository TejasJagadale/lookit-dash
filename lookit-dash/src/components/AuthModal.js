import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AuthModal.css";
import {
  Mail, Lock, Phone, User, Calendar, Gift,
  X, ArrowLeft, Shield, CheckCircle, Smartphone
} from "lucide-react";

const AuthModal = ({ onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [shake, setShake] = useState(false);
  
  // Login method (email or mobile)
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "mobile"

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileLogin, setMobileLogin] = useState("");

  // OTP fields
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // Signup fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    referal_name: "",
    dob: "",
    app_name: "MPDataHub",
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (form.password) {
      const strength = calculatePasswordStrength(form.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [form.password]);

  useEffect(() => {
    let timer;
    if (otpResendTimer > 0) {
      timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpResendTimer]);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    if (type === "error") {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("Creating your account...", "info");

    try {
      await axios.post("https://users.mpdatahub.com/api/mps-bus-sol-register", form);
      showMessage("Account created successfully! Please login.", "success");
      setTimeout(() => {
        setActiveTab("login");
        setEmail(form.email);
      }, 1500);
    } catch (err) {
      showMessage(err.response?.data?.message || "Registration failed. Please check your details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("Authenticating...", "info");

    try {
      let response;
      
      if (loginMethod === "email") {
        // Email login
        response = await axios.post(
          "https://users.mpdatahub.com/api/mps-bus-sol-login",
          { email, password }
        );
        
        const userMobile = response.data.user.mobile;
        setMobile(userMobile);
        showMessage("Login successful! Sending OTP...", "success");
        await handleSendOtpAPI(userMobile);
        
      } else {
        // Mobile login - first send OTP
        if (!mobileLogin.match(/^[0-9]{10}$/)) {
          showMessage("Please enter a valid 10-digit mobile number", "error");
          setLoading(false);
          return;
        }
        
        setMobile(mobileLogin);
        showMessage("Sending OTP to your mobile...", "info");
        await handleSendOtpAPI(mobileLogin);
        showMessage("OTP sent successfully!", "success");
      }
      
      setStep(2);
    } catch (err) {
      if (loginMethod === "email") {
        showMessage("Invalid email or password.", "error");
      } else {
        showMessage("Failed to send OTP. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpAPI = async (mobileNumber) => {
    try {
      await axios.post("https://users.mpdatahub.com/api/mps-bus-sol-sendotp", {
        mobile: mobileNumber,
      });
      setOtpResendTimer(30);
      showMessage("OTP sent to your mobile!", "success");
    } catch (err) {
      showMessage("Failed to send OTP. Please try again.", "error");
    }
  };

  const handleResendOtp = () => {
    if (otpResendTimer === 0) {
      handleSendOtpAPI(mobile);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("Verifying OTP...", "info");

    try {
      const otpString = otp.join("");
      let userData;
      
      if (loginMethod === "email") {
        // Email login OTP verification
        const res = await axios.post(
          "https://users.mpdatahub.com/api/verifyotp",
          { mobile, otp: otpString }
        );

        const user = res.data;
        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          token: user.token,
          role: user.role,
          onboarding: user.onboarding,
          referal_code: user.referal_code,
          dob: user.dob,
          image: `https://ui-avatars.com/api/?name=${user.name}&background=667eea&color=fff`,
        };
      } else {
        // Mobile login OTP verification - you might need a different endpoint
        const res = await axios.post(
          "https://users.mpdatahub.com/api/verifyotp", // Update this endpoint
          { mobile, otp: otpString }
        );

        const user = res.data;
        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          token: user.token,
          role: user.role,
          onboarding: user.onboarding,
          referal_code: user.referal_code,
          dob: user.dob,
          image: `https://ui-avatars.com/api/?name=${user.name}&background=667eea&color=fff`,
        };
      }

      console.log("User Data:", userData);

      // Save full user data in localStorage
      localStorage.setItem("mp_user", JSON.stringify(userData));
      localStorage.setItem("mp_token", userData?.token);

      showMessage("Verification successful! Welcome back!", "success");

      setTimeout(() => {
        onLogin(userData);
        onClose();
      }, 1000);

    } catch (err) {
      showMessage("Invalid OTP. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "#10b981";
    if (passwordStrength >= 50) return "#f59e0b";
    return "#ef4444";
  };

  // Reset login form when switching methods
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setEmail("");
    setPassword("");
    setMobileLogin("");
    setMessage({ text: "", type: "" });
  };

  return (
    <motion.div
      className="auth-overlay1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`auth-modal1 ${shake ? "shake" : ""}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* LEFT SIDE - HERO SECTION */}
        <div className="auth-left1">
          <div className="auth-hero1">
            <div className="hero-content1">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Shield size={48} className="hero-icon1" />
                <h3>Secure Authentication</h3>
                <p>Two-factor authentication for enhanced security</p>
              </motion.div>

              <div className="features-list1">
                {[
                  { icon: CheckCircle, text: "Bank-level security" },
                  { icon: CheckCircle, text: "Real-time OTP verification" },
                  { icon: CheckCircle, text: "Encrypted data transfer" },
                  { icon: CheckCircle, text: "24/7 monitoring" },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="feature-item1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <feature.icon size={16} />
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="auth-right1">
          <button className="auth-close1" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="auth-header1">
            <motion.h2
              key={activeTab + step}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {activeTab === "login"
                ? step === 1 
                  ? loginMethod === "email" ? "Welcome Back!" : "Mobile Login"
                  : "Verify Identity"
                : "Create Account"}
            </motion.h2>
            <p className="auth-subtitle1">
              {activeTab === "login"
                ? step === 1
                  ? loginMethod === "email"
                    ? "Login securely with your credentials"
                    : "Login using your mobile number"
                  : "Enter OTP sent to your mobile"
                : "Join thousands of satisfied users"}
            </p>
          </div>

          {/* TABS */}
          {step === 1 && (
            <div className="auth-tabs1">
              <button
                className={`tab1 ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                <Lock size={16} />
                Login
              </button>
              <button
                className={`tab1 ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                <User size={16} />
                Sign Up
              </button>
            </div>
          )}

          {/* MESSAGE DISPLAY */}
          {message.text && (
            <motion.div
              className={`auth-msg1 ${message.type}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {message.text}
            </motion.div>
          )}

          {/* SIGNUP FORM */}
          <AnimatePresence mode="wait">
            {activeTab === "signup" && (
              <motion.form
                key="signup"
                className="auth-form1"
                onSubmit={handleSignupSubmit}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="form-grid1">
                  <div className="input-group1">
                    <User size={18} className="input-icon1" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      required
                      value={form.name}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Mail size={18} className="input-icon1" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      required
                      value={form.email}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Lock size={18} className="input-icon1" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      required
                      maxLength={8}
                      value={form.password}
                      onChange={handleSignupChange}
                    />
                    {form.password && (
                      <div className="password-strength1">
                        <div
                          className="strength-bar1"
                          style={{
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        />
                        <span>Strength: {passwordStrength}%</span>
                      </div>
                    )}
                  </div>

                  <div className="input-group1">
                    <Phone size={18} className="input-icon1" />
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="Mobile Number"
                      required
                      maxLength={10}
                      value={form.mobile}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Calendar size={18} className="input-icon1" />
                    <input
                      type="date"
                      name="dob"
                      required
                      value={form.dob}
                      onChange={handleSignupChange}
                    />
                  </div>

                  <div className="input-group1">
                    <Gift size={18} className="input-icon1" />
                    <input
                      type="text"
                      name="referal_name"
                      placeholder="Referral Code (Optional)"
                      value={form.referal_name}
                      onChange={handleSignupChange}
                    />
                  </div>
                </div>

                <motion.button
                  className="auth-btn1 primary"
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner1"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* LOGIN STEP 1 */}
            {activeTab === "login" && step === 1 && (
              <motion.div
                key="login-step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                {/* Login Method Selection */}
                <div className="login-method-selector1">
                  <button
                    type="button"
                    className={`method-btn1 ${loginMethod === "email" ? "active" : ""}`}
                    onClick={() => switchLoginMethod("email")}
                  >
                    <Mail size={16} />
                    Email Login
                  </button>
                  <button
                    type="button"
                    className={`method-btn1 ${loginMethod === "mobile" ? "active" : ""}`}
                    onClick={() => switchLoginMethod("mobile")}
                  >
                    <Smartphone size={16} />
                    Mobile Login
                  </button>
                </div>

                <form className="auth-form1" onSubmit={handleLoginSubmit}>
                  {loginMethod === "email" ? (
                    <>
                      <div className="input-group1">
                        <Mail size={18} className="input-icon1" />
                        <input
                          type="email"
                          placeholder="Email Address"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="input-group1">
                        <Lock size={18} className="input-icon1" />
                        <input
                          type="password"
                          placeholder="Password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="input-group1">
                      <Phone size={18} className="input-icon1" />
                      <input
                        type="tel"
                        placeholder="Enter 10-digit Mobile Number"
                        required
                        maxLength={10}
                        value={mobileLogin}
                        onChange={(e) => setMobileLogin(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  )}

                  <motion.button
                    className="auth-btn1 primary"
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="spinner1"></div>
                        {loginMethod === "email" ? "Authenticating..." : "Sending OTP..."}
                      </>
                    ) : (
                      loginMethod === "email" ? "Continue to OTP" : "Send OTP"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* OTP VERIFICATION */}
            {activeTab === "login" && step === 2 && (
              <motion.form
                key="otp"
                className="auth-form1"
                onSubmit={handleVerifyOtp}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="otp-header1">
                  <Phone size={24} />
                  <p>OTP sent to ******{mobile.slice(-4)}</p>
                  <small className="login-method-indicator1">
                    {loginMethod === "email" ? "Email Login" : "Mobile Login"}
                  </small>
                </div>

                <div className="otp-container1">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      className="otp-input1"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="otp-actions1">
                  <button
                    type="button"
                    className="resend-btn1"
                    onClick={handleResendOtp}
                    disabled={otpResendTimer > 0}
                  >
                    {otpResendTimer > 0
                      ? `Resend OTP in ${otpResendTimer}s`
                      : "Resend OTP"
                    }
                  </button>
                </div>

                <div className="btn-group1">
                  <motion.button
                    type="button"
                    className="auth-btn1 secondary"
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </motion.button>

                  <motion.button
                    className="auth-btn1 primary"
                    type="submit"
                    disabled={loading || otp.join("").length !== 4}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="spinner1"></div>
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;