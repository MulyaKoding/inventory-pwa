import "react"
import CSChatWidget from "../components/CSChatWidget"
import AboutNavbar from "./_components/AboutNavbar"
import AboutHero from "./_components/AboutHero"
import AboutStats from "./_components/AboutStats"
import AboutValues from "./_components/AboutValues"
import AboutTeam from "./_components/AboutTeam"
import AboutContact from "./_components/AboutContact"
import AboutFooter from "./_components/AboutFooter"

export default function AboutPage() {
  return (
    <div className="bg-[#060b1a] text-white overflow-x-hidden min-h-screen">
      <AboutNavbar />
      <main>
        <AboutHero />
        <AboutStats />
        <AboutValues />
        <AboutTeam />
        <AboutContact />
      </main>
      <AboutFooter />
      <CSChatWidget />
    </div>
  )
}
