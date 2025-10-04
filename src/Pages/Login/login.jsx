import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Grid, Box, Button, TextField, Typography } from "@mui/material";
import styles from "./login.module.css";
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleSignIn = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <Box className={styles.container}>
      <Box
        className={
          isSignIn
            ? styles.toggleContainer
            : `${styles.toggleContainer} ${styles.toggleActive}`
        }
      >
        <Box className={styles.toggle}>
          <Box className={styles.togglePanel}>
            <Typography variant="h5">
              {isSignIn ? "Olá, Amigo!" : "Bem-vindo de volta!"}
            </Typography>
            <Typography variant="body2">
              {isSignIn
                ? "Cadastre-se com seus dados pessoais para usar todos os recursos do site"
                : "Faça login para continuar acessando sua conta"}
            </Typography>
            <Button
              variant="outlined"
              onClick={toggleSignIn}
              className={styles.button}
            >
              {isSignIn ? "Cadastrar" : "Entrar"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2} className={styles.formContainer}>
        {isSignIn ? (
          <Grid item xs={12} sm={6} className={styles.signIn}>
            <form className={styles.form}>
              <Typography variant="h4">Entrar</Typography>
              <div className={styles.socialIcons}>
                <Button className={styles.icon}><GoogleIcon/></Button>
                <Button className={styles.icon}><FacebookIcon/></Button>
                <Button className={styles.icon}><GitHubIcon/></Button>
                <Button className={styles.icon}><LinkedInIcon/></Button>
              </div>
              <Typography variant="body2">ou use seu email e senha</Typography>
              <TextField
                fullWidth
                label="Usuário"
                variant="outlined"
                margin="normal"
                className={styles.input}
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                variant="outlined"
                margin="normal"
                className={styles.input}
              />
              <Typography
                variant="body2"
                className={styles.forgotPassword}
                component="a"
                href="#"
              >
                Esqueceu sua senha?
              </Typography>
              <NavLink
                to="/dashboard"
                className={styles.button}
                variant="contained"
                color="primary"
                fullWidth
              >
                Entrar
              </NavLink>
            </form>
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} className={styles.signUp}>
            <form className={styles.form}>
              <Typography variant="h4">Criar Conta</Typography>
              <div className={styles.socialIcons}>
                <Button className={styles.icon}><GoogleIcon/></Button>
                <Button className={styles.icon}><FacebookIcon/></Button>
                <Button className={styles.icon}><GitHubIcon/></Button>
                <Button className={styles.icon}><LinkedInIcon/></Button>
              </div>
              <Typography variant="body2">
                ou use seu email para se cadastrar
              </Typography>
              <TextField
                fullWidth
                label="Usuário"
                variant="outlined"
                margin="normal"
                className={styles.input}
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                className={styles.input}
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                variant="outlined"
                margin="normal"
                className={styles.input}
              />
              <NavLink
                to="/dashboard"
                className={styles.button}
                variant="contained"
                color="primary"
                fullWidth
              >
                Cadastrar
              </NavLink>
            </form>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
