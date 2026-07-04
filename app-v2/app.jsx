// AEGIS DI — main app shell, routing, tweaks integration.

const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "classification": "secret",
  "role": "margaux",
  "aiOn": true,
  "ddil": "online",
  "density": "calm",
  "theme": "hybrid"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useStateApp("geo");
  const [focusId, setFocusId] = useStateApp(null);
  const [ask, setAsk] = useStateApp(false);

  const data = window.AEGIS_DATA;
  const role = data.roles[t.role] || data.roles.margaux;

  // Keyboard shortcut: ⌘K / Ctrl+K for ask
  useEffectApp(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAsk(true);
      }
      if (e.key === "Escape") setAsk(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // When role changes, jump to that role's home screen
  useEffectApp(() => {
    if (t.role === "devon") setScreen("coverage");
    else if (t.role === "marcus") setScreen("executive");
    // margaux keeps current
  }, [t.role]);

  const tweaks = {
    classification: t.classification,
    role,
    aiOn: t.aiOn,
    ddil: t.ddil,
    density: t.density,
    theme: t.theme
  };

  const nav = (id, payload) => {
    setScreen(id);
    if (payload) setFocusId(payload);
  };

  const renderScreen = () => {
    switch (screen) {
      case "geo":
        return <ScreenGeo data={data} tweaks={tweaks} onOpenTriage={(id) => nav("triage", id)}/>;
      case "triage":
        return <ScreenTriage data={data} tweaks={tweaks} focusId={focusId}
          onOpenEntity={(id) => nav("entity", id)} onNav={nav}/>;
      case "entity":
        return <ScreenEntity data={data} tweaks={tweaks} focusId={focusId} onNav={nav}/>;
      case "assessment":
        return <ScreenAssessment data={data} tweaks={tweaks} onNav={nav}/>;
      case "coverage":
        return <ScreenCoverage data={data} tweaks={tweaks} onNav={nav}/>;
      case "ddil":
        return <ScreenDDIL data={data} tweaks={tweaks}/>;
      case "executive":
        return <ScreenExecutive data={data} tweaks={tweaks} onNav={nav} onAsk={() => setAsk(true)}/>;
      case "release":
        return <ScreenRelease data={data} tweaks={tweaks}/>;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell" data-theme={t.theme}>
      <ClassificationBanner level={t.classification}/>

      <div className="app-body">
        <Sidebar active={screen} onNav={(id) => nav(id, null)} role={role}/>
        <div className="main">
          {/* Global command bar above the per-screen toolbar */}
          <div className="cmd-bar">
            <button className="cmd-search" onClick={() => setAsk(true)}>
              <Icon d={ICONS.search} size={13}/>
              <span>Search or ask AEGIS…</span>
              <span className="cmd-key">⌘K</span>
            </button>
            <div className="cmd-actions">
              <button className="btn btn-ghost btn-sm">
                <Icon d={ICONS.brain} size={13} style={{ color: t.aiOn ? "var(--accent-violet)" : "var(--chrome-muted)" }}/>
                AI {t.aiOn ? "on" : "off"}
              </button>
              <button
                className="theme-toggle"
                onClick={() => setTweak("theme", t.theme === "dark" ? "hybrid" : "dark")}
                title={t.theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
              >
                {t.theme === "dark" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
                {t.theme === "dark" ? "Day" : "Night"}
              </button>
              <button className="btn btn-ghost btn-sm" aria-label="Settings">
                <Icon d={ICONS.cog} size={13}/>
              </button>
            </div>
          </div>
          <div className="main-inner">
            {renderScreen()}
          </div>
        </div>
      </div>

      <StatusBar
        ddilState={t.ddil}
        classification={t.classification}
        online={t.ddil !== "disconnected"}
        lastSync={t.ddil === "online" ? "14:32:11Z" : t.ddil === "degraded" ? "14:18:02Z" : "22 MAY 1648Z"}
      />

      <ClassificationBanner level={t.classification}/>

      <AskAegis open={ask} onClose={() => setAsk(false)}/>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Classification">
          <TweakRadio value={t.classification} onChange={v => setTweak("classification", v)}
            options={[
              { value: "unclass", label: "UNCLASS" },
              { value: "protb", label: "PROT-B" },
              { value: "secret", label: "SECRET" },
              { value: "ts", label: "TOP SECRET" }
            ]}/>
          <div className="tw-help">
            Changes banner colour + classification chips throughout. In a real deployment data at higher levels is architecturally blocked from lower workspaces.
          </div>
        </TweakSection>

        <TweakSection title="Operator role">
          <TweakRadio value={t.role} onChange={v => setTweak("role", v)}
            options={[
              { value: "margaux", label: "Margaux" },
              { value: "devon", label: "Devon" },
              { value: "marcus", label: "Marcus" }
            ]}/>
          <div className="tw-help">
            Margaux (analyst), Devon (supervisor), Marcus (director). Switching jumps to each role's home view.
          </div>
        </TweakSection>

        <TweakSection title="Connectivity (DDIL)">
          <TweakRadio value={t.ddil} onChange={v => setTweak("ddil", v)}
            options={[
              { value: "online", label: "Online" },
              { value: "degraded", label: "Degraded" },
              { value: "disconnected", label: "Off-link" }
            ]}/>
          <div className="tw-help">
            Drives the status bar light and the DDIL screen. In real use, sync auto-resumes when link is restored.
          </div>
        </TweakSection>

        <TweakToggle label="AI assist" value={t.aiOn} onChange={v => setTweak("aiOn", v)}/>
        <div className="tw-help" style={{ marginTop: -8, marginBottom: 12 }}>
          When off, AI proposals and reasoning traces are suppressed (per operator preference or policy).
        </div>

        <TweakSection title="Display theme">
          <TweakRadio value={t.theme} onChange={v => setTweak("theme", v)}
            options={[
              { value: "hybrid", label: "Day (hybrid)" },
              { value: "dark", label: "Night (full dark)" }
            ]}/>
          <div className="tw-help">
            Day: light chrome + dark map panels. Night: full tactical dark — every surface.
          </div>
        </TweakSection>

        <TweakSection title="Density">
          <TweakRadio value={t.density} onChange={v => setTweak("density", v)}
            options={[
              { value: "calm", label: "Calm" },
              { value: "dense", label: "Bloomberg" }
            ]}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
