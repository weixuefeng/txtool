import { ThemeToggleList, ThemeToggleButton } from 'components/Theme'
import styles from 'styles/Home.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div>
        <ThemeToggleList />
      </div>
      <div className="flex items-center">
        <ThemeToggleButton /> footer <ThemeToggleList />
      </div>

      <div className="flex items-center">
        <ThemeToggleButton />
        <ThemeToggleList />
      </div>
    </footer>
  )
}
