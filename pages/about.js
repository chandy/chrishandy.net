import Head from "next/head";
import Layout from "../components/Layout";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header></Header>
      <main className="flex items-center max-w-2xl justify-center m-auto">
        <div className="flex max-w-2xl justify-center align-middle p-2 m-1">
          <p>About</p>
        </div>
      </main>
      <Footer></Footer>
    </Layout>
  );
}
