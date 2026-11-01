import { BOT_TRAP_FIELD } from "@/lib/bot-signals";

/** Hidden field only automated form-fillers complete. Render one inside each public form. */
export function BotTrapField() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this field empty
        <input type="text" name={BOT_TRAP_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
