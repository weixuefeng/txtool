import { ThemeToggleList } from 'components/Theme'
import { Routers } from 'constant'
import Link from 'next/link'

export function Header() {
  return (
    <header className={'header'}>
      <div>
        <p>LOGO</p>
      </div>
      <div className="nav">
        {Routers &&
          Routers.map(item => {
            return (
              <Link href={item.path} key={item.name}>
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
