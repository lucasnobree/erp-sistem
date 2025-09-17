import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Github, Facebook, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import styles from "./login.module.css";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
   const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.container} ${isSignUp ? styles.active : ''}`}>
        
        <div className={styles.toggleContainer}>
          <div className={styles.toggle}>
            <div className={styles.togglePanel}>
              <h2 className={styles.toggleTitle}>
                {isSignUp ? "Bem-vindo de volta!" : "Olá, Amigo!"}
              </h2>
              <p className={styles.toggleText}>
                {isSignUp 
                  ? "Faça login para continuar acessando sua conta e aproveitar todos os recursos"
                  : "Cadastre-se com seus dados pessoais para usar todos os recursos do site"
                }
              </p>
              <button
                onClick={toggleMode}
                className={styles.toggleButton}
              >
                {isSignUp ? "Entrar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className={styles.signInContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h1 className={styles.formTitle}>Entrar</h1>

            {/* Social Icons */}
            <div className={styles.socialIcons}>
              <button type="button" className={styles.socialBtn}>
                <Mail className={styles.socialIcon} />
              </button>
              <button type="button" className={styles.socialBtn}>
                <Facebook className={styles.socialIcon} />
              </button>
              <button type="button" className={styles.socialBtn}>
                <Github className={styles.socialIcon} />
              </button>
              <button type="button" className={styles.socialBtn}>
                <Linkedin className={styles.socialIcon} />
              </button>
            </div>

            <p className={styles.formSubtext}>
              ou use seu email e senha
            </p>

            {/* Email */}
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.inputField}
                placeholder=" "
                required
              />
              <label className={styles.inputLabel}>Email</label>
              <Mail className={styles.inputIcon} />
            </div>

            {/* Senha Input */}
            <div className={styles.inputGroup}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.inputField} ${styles.passwordField}`}
                placeholder=" "
                required
              />
              <label className={styles.inputLabel}>Senha</label>
              <Lock className={styles.inputIcon} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
              </button>
            </div>

            <div className={styles.forgotPassword}>
              <a href="#" className={styles.forgotLink}>
                Esqueceu sua senha?
              </a>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              onClick={() => navigate('/dashboard')}
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className={styles.signUpContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h1 className={styles.formTitle}>Criar Conta</h1>

            <div className={styles.socialIcons}>
              <button type="button" className={styles.socialBtn}>
                <Mail className={styles.socialIcon} />
              </button>
              <button type="button" className={styles.socialBtn}>
                <Facebook className={styles.socialIcon} />
              </button>
              <button type="button" className={styles.socialBtn}>
                <Github className={styles.socialIcon} />
              </button>
              <button type="button" className={styles.socialBtn}>
                <Linkedin className={styles.socialIcon} />
              </button>
            </div>

            <p className={styles.formSubtext}>
              ou use seu email para se cadastrar
            </p>

            {/* Nome Input */}
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.inputField}
                placeholder=" "
                required
              />
              <label className={styles.inputLabel}>Nome</label>
              <User className={styles.inputIcon} />
            </div>

            {/* Email Input */}
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.inputField}
                placeholder=" "
                required
              />
              <label className={styles.inputLabel}>Email</label>
              <Mail className={styles.inputIcon} />
            </div>

            {/* Senha Input */}
            <div className={styles.inputGroup}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.inputField} ${styles.passwordField}`}
                placeholder=" "
                required
              />
              <label className={styles.inputLabel}>Senha</label>
              <Lock className={styles.inputIcon} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
              </button>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}