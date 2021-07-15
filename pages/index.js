import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { AiFillGithub } from 'react-icons/ai';

export default function Home() {
  return (
    <div className="font-mono container">
      <Head>
        <title>Chris Handy&apos;s homepage</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex w-full max-w-2xl justify-between p-1 m-1">
        <div className="flex py-1">
          <Link href="/">
            <a className="p-2">chrishandy.net</a>
          </Link>
        </div>
        <div className="flex p-1">
          {/* <AiFillGithub/> */}
          <Link href="https://github.com/chandy/chrishandy.net">
            <a className="p-2">Source</a>
          </Link>
            <Link href="https://twitter.com/chrishandy_">
            <a className="bg-black text-white p-2">Follow Me</a>
            </Link>
        </div>
      </header>

      <main>
        <div className="flex max-w-2xl justify-center align-middle p-2 m-1">
        <p>Under construction...</p>
        </div>
      </main>
      <footer>
          <div className="flex max-w-2xl justify-center items-center p-2 m-1">
            Powered by{' '}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </div>
      </footer>
    </div>
  )
}
