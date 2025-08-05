import styles from "./NSubMenu.module.css";
import { NHeader } from "../NHeader/NHeader";

export function NSubMenu({ nomeTela }) {
  return (
    <div className={styles.Tela}>
      <NHeader />
      <div>
        <div className={styles.Header}>
          <span className={styles.Title}>{nomeTela}</span>
          <button className={styles.addButton}>+ Add {nomeTela}</button>
        </div>
        <div className={styles.subMenu}>
          <div className={styles.header}>
            <h4>Current {nomeTela}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
