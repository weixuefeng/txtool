import { ThemeToggleList, ThemeToggleButton } from 'components/Theme'
import styles from 'styles/Home.module.scss'

export function Header() {
  return (
    <header className={styles.header}>
      <div>
        <ThemeToggleList />
      </div>
      <div className="flex items-center">
        <ThemeToggleButton /> header <ThemeToggleList />
      </div>

      <div className="flex items-center">
        <ThemeToggleButton />
        <ThemeToggleList />
      </div>
    </header>
  )
}
