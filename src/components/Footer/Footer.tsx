import { ThemeToggleList, ThemeToggleButton } from 'components/Theme'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className={'footer'} id="footer">
      <div>
        <p></p>
      </div>
      <div className="flex items-center">
        <Link href={'https://github.com/weixuefeng/'}>https://github.com/weixuefeng/</Link>
      </div>

      <div className="flex items-center"></div>
    </footer>
  )
}
