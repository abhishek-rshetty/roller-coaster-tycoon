import { locations } from "../data/locations";

type LocationSelectProps = {
  onBack: () => void;
  onSelect: (locationId: string) => void;
};

export function LocationSelect({ onBack, onSelect }: LocationSelectProps) {
  return (
    <section className="shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Choose Your Market</p>
          <h1>Select a starting location</h1>
        </div>
        <button className="button button--ghost" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="card-grid">
        {locations.map((location) => (
          <article className="panel location-card" key={location.id}>
            <h2>{location.name}</h2>
            <p>{location.description}</p>
            <dl className="rating-list">
              <div>
                <dt>Competition</dt>
                <dd>{location.visibleRatings.competition} / 5</dd>
              </div>
              <div>
                <dt>Visitor Spending</dt>
                <dd>{location.visibleRatings.visitorSpending} / 5</dd>
              </div>
              <div>
                <dt>Tourism</dt>
                <dd>{location.visibleRatings.tourism} / 5</dd>
              </div>
            </dl>
            <button className="button button--primary" onClick={() => onSelect(location.id)}>
              Start in {location.name}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
