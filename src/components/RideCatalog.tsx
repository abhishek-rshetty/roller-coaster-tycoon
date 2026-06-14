import { rideCatalog } from "../data/rides";
import { formatMoney, formatNumber } from "../utils/format";

type RideCatalogProps = {
  cash: number;
  landRemaining: number;
  onBuild: (rideId: string) => void;
};

export function RideCatalog({ cash, landRemaining, onBuild }: RideCatalogProps) {
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
          const insufficientCash = cash < ride.buildCost;
          const insufficientLand = landRemaining < ride.footprint;

          return (
            <article className="ride-card" key={ride.id}>
              <div className="ride-card__header">
                <h3>{ride.name}</h3>
                <span className="chip">{ride.category}</span>
              </div>
              <dl>
                <div>
                  <dt>Build cost</dt>
                  <dd>{formatMoney(ride.buildCost)}</dd>
                </div>
                <div>
                  <dt>Footprint</dt>
                  <dd>{ride.footprint}</dd>
                </div>
                <div>
                  <dt>Maintenance</dt>
                  <dd>{formatMoney(ride.monthlyMaintenance)}</dd>
                </div>
                <div>
                  <dt>Capacity</dt>
                  <dd>{formatNumber(ride.monthlyCapacity)}</dd>
                </div>
                <div>
                  <dt>Family</dt>
                  <dd>{ride.familyAppeal}</dd>
                </div>
                <div>
                  <dt>Thrill</dt>
                  <dd>{ride.thrillAppeal}</dd>
                </div>
                <div>
                  <dt>Tourist</dt>
                  <dd>{ride.touristAppeal}</dd>
                </div>
              </dl>
              <button
                className="button button--secondary"
                disabled={insufficientCash || insufficientLand}
                onClick={() => onBuild(ride.id)}
              >
                {insufficientCash ? "Need more cash" : insufficientLand ? "Need more land" : "Build"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
