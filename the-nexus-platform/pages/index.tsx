import { NextPage } from 'next'
import Head from 'next/head'
import { HeroSection } from '../components/HeroSection'
import { TechShowcase } from '../components/TechShowcase'
import { Layout } from '../components/Layout'

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>The Nexus Platform - Next-Generation IT Corporate Website</title>
        <meta name="description" content="Revolutionary IT corporate website with AI-driven content management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <HeroSection />
      <TechShowcase />
    </Layout>
  )
}

export default Home