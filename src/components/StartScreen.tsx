type StartScreenProps = {
  hasResume: boolean;
  onNewGame: () => void;
  onResume: () => void;
};

export function StartScreen({ hasResume, onNewGame, onResume }: StartScreenProps) {
  return (
    <section className="shell shell--center">
      <div className="hero-card">
        <p className="eyebrow">Browser Strategy MVP</p>
        <h1>Browser Tycoon</h1>
        <p className="lede">
          Build a profitable amusement park by matching your rides to the market while managing
          land, pricing, cash, and debt.
        </p>
        <div className="hero-actions">
          <button className="button button--primary" onClick={onNewGame}>
            New Game
          </button>
          {hasResume ? (
            <button className="button button--secondary" onClick={onResume}>
              Resume Game
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
