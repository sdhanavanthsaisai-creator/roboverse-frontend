import Nav from './components/Nav';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import Problem from './sections/Problem';
import HardwareModel from './sections/HardwareModel';
import Solution from './sections/Solution';
import MazeLab from './sections/MazeLab';
import CodeVault from './sections/CodeVault';
import Team from './sections/Team';
import Contact from './sections/Contact';

export default function App() {
  return (
    <div className="min-h-screen bg-void text-ink">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HardwareModel />
        <Solution />
        <MazeLab />
        <CodeVault />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
