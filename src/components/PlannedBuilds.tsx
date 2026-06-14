import type { PlannedRide } from "../game/types";
import { formatMoney } from "../utils/format";

type PlannedBuildsProps = {
  plannedRides: PlannedRide[];
  onCancel: (planId: string) => void;
};

export function PlannedBuilds({ plannedRides, onCancel }: PlannedBuildsProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Before Month End</p>
          <h2>Planned Builds</h2>
        </div>
      </div>

      {plannedRides.length === 0 ? (
        <p className="empty-state">No rides are queued. Planned rides can be canceled until you run the next month.</p>
      ) : (
        <div className="table-like">
          <div className="table-like__head planned-head">
            <span>Ride</span>
            <span>Category</span>
            <span>Area</span>
            <span>Build Cost</span>
            <span>Action</span>
          </div>
          {plannedRides.map((ride) => (
            <div className="table-like__row planned-row" key={ride.planId}>
              <span>{ride.name}</span>
              <span>{ride.category}</span>
              <span>{ride.areaRequired}</span>
              <span>{formatMoney(ride.buildCost)}</span>
              <span>
                <button className="button button--ghost button--compact" onClick={() => onCancel(ride.planId)}>
                  Cancel
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
