// The full screen sheet, over the page (appended to the document body)
export const VM_FULL_STYLE = `
.sheet { position: absolute; inset: 0; display: flex; flex-direction: column; box-sizing: border-box;
  padding: max(10px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  color: var(--primary-text-color); font-family: var(--paper-font-body1_-_font-family, inherit);
  background: linear-gradient(var(--card-background-color, #fff), var(--card-background-color, #fff)), var(--primary-background-color, #fafafa);
  animation: vm-sheet .28s cubic-bezier(.2,.8,.2,1) both; }
.sheet .head { max-width: 1800px; width: 100%; margin: 0 auto 8px; }
.stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.stage vacuum-map-card { width: 100%; }
@keyframes vm-sheet { from { opacity: 0; transform: translateY(16px); } }
@media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }
`;

export const VM_STYLE = `
:host { display: block; }
ha-card { padding: 16px; overflow: hidden; container-type: inline-size; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.badge { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  flex: none; background: color-mix(in srgb, var(--vm-tone) 18%, transparent); color: var(--vm-tone); }
.badge ha-icon { --mdc-icon-size: 22px; }
.titles { flex: 1; min-width: 0; }
.title { font-size: 16px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pill { flex: none; font-size: 12px; padding: 3px 10px; border-radius: 999px; color: var(--vm-tone);
  background: color-mix(in srgb, var(--vm-tone) 14%, transparent); }
/* The classic header's status pill: a dot and the state, in the state's colour. */
.chip.flat { --c: var(--vm-tone); display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px;
  font-weight: 500; line-height: 16px; white-space: nowrap; overflow: hidden; box-sizing: border-box;
  background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color)); }
.chip.flat .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }
.chip.flat .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  /* The status pill, in every header: on the title row right after the title only when the whole title and the pill's
     whole label fit there; otherwise on its own line under the subtitle, cut to one line; its dot alone, beside the
     title, when the banner has no room left above its ground strip, or on a card of 200 px or less. Decided by
     measurement (see _fitPill), so that every language and every width gets it right. */
  .titles .trow { display: flex; align-items: center; gap: 8px; min-width: 0; width: 100%; }
  .titles .trow > .title { flex: 0 1 auto; min-width: 0; }
  .titles .trow > .chip { flex: none; max-width: none; margin: 0; align-self: center; }
  .titles.below { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
  .titles.below > * { max-width: 100%; }
  .titles.below .trow { display: contents; }
  .titles.below .trow > .title { max-width: 100%; }
  .titles.below .trow > .chip { order: 9; max-width: 100%; margin-top: 2px; align-self: flex-start; }
  /* In the banner, a pill on its own line may run over the picture, up to the banner's edge. */
  .banner .titles.below .trow > .chip { max-width: none; }
  .titles.below :is(.sub) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .titles.dotonly .trow > .chip { padding: 4px; } .titles.dotonly .trow > .chip .chip-text { display: none; }
  @container (max-width: 200px) { .titles .trow > .chip { padding: 4px; } .titles .trow > .chip .chip-text { display: none; } }
.map { position: relative; width: 100%; margin: 0 auto; }
.map > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.labels { position: absolute; inset: 0; pointer-events: none; }
.label { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 4px;
  font-size: 11px; line-height: 1; white-space: nowrap; padding: 2px 7px 2px 2px; border-radius: 999px;
  color: var(--primary-text-color); background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 78%, transparent); }
.label .ic { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #12151b; }
.label .ic ha-icon { --mdc-icon-size: 12px; }
.label.dim { opacity: 0.75; }
.label .name { overflow: hidden; text-overflow: ellipsis; max-width: var(--vm-name-width, none); }
.label.compact { padding: 2px; }
.label.compact .name { display: none; }
.dock { position: absolute; transform: translate(-50%, -50%); width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: var(--vm-accent);
  background: var(--card-background-color, #1c1c1c); border: 1.5px solid var(--vm-accent); }
.dock ha-icon { --mdc-icon-size: 13px; }
.msg { padding: 32px 8px; text-align: center; color: var(--secondary-text-color); font-size: 14px; }
.room { transition: fill-opacity 0.6s ease; }
.three, .labels3d { position: absolute; inset: 0; display: none; }
.three { touch-action: none; cursor: grab; border-radius: 10px; overflow: hidden; }
.three:active { cursor: grabbing; }
.labels3d { pointer-events: none; overflow: hidden; }
.map.is3d .three, .map.is3d .labels3d { display: block; }
.map.is3d > svg, .map.is3d .labels { visibility: hidden; }
.vt { position: absolute; top: 4px; right: 4px; z-index: 2; display: flex; padding: 2px; border-radius: 999px;
  background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 82%, transparent); }
.vt button { border: none; background: none; font: inherit; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 999px;
  cursor: pointer; color: var(--secondary-text-color); }
.vt button.on { color: var(--primary-text-color); background: color-mix(in srgb, var(--vm-accent) 24%, transparent); }
.vt button:focus-visible { outline: 2px solid var(--vm-accent); }
.icon-btn { all: unset; flex: none; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  color: var(--secondary-text-color); }
.icon-btn ha-icon { --mdc-icon-size: 20px; }
.icon-btn:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
.icon-btn:focus-visible { outline: 2px solid var(--vm-accent); outline-offset: 1px; }
.fs { position: absolute; top: 4px; left: 4px; z-index: 2; width: 28px; height: 28px;
  background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 82%, transparent); }
.fs ha-icon { --mdc-icon-size: 18px; }
`;
