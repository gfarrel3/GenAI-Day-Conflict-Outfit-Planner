import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [city, setCity] = useState('South Bend, IN');
  const [events, setEvents] = useState('');
  const [planType, setPlanType] = useState<'class' | 'clash' | 'vague' | 'generic' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [feedback, setFeedback] = useState('');

  const examples = [
    { label: 'Class-only day', events: 'Class 10-11:15, Library 1-3' },
    { label: 'Clash day', events: 'Workshop 10-12, Lenovo interview 2:00, career fair 4:30' },
    { label: 'Weather swing + vague event', events: 'Class 9-10, meeting 1:00' },
  ];

  function loadExample(value: string) {
    setCity('South Bend, IN');
    setEvents(value);
    setError('');
    setPlanType(null);
    setNotice(false);
    setAccepted(false);
    setRejecting(false);
  }

  function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!events.trim()) {
      setError('Please paste at least one event with a time.');
      setPlanType(null);
      return;
    }
    const text = events.toLowerCase();
    const hasShop = /\b(workshop|shop|fab|lab)\b/.test(text);
    const hasProfessional = /\b(interview|sponsor|career fair)\b/.test(text);
    const hasOtherRecognizable = /\b(workshop|shop|fab|lab|interview|sponsor|career fair)\b/.test(text);
    const type = hasShop && hasProfessional ? 'clash' : /\bmeeting\b/.test(text) && !hasOtherRecognizable ? 'vague' : /\b(class|library|lecture)\b/.test(text) ? 'class' : 'generic';
    setPlanType(type);
    setNotice(type === 'generic');
    setError('');
    setAccepted(false);
    setEditing(false);
    setRejecting(false);
    setRegenerated(false);
  }

  const planTitle = planType === 'clash' ? 'A day with a quick change' : planType === 'class' ? 'A comfortable class day' : planType === 'vague' ? 'A flexible day, with one question mark' : 'A dependable everyday plan';

  return (
    <main className="planner-shell">
      <div className="planner-wrap">
        <header className="page-header">
          <div className="eyebrow"><span className="eyebrow-mark" /> TOMORROW, THOUGHT THROUGH</div>
          <h1>Day-Conflict <span>Outfit Planner</span></h1>
          <p className="intro">A practical outfit plan for the day you actually have.</p>
          <div className="prototype-banner">Prototype: plans shown here are simulated examples, not live AI output.</div>
        </header>

        <section className="planner-card" aria-label="Plan your outfit">
          <form onSubmit={submitPlan}>
            <div className="form-heading">
              <div className="step-number">01</div>
              <div><h2>Start with tomorrow</h2><p>Share your city and the events on your calendar.</p></div>
            </div>
            <label className="field-label" htmlFor="city">City</label>
            <input id="city" className="text-input" value={city} onChange={(e) => setCity(e.target.value)} />
            <label className="field-label events-label" htmlFor="events">Paste tomorrow's events with times</label>
            <textarea id="events" className="text-input event-input" placeholder="Workshop 10-12, Lenovo interview 2:00, career fair 4:30" value={events} onChange={(e) => setEvents(e.target.value)} />
            {error && <p className="error-message" role="alert">{error}</p>}
            <div className="examples">
              <span className="examples-label">Try an example</span>
              {examples.map((example) => <button key={example.label} className="example-button" type="button" onClick={() => loadExample(example.events)}>{example.label}</button>)}
            </div>
            <button className="submit-button" type="submit">Get my outfit plan <span aria-hidden="true">→</span></button>
          </form>
        </section>

        {planType && (
          <section className="plan-card" aria-label="Your outfit plan">
            <div className="plan-topline">
              <div className="step-number">02</div>
              <div><p className="plan-kicker">YOUR PLAN FOR TOMORROW</p><h2>{planTitle}</h2></div>
              <div className="weather-pill"><span className="weather-dot" />{planType === 'class' ? '68°F · Mild · No rain' : planType === 'clash' ? '91°F · Hot · No rain' : planType === 'vague' ? '42°F morning · 70°F afternoon' : 'Weather not specified'}</div>
            </div>
            {notice && <div className="notice" role="status">This prototype only has prewritten plans for a few example days. Try one of the example buttons.</div>}
            <div className={`plan-content ${editing ? 'is-editing' : ''}`} contentEditable={editing} suppressContentEditableWarning>
              {planType === 'clash' ? (
                <>
                  <div className="outfit-summary"><span className="mini-label">THE BASE</span><p>Lightweight long pants, a breathable top that works in the shop and still looks professional, and closed-toe shoes that can pass for professional.</p></div>
                  <div className="conflict-flag"><span>CONFLICT TO PLAN AROUND</span><strong>Shop safety vs. interview polish</strong></div>
                  <p className="plan-detail">It will be hot. Choose breathable fabrics and remove your blazer between events.</p>
                  <ul className="action-list">
                    <li><b>Bring</b><span>Pack a throwaway t-shirt to layer over your outfit during sanding.</span></li>
                    <li><b>Swap</b><span>Change into a blazer or nicer top after the shop; there is no time to go home.</span></li>
                    <li><b>Layer</b><span>Keep the blazer in your bag until the interview so you stay comfortable in the heat.</span></li>
                  </ul>
                  <div className="assumptions"><span className="assumptions-label">ASSUMPTIONS</span><p className="assumption">The workshop includes sanding and the interview calls for a polished look.</p></div>
                </>
              ) : planType === 'class' ? (
                <>
                  <div className="outfit-summary"><span className="mini-label">THE OUTFIT</span><p>Jeans or chinos, a light top, and comfortable shoes for a full day of class and library time.</p></div>
                  <div className="calm-note">No conflict was flagged for this schedule.</div>
                  <ul className="action-list">
                    <li><b>Bring</b><span>A water bottle for your class-to-library stretch.</span></li>
                    <li><b>Swap</b><span>No outfit change needed for the events you listed.</span></li>
                    <li><b>Layer</b><span>Bring a light layer for cool classrooms or library spaces.</span></li>
                  </ul>
                  <div className="assumptions"><span className="assumptions-label">ASSUMPTIONS</span><p className="assumption">Class and library time are casual, indoor activities.</p></div>
                </>
              ) : planType === 'vague' ? (
                <>
                  <div className="outfit-summary"><span className="mini-label">THE OUTFIT</span><p>Start with a comfortable business-casual base and layer for a 42°F morning warming to 70°F in the afternoon.</p></div>
                  <div className="confidence-line"><span>MEETING</span><strong>Low confidence</strong></div>
                  <ul className="action-list">
                    <li><b>Bring</b><span>Carry a light jacket or cardigan for the cool morning.</span></li>
                    <li><b>Swap</b><span>No change is needed unless the meeting has a specific dress code.</span></li>
                    <li><b>Layer</b><span>Wear a light jacket or cardigan you can remove as the day warms up.</span></li>
                  </ul>
                  <div className="assumptions"><span className="assumptions-label">ASSUMPTIONS</span><p className="assumption">I assumed business casual since 'meeting' gives no detail. Edit if wrong.</p></div>
                </>
              ) : (
                <>
                  <div className="outfit-summary"><span className="mini-label">THE OUTFIT</span><p>Neutral business-casual layers with long pants: a versatile base that can work across a professional day.</p></div>
                  <div className="confidence-line"><span>GENERAL PLAN</span><strong>Low confidence</strong></div>
                  <ul className="action-list">
                    <li><b>Bring</b><span>Keep a light layer handy in case you move between indoor and outdoor spaces.</span></li>
                    <li><b>Swap</b><span>No specific change is indicated by the events you listed.</span></li>
                    <li><b>Layer</b><span>Use a removable layer to adjust to the setting and temperature.</span></li>
                  </ul>
                  <div className="assumptions"><span className="assumptions-label">ASSUMPTIONS</span><p className="assumption">I couldn't tell what these events require, so I assumed a general professional setting.</p></div>
                </>
              )}
              <div className="safety-note">Posted safety requirements for any workshop or lab override these suggestions.</div>
            </div>
            <div className="plan-controls">
              {!editing && <button className="accept-button" onClick={() => { setAccepted(true); setRejecting(false); }}>Accept</button>}
              {!editing && <button className="quiet-button" onClick={() => { setEditing(true); setAccepted(false); }}>Edit</button>}
              {editing && <button className="accept-button" onClick={() => setEditing(false)}>Save</button>}
              {!editing && <button className="quiet-button reject-button" onClick={() => { setRejecting((v) => !v); setAccepted(false); }}>Reject</button>}
              {accepted && <span className="accepted-message" role="status">Plan accepted.</span>}
            </div>
            {rejecting && <div className="reject-panel">
              <label htmlFor="feedback">What should be different?</label>
              <textarea id="feedback" className="text-input feedback-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              <button className="quiet-button retry-button" onClick={() => setRegenerated(true)}>Try a different approach</button>
              {regenerated && <p className="simulation-message" role="status">In the full product, the AI would regenerate the plan. (Simulated in this prototype.)</p>}
            </div>}
          </section>
        )}
      </div>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
