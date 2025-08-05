import { NMenu } from "../../components/NMenu/NMenu";
import { NSubMenu } from "../../components/NSubmenu/NSubMenu";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={styles.Desktop}>
      <NMenu />
      <NSubMenu nomeTela={"Dashboard"} />
    </div>
  );
}
