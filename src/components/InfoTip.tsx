type InfoTipProps = {
  label: string;
  text: string;
};

export function InfoTip({ label, text }: InfoTipProps) {
  return (
    <span className="info-tip">
      <span>{label}</span>
      <button className="help-badge help-badge--button" type="button" aria-label={`${label} help`}>
        i
      </button>
      <span className="info-tip__content" role="tooltip">
        {text}
      </span>
    </span>
  );
}
