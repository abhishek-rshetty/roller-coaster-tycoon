import type { BuiltRide } from "../game/types";
import { formatMoney, formatNumber } from "../utils/format";

type BuiltRidesProps = {
  rides: BuiltRide[];
};

export function BuiltRides({ rides }: BuiltRidesProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h2>Built Rides</h2>
        </div>
      </div>

      {rides.length === 0 ? (
        <p className="empty-state">No rides yet. Build your first attraction to start drawing visitors.</p>
      ) : (
        <div className="table-like">
          <div className="table-like__head">
            <span>Ride</span>
            <span>Category</span>
            <span>Footprint</span>
            <span>Maintenance</span>
            <span>Capacity</span>
          </div>
          {rides.map((ride) => (
            <div className="table-like__row" key={ride.instanceId}>
              <span>{ride.name}</span>
              <span>{ride.category}</span>
              <span>{ride.footprint}</span>
              <span>{formatMoney(ride.monthlyMaintenance)}</span>
              <span>{formatNumber(ride.monthlyCapacity)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
