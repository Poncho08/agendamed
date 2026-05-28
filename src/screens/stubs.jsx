/* eslint-disable */
// All screens are now implemented. This file kept for the Stub component
// in case any future placeholder is needed.

function Stub({ title, hint, cta, onCta }) {
  return (
    <div className="stub">
      <div className="stub__inner">
        <Icons.FileText size={28} className="stub__icon"/>
        <h2 className="stub__title">{title}</h2>
        <p className="stub__msg">{hint || "Pantalla en construcción."}</p>
        {cta && <Button onClick={onCta}>{cta}</Button>}
      </div>
    </div>
  );
}

Object.assign(window, { Stub });
