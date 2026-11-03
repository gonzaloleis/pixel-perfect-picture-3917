        <DrawPath d={pay} active={chartOn && p >= 1} className="stroke-mint [stroke-width:3px]" duration={1.2} />
        {chartOn && (
          <g style={revealStyle(1.1)}>
            <text x={PR + 16} y={y(pre[pre.length - 1]?.value ?? 0) + 24} className="k-label fill-mint" style={{ fontSize: 18 }}>
              {s7.lineLabels.payments}
            </text>
          </g>
        )}
        {chartOn && p >= 1 && (
          <text x={PR + 16} y={y(s7.bcws[n - 1]?.[1] ?? 0) - 10} className="k-label fill-ink" style={{ fontSize: 18 }}>
            {s7.lineLabels.bcws}
          </text>
        )}
        {drawing && <circle cx={tipX} cy={tipY} r={7} className="fill-blue" />}
      </svg>

      {/* Payment labels on small white pills, on the free side of each step */}
      {chartOn &&
        s7.payments.map((pm, idx) => {
          const x = xm(pm.month);
          const yy = y(pm.value);
          const last = idx === s7.payments.length - 1;
          let pos: CSSProperties;
          if (last) {
            pos = { right: 1920 - (x - 14), top: yy + 30 };
          } else if (y(0) - yy >= 60) {
            pos = { left: x + 14, top: yy + 14 };
          } else {
            const from = months.indexOf(pm.month);
            const j = s7.bcws.findIndex(([, v], k) => k > from && y(v) <= yy - 70);
            pos = { left: xi(Math.max(j, from + 1)) + 8, top: yy - 48 };
          }
          return (
            <div
              key={pm.label}
              className="k-label pointer-events-none absolute rounded-[10px] bg-surface px-3 py-[6px] whitespace-nowrap text-mint shadow-[var(--shadow-card)]"
              style={{ ...pos, fontSize: 18, ...revealStyle(1.1) }}
            >
              {pm.label}
            </div>
          );
        })}
      {chartOn && (
        <div
          className="k-label pointer-events-none absolute rounded-[10px] bg-surface px-3 py-[6px] text-right whitespace-nowrap text-amber shadow-[var(--shadow-card)]"
          style={{ right: 1920 - (preNextX - 14), top: preY - 28, fontSize: 18, lineHeight: 1.25, ...revealStyle(1.4) }}
        >
          <div>{preA}</div>
          <div>{preB}</div>
        </div>
      )}

      {drawing && (
        <div className="k-card k-pill k-label pointer-events-none absolute text-ink" style={{ left: tipX, top: tipY - 64, transform: "translateX(-50%)" }}>
          <span className="text-blue">{tipMonth}</span>
          <span>
            {formatEs(Math.round(tipV))}
            {"\u00A0"}k€
          </span>
        </div>
      )}

      <Build at={3} step={step} className="absolute top-[40px] right-[140px]">
        <Capture slot={s7.capture} width={480} />
      </Build>
    </>
  );
}
