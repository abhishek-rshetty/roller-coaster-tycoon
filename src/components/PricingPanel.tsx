import { ALLOWED_TICKET_PRICES } from "../game/constants";

type PricingPanelProps = {
  ticketPrice: number;
  onSetTicketPrice: (price: number) => void;
};

export function PricingPanel({ ticketPrice, onSetTicketPrice }: PricingPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Pricing</p>
          <h2>Ticket Price</h2>
        </div>
        <strong className="big-number">₹{ticketPrice}</strong>
      </div>

      <div className="button-row">
        {ALLOWED_TICKET_PRICES.map((price) => (
          <button
            className={`button ${price === ticketPrice ? "button--primary" : "button--secondary"}`}
            key={price}
            onClick={() => onSetTicketPrice(price)}
          >
            ₹{price}
          </button>
        ))}
      </div>
    </section>
  );
}
