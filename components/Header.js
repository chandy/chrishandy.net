import Link from "next/link";

const Header = () => (
  <header className="flex items-center max-w-2xl justify-between p-1 m-auto">
    <div className="flex p-1">
      <Link href="/" className="p-2">
        chrishandy.net
      </Link>
    </div>
    <div className="flex p-1">
      {/* <AiFillGithub/> */}
      <Link href="/about" className="p-2">
        About
      </Link>
      <Link
        href="https://github.com/chandy/chrishandy.net"
        className="p-2"
        target="_blank">
        
          Source
        
      </Link>
      <Link
        href="https://twitter.com/chrishandy_"
        className="bg-black text-white p-2"
        target="_blank">
        
          Follow Me
        
      </Link>
    </div>
  </header>
);

export default Header;
