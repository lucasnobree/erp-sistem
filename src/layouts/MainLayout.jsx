import { Outlet } from "react-router-dom";
import { NMenu } from "../components/NMenu/NMenu";
import { NSubMenu } from "../components/NSubmenu/NSubMenu";
import styles from "./MainLayout.module.css";

/**
 * Layout principal da aplicação
 * Contém o menu lateral e o submenu superior
 * Utiliza Outlet para renderizar as páginas filhas
 */
export function MainLayout({ nomeTela = "Dashboard" }) {
  return (
    <div className={styles.Desktop}>
      <NMenu />
      <div className={styles.Content}>
        <NSubMenu nomeTela={nomeTela} />
        <main className={styles.MainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

