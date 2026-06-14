import { rideCatalog } from "../data/rides";
import { formatMoney, formatNumber } from "../utils/format";
import { InfoTip } from "./InfoTip";

type RideCatalogProps = {
  availableCash: number;
  availableArea: number;
  plannedRideCounts: Record<string, number>;
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

export function RideCatalog({ availableCash, availableArea, plannedRideCounts, onBuild }: RideCatalogProps) {
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
          const queuedCount = plannedRideCounts[ride.id] ?? 0;

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
                    <InfoTip label="Area" text={statHelp.Area} />
                  </dt>
                  <dd>{ride.areaRequired}</dd>
                </div>
                <div>
                  <dt>
                    <InfoTip label="Maintenance" text={statHelp.Maintenance} />
                  </dt>
                  <dd>{formatMoney(ride.monthlyMaintenance)}</dd>
                </div>
                <div>
                  <dt>
                    <InfoTip label="Capacity" text={statHelp.Capacity} />
                  </dt>
                  <dd>{formatNumber(ride.monthlyCapacity)}</dd>
                </div>
                <div>
                  <dt>
                    <InfoTip label="Family Appeal" text={statHelp["Family Appeal"]} />
                  </dt>
                  <dd>{ride.familyAppeal} / 5</dd>
                </div>
                <div>
                  <dt>
                    <InfoTip label="Thrill Appeal" text={statHelp["Thrill Appeal"]} />
                  </dt>
                  <dd>{ride.thrillAppeal} / 5</dd>
                </div>
                <div>
                  <dt>
                    <InfoTip label="Tourist Appeal" text={statHelp["Tourist Appeal"]} />
                  </dt>
                  <dd>{ride.touristAppeal} / 5</dd>
                </div>
              </dl>
              {queuedCount > 0 ? <p className="ride-queued-note">Queued for next month: {queuedCount}</p> : null}
              <button
                className="button button--secondary"
                disabled={insufficientCash || insufficientArea}
                onClick={() => onBuild(ride.id)}
              >
                {insufficientCash
                  ? "Need more cash"
                  : insufficientArea
                    ? "Need more area"
                    : queuedCount > 0
                      ? "Queue Another"
                      : "Plan Build"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
