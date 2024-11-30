import { ThemeToggleList, ThemeToggleButton } from 'components/Theme'
import Link from 'next/link'

export function Header() {
  const items = [
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'DecodeTx',
      url: '/decode',
    },
    {
      name: 'Other',
      url: '/',
    },
  ]
  return (
    <header className={'header'}>
      <div>
        <p>LOGO</p>
      </div>
      <div className="nav">
        {items &&
          items.map(item => {
            return (
              <Link href={item.url} key={item.name}>
                {item.name.toUpperCase()}
              </Link>
            )
          })}
      </div>

      <div className="flex items-center">
        <ThemeToggleList />
      </div>
    </header>
  )
}
