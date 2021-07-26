import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex items-center max-w-2xl justify-center m-auto">
      <div className="flex max-w-2xl justify-center items-center p-2 m-1">
        Powered by{" "}
        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
      </div>
    </footer>
  );
}
