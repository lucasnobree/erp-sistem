import { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Tabs, 
  Tab, 
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock,
  Email
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { useNotification } from '../../components/common/Notification/Notification';
import { Loading } from '../../components/common/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuth();
  const { showError, showSuccess } = useNotification();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    clearError();
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (activeTab === 0) {
      // Login
      if (!formData.username || !formData.password) {
        showError('Por favor, preencha todos os campos');
        return;
      }

      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        showSuccess('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } else {
      // Registro
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        showError('Por favor, preencha todos os campos');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        showError('As senhas não coincidem');
        return;
      }

      if (formData.password.length < 8) {
        showError('A senha deve ter pelo menos 8 caracteres');
        return;
      }

      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        showSuccess('Conta criada com sucesso!');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className={styles.Container}>
      <Paper className={styles.Paper} elevation={8}>
        <Box className={styles.Header}>
          <Typography variant="h4" className={styles.Title}>
            ERP Sistema
          </Typography>
          <Typography variant="body1" className={styles.Subtitle}>
            Gerencie seu negócio de forma eficiente
          </Typography>
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          className={styles.Tabs}
          variant="fullWidth"
        >
          <Tab label="Entrar" />
          <Tab label="Cadastrar" />
        </Tabs>

        <Box className={styles.FormContainer}>
          {error && (
            <Alert severity="error" className={styles.ErrorAlert}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className={styles.Form}>
            <TextField
              fullWidth
              label="Nome de usuário"
              value={formData.username}
              onChange={handleInputChange('username')}
              className={styles.TextField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            {activeTab === 1 && (
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={styles.TextField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
              />
            )}

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              className={styles.TextField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            {activeTab === 1 && (
              <TextField
                fullWidth
                label="Confirmar senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className={styles.TextField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              className={styles.SubmitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loading size={24} message="" />
              ) : (
                activeTab === 0 ? 'Entrar' : 'Cadastrar'
              )}
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
