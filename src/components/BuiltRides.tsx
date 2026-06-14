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
          <h2>Active Rides</h2>
        </div>
      </div>

      {rides.length === 0 ? (
        <p className="empty-state">No active rides yet. Planned rides become active after you run the next month.</p>
      ) : (
        <div className="table-like">
          <div className="table-like__head">
            <span>Ride</span>
            <span>Category</span>
            <span>Area</span>
            <span>Maintenance</span>
            <span>Capacity</span>
          </div>
          {rides.map((ride) => (
            <div className="table-like__row" key={ride.instanceId}>
              <span>{ride.name}</span>
              <span>{ride.category}</span>
              <span>{ride.areaRequired}</span>
              <span>{formatMoney(ride.monthlyMaintenance)}</span>
              <span>{formatNumber(ride.monthlyCapacity)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
