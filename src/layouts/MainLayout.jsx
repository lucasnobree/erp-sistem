import { Outlet } from "react-router-dom";
import { NMenu } from "../components/NMenu/NMenu";
import { NHeader } from "../components/NHeader/NHeader";
import styles from "./MainLayout.module.css";

/**
 * Layout principal da aplicação
 * Contém o menu lateral e o submenu superior
 * Utiliza Outlet para renderizar as páginas filhas
 */
export function MainLayout({pesquisar = true}) {
  return (
    <div className={styles.Desktop}>
      <NMenu />
      <div className={styles.Content}>
        <NHeader pesquisar={pesquisar}/>
        <main className={styles.MainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

