import Link from "next/link";

const Header = () => (
  <header className="flex items-center max-w-2xl justify-between p-1 m-auto">
    <div className="flex p-1">
      <Link href="/">
        <a className="p-2">chrishandy.net</a>
      </Link>
    </div>
    <div className="flex p-1">
      {/* <AiFillGithub/> */}
      <Link href="/about">
        <a className="p-2">About</a>
      </Link>
      <Link href="https://github.com/chandy/chrishandy.net">
        <a className="p-2" target="_blank">
          Source
        </a>
      </Link>
      <Link href="https://twitter.com/chrishandy_">
        <a className="bg-black text-white p-2" target="_blank">
          Follow Me
        </a>
      </Link>
    </div>
  </header>
);

export default Header;
