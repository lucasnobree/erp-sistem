import { NMenu } from "./components/NMenu/NMenu";
import { NSubMenu } from "./components/NSubmenu/NSubMenu";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.Desktop}>
      <NMenu />
      <NSubMenu nomeTela={"Dashboard"} />
    </div>
  );
}
