import styles from "./NSubMenu.module.css";
import { NItemMenu } from "../NItemMenu/NItemMenu";
import { NHeader } from "../NHeader/NHeader";

export function NSubMenu({ nomeTela }) {
  return (
      <div className={styles.Tela}>
        <NHeader />
        <div>
          <div className={styles.Title}>
            {nomeTela}
            <button className={styles.addButton}>+ Add Project</button>
          </div>
          <div className={styles.subMenu}>
            <div className={styles.header}>
              <h4>Current Projects</h4>
            </div>
            <ul className={styles.subMenuList}>
              <NItemMenu name="Medical App (iOS native)" />
              <NItemMenu name="Food Delivery Service" />
              <NItemMenu name="Planner App" />
              <NItemMenu name="Internal Project" />
            </ul>
          </div>
        </div>
      </div>
  );
}
