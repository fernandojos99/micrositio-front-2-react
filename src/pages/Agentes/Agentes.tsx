import "./globals.css"
import { AgentesGrid } from "./components/agentes-grid"


const Agentes: React.FC = () => {

  return (
    <main className="agentes-theme min-h-screen bg-theme-bg-primary">
      <AgentesGrid />
    </main>
  )

}

export default Agentes;