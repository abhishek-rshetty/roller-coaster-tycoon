import { rideCatalog } from "../data/rides";
import { formatMoney, formatNumber } from "../utils/format";

type RideCatalogProps = {
  availableCash: number;
  availableArea: number;
  onBuild: (rideId: string) => void;
};

const statHelp: Record<string, string> = {
  Area: "How much park area this ride uses.",
  Maintenance: "Monthly operating cost for keeping this ride running.",
  Capacity: "Estimated maximum visitors this ride can help serve each month.",
  "Family Appeal": "How strongly this ride attracts family-focused visitors.",
  "Thrill Appeal": "How strongly this ride attracts thrill-seeking visitors.",
  "Tourist Appeal": "How strongly this ride attracts tourist-heavy demand."
};

function HelpLabel({ label }: { label: keyof typeof statHelp }) {
  return (
    <span className="help-label" title={statHelp[label]}>
      {label}
      <span className="help-badge">i</span>
    </span>
  );
}

export function RideCatalog({ availableCash, availableArea, onBuild }: RideCatalogProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Expansion</p>
          <h2>Ride Catalogue</h2>
        </div>
      </div>

      <div className="card-grid">
        {rideCatalog.map((ride) => {
          const insufficientCash = availableCash < ride.buildCost;
          const insufficientArea = availableArea < ride.areaRequired;

          return (
            <article className="ride-card" key={ride.id}>
              <div className="ride-card__header">
                <h3>{ride.name}</h3>
                <span className="chip">{ride.category}</span>
              </div>
              <dl>
                <div>
                  <dt>Build Cost</dt>
                  <dd>{formatMoney(ride.buildCost)}</dd>
                </div>
                <div>
                  <dt>
                    <HelpLabel label="Area" />
                  </dt>
                  <dd>{ride.areaRequired}</dd>
                </div>
                <div>
                  <dt>
                    <HelpLabel label="Maintenance" />
                  </dt>
                  <dd>{formatMoney(ride.monthlyMaintenance)}</dd>
                </div>
                <div>
                  <dt>
                    <HelpLabel label="Capacity" />
                  </dt>
                  <dd>{formatNumber(ride.monthlyCapacity)}</dd>
                </div>
                <div>
                  <dt>
                    <HelpLabel label="Family Appeal" />
                  </dt>
                  <dd>{ride.familyAppeal} / 5</dd>
                </div>
                <div>
                  <dt>
                    <HelpLabel label="Thrill Appeal" />
                  </dt>
                  <dd>{ride.thrillAppeal} / 5</dd>
                </div>
                <div>
                  <dt>
                    <HelpLabel label="Tourist Appeal" />
                  </dt>
                  <dd>{ride.touristAppeal} / 5</dd>
                </div>
              </dl>
              <button
                className="button button--secondary"
                disabled={insufficientCash || insufficientArea}
                onClick={() => onBuild(ride.id)}
              >
                {insufficientCash ? "Need more cash" : insufficientArea ? "Need more area" : "Plan Build"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
