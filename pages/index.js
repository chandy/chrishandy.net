import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { AiFillGithub } from 'react-icons/ai';

export default function Home() {
  return (
    <div className="font-mono mx-auto">
      <Head>
        <title>Chris Handy&apos;s homepage</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex w-full justify-between p-2 m-1">
        <Link href="/">
          <a>
            chrishandy.net
          </a>
        </Link>
        <div className="flex justify-between">
          <nav>
          {/* <AiFillGithub/> */}
          <Link href="https://github.com/chandy/chrishandy.net">
            <a>Source</a>
          </Link>
            <Link href="https://twitter.com/chrishandy_">
            <a className="bg-black text-white">Follow Me</a>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="flex justify-center align-middle p-2 m-1">
        <p>Under construction....</p>
        </div>
      </main>
      <footer>
          <div className="flex justify-center items-center p-2 m-1">
            Powered by{' '}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </div>
      </footer>
    </div>
  )
}
