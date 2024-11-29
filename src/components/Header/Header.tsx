import { ThemeToggleList, ThemeToggleButton } from 'components/Theme'

export function Header() {
  return (
    <header className={'header'}>
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
