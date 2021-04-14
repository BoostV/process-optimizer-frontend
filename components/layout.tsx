import Link from 'next/link'

export default function Layout ( {children}) {
  return (
    <div>
      <Link href="/">
        <a>Home</a>
      </Link>
      <span> | </span>
      <Link href="/experiment/123">
        <a>Experiment</a>
      </Link>
      {children}
    </div>
  )
}