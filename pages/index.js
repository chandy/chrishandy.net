import Head from "next/head";
// import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Layout from "../components/Layout";

// import { AiFillGithub } from "react-icons/ai";

const Home = () => (
  <>
    <Head>
      <title>Chris Handy&apos;s homepage</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout>
      <Header></Header>
      <main className="flex items-center max-w-2xl justify-center m-auto">
        <div className="flex max-w-2xl justify-center align-middle p-2 m-1">
          <p>Under construction...</p>
        </div>
      </main>
      <Footer></Footer>
    </Layout>
  </>
);

export default Home;
