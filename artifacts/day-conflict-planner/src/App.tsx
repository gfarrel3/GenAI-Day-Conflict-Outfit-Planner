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

type Forecast = {
  high: number | null;
  low: number | null;
  rain: number | null;
  detail: string;
};

const SOUTH_BEND_COORDINATES = { latitude: 41.68, longitude: -86.25 };

function Home() {
  const [city, setCity] = useState('South Bend, IN');
  const [events, setEvents] = useState('');
  const [preferences, setPreferences] = useState('');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');
  const [inputSource, setInputSource] = useState<'live' | 'sample'>('live');
  const [sampleWeather, setSampleWeather] = useState<Forecast | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [planType, setPlanType] = useState<'class' | 'clash' | 'vague' | 'generic' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [feedback, setFeedback] = useState('');

  const examples = [
    {
      id: 'class',
      label: 'Class-only day',
      events: 'Class 10-11:15, Library 1-3',
      weather: { high: 68, low: null, rain: 0, detail: '68°F · Mild · No rain' },
    },
    {
      id: 'clash',
      label: 'Clash day',
      events: 'Workshop 10-12, Lenovo interview 2:00, career fair 4:30',
      weather: { high: 91, low: null, rain: 0, detail: '91°F · Hot · No rain' },
    },
    {
      id: 'vague',
      label: 'Weather swing + vague event',
      events: 'Class 9-10, meeting 1:00',
      weather: { high: 70, low: 42, rain: null, detail: '42°F morning · 70°F afternoon' },
    },
  ];

  function loadExample(value: string) {
    const example = examples.find((item) => item.id === value);
    if (!example) {
      setSelectedExample('');
      setInputSource('live');
      setSampleWeather(null);
      setForecast(null);
      setPlanType(null);
      setEvents('');
      setError('');
      return;
    }
    setCity('South Bend, IN');
    setEvents(example.events);
    setSelectedExample(example.id);
    setInputSource('sample');
    setSampleWeather(example.weather);
    setForecast(null);
    setForecastLoading(false);
    setError('');
    setPlanType(null);
    setNotice(false);
    setAccepted(false);
    setRejecting(false);
  }

  async function fetchForecast(latitude: number, longitude: number) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      temperature_unit: 'fahrenheit',
      timezone: 'auto',
      forecast_days: '2',
    }).toString();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      if (!response.ok) throw new Error('Forecast request failed');
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object' || !('daily' in payload)) {
        throw new Error('Forecast data unavailable');
      }
      const daily = (payload as { daily?: Record<string, unknown> }).daily;
      const highs = daily?.temperature_2m_max;
      const lows = daily?.temperature_2m_min;
      const rains = daily?.precipitation_probability_max;
      const isNumber = (value: unknown): value is number =>
        typeof value === 'number' && Number.isFinite(value);
      if (
        !Array.isArray(highs) || !Array.isArray(lows) || !Array.isArray(rains) ||
        !isNumber(highs[1]) || !isNumber(lows[1]) || !isNumber(rains[1])
      ) {
        throw new Error('Forecast data unavailable');
      }
      setForecast({ high: highs[1], low: lows[1], rain: rains[1], detail: '' });
    } catch {
      setForecast(null);
    } finally {
      window.clearTimeout(timeout);
      setForecastLoading(false);
    }
  }

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
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
    setForecast(null);
    if (inputSource === 'sample') {
      setForecast(sampleWeather);
      setForecastLoading(false);
    } else {
      setForecastLoading(true);
      await fetchForecast(SOUTH_BEND_COORDINATES.latitude, SOUTH_BEND_COORDINATES.longitude);
    }
  }

  const planTitle = planType === 'clash' ? 'A day with a quick change' : planType === 'class' ? 'A comfortable class day' : planType === 'vague' ? 'A flexible day, with one question mark' : 'A dependable everyday plan';
  const activeWeather = inputSource === 'sample' ? sampleWeather : forecast;
  const weatherLabel = inputSource === 'sample' ? 'Sample weather for this example.' : 'Live forecast';
  const weatherLines = activeWeather
    ? [
        activeWeather.high !== null ? `High ${activeWeather.high}°F` : 'High: Not specified',
        activeWeather.low !== null ? `Low ${activeWeather.low}°F` : 'Low: Not specified',
        activeWeather.rain !== null ? `Rain chance ${activeWeather.rain}%` : 'Rain chance: Not specified',
      ]
    : [];
  const recommendations = activeWeather
    ? [
        activeWeather.high !== null && activeWeather.high > 85 ? 'Choose breathable fabrics' : null,
        activeWeather.low !== null && activeWeather.low < 50 ? 'Bring a layer for the morning' : null,
        activeWeather.rain !== null && activeWeather.rain > 40 ? 'Bring a rain jacket or umbrella.' : null,
      ].filter((line): line is string => line !== null)
    : [];

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
            <label className="field-label" htmlFor="city">City</label>
            <input id="city" className="text-input" value={city} onChange={(e) => setCity(e.target.value)} />
            <label className="field-label events-label" htmlFor="events">Paste tomorrow's events with times</label>
            <textarea
              id="events"
              className="text-input event-input"
              placeholder="Workshop 10-12, Lenovo interview 2:00, career fair 4:30"
              value={events}
              onChange={(e) => {
                setEvents(e.target.value);
                setInputSource('live');
                setSelectedExample('');
              }}
            />
            <p className="sync-note">Calendar and app sync coming soon. For now, paste your events.</p>
            {error && <p className="error-message" role="alert">{error}</p>}
            <div className="examples">
              <label className="examples-label" htmlFor="example-select">Try an example</label>
              <select
                id="example-select"
                className="example-select"
                value={selectedExample}
                onChange={(e) => loadExample(e.target.value)}
              >
                <option value="">Choose an example</option>
                {examples.map((example) => <option key={example.id} value={example.id}>{example.label}</option>)}
              </select>
            </div>
            <button
              className="preferences-toggle"
              type="button"
              aria-expanded={preferencesOpen}
              aria-controls="preferences-panel"
              onClick={() => setPreferencesOpen((open) => !open)}
            >
              Add preferences (optional)
            </button>
            {preferencesOpen && (
              <div id="preferences-panel" className="preferences-panel">
                <label className="field-label" htmlFor="preferences">Preferences</label>
                <input
                  id="preferences"
                  className="text-input"
                  placeholder="e.g., I run hot, no heels, need closed-toe shoes"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
              </div>
            )}
            <button className="submit-button" type="submit">Generate my outfit plan <span aria-hidden="true">→</span></button>
          </form>
        </section>

        {planType && (
          <section className="forecast-card" aria-label="Tomorrow's forecast">
            <div className="forecast-heading">
              <div><p className="plan-kicker">WEATHER CHECK</p><h2>Tomorrow's forecast</h2></div>
              {forecastLoading
                ? <span className="forecast-status">Checking forecast…</span>
                : activeWeather && <span className="forecast-status">{weatherLabel}</span>}
            </div>
            {forecastLoading ? (
              <p className="forecast-loading">Loading tomorrow's weather…</p>
            ) : activeWeather ? (
              <>
                <div className="forecast-values">
                  {inputSource === 'sample' && activeWeather.detail && <span>{activeWeather.detail}</span>}
                  {weatherLines.map((line) => <span key={line}>{line}</span>)}
                </div>
                {recommendations.length > 0 && <ul className="forecast-recommendations">{recommendations.map((line) => <li key={line}>{line}</li>)}</ul>}
              </>
            ) : (
              <p className="forecast-unavailable">Forecast unavailable</p>
            )}
          </section>
        )}

        {planType && (
          <section className="plan-card" aria-label="Your outfit plan">
            <div className="plan-topline">
              <div><p className="plan-kicker">YOUR PLAN FOR TOMORROW</p><h2>{planTitle}</h2></div>
              <div className="weather-pill"><span className="weather-dot" />{inputSource === 'sample' ? sampleWeather?.detail : forecast ? `${forecast.high}°F high · ${forecast.low}°F low` : forecastLoading ? 'Forecast loading' : 'Forecast unavailable'}</div>
            </div>
            {notice && <div className="notice" role="status">This prototype only has prewritten plans for a few example days. Try one of the example buttons.</div>}
            <div className={`plan-content ${editing ? 'is-editing' : ''}`} contentEditable={editing} suppressContentEditableWarning>
              {planType === 'clash' ? (
                <>
                  <div className="outfit-summary"><span className="mini-label">BOTTOMS</span><p>Lightweight professional long pants—dark chinos or tailored lightweight trousers—that can get dirty and meet shop requirements. Shop rules call for long pants, but heavy pants are miserable in the heat. The same pants work all day, so no change is needed.</p></div>
                  <div className="outfit-summary"><span className="mini-label">TOP</span><p>A nice professional top, such as a blouse or button-up. The interview is on Zoom, so only the top half is on camera.</p></div>
                  <div className="outfit-summary"><span className="mini-label">SHOES</span><p>Closed-toe, comfortable, and clean enough to pass as professional.</p></div>
                  <div className="conflict-flag"><span>CONFLICT TO PLAN AROUND</span><strong>Shop safety and heat vs. interview polish. One pair of pants and a protected top mean no full outfit change.</strong></div>
                  <p className="plan-detail">Weather is hot, so choose light fabrics.</p>
                  <ul className="action-list">
                    <li><b>Bring</b><span>Bring a throwaway t-shirt to wear over the nice top while sanding to protect it; take it off before the Zoom interview.</span></li>
                    <li><b>Swap</b><span>No full outfit change is needed. Keep the same pants on all day and remove the throwaway t-shirt before the interview.</span></li>
                    <li><b>Layer</b><span>Use light fabrics underneath the protective t-shirt to stay more comfortable in the heat.</span></li>
                  </ul>
                  <div className="assumptions"><span className="assumptions-label">ASSUMPTIONS</span><p className="assumption">The shop requires long pants and the Zoom interview calls for a professional top.</p></div>
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
              {preferences.trim() && (
                <div className="preferences-note">
                  <strong>Your preferences (noted)</strong>
                  <p>{preferences.trim()}</p>
                  <small>In the full product, the AI would factor this into the plan. (Simulated in this prototype.)</small>
                </div>
              )}
              <div className="safety-note">{planType === 'clash' ? 'Posted shop safety requirements override these suggestions.' : 'Posted safety requirements for any workshop or lab override these suggestions.'}</div>
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
