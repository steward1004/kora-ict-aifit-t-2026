import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.20),_transparent_22%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.72),_rgba(15,23,42,0.96))]" />

        <main className="relative">
          <Home />
        </main>
      </div>
    </div>
  );
}

export default App;
