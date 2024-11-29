import { ThemeToggleList, ThemeToggleButton } from 'components/Theme'

export function Footer() {
  return (
    <footer className={'footer'} id="footer">
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
