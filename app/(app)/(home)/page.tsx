import CSChatWidget from "../components/CSChatWidget"
import HomeNavbar from "./_components/HomeNavbar"
import HomeHero from "./_components/HomeHero"
import HomeSocialProof from "./_components/HomeSocialProof"
import HomeTeamSection from "./_components/HomeTeamSection"
import HomeFeatures from "./_components/HomeFeatures"
import HomeAnalyticsSection from "./_components/HomeAnalyticsSection"
import HomeProductTable from "./_components/HomeProductTable"
import HomeAboutSection from "./_components/HomeAboutSection"
import HomeFooter from "./_components/HomeFooter"

export default function HomePage() {
  return (
    <>
      <HomeNavbar />
      <HomeHero />
      <HomeSocialProof />
      <HomeTeamSection />
      <HomeFeatures />
      <HomeAnalyticsSection />
      <HomeProductTable />
      <HomeAboutSection />
      <HomeFooter />
      <CSChatWidget />
    </>
  )
}
