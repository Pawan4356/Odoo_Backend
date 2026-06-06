import type { ReactNode } from "react";

/* ============================================================
   Apple UI primitives. Hairline cards, a single blue accent,
   pill CTAs, SF Pro / Inter type, generous air, no chrome.
   ============================================================ */

/* ---- Section heading (replaces the old chunky eyebrow) ---- */
export const SectionEyebrow = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-ink mb-6">
    {children}
  </h2>
);

/* ---- Feature panel: hairline card with a quiet title + body ---- */
export const RibbonCard = ({
  title,
  isNew,
  children,
  right,
}: {
  title: string;
  isNew?: boolean;
  children: ReactNode;
  right?: ReactNode;
}) => (
  <div className="relative rounded-[18px] border border-hairline bg-parchment overflow-hidden">
    {isNew && (
      <span className="absolute top-4 right-4 z-10 rounded-pill bg-primary text-on-primary font-ui text-[12px] font-semibold px-3 py-1">
        New
      </span>
    )}
    <div className="flex items-center gap-6 px-7 py-7">
      <div className="flex-1">
        <h3 className="font-display text-[21px] font-semibold tracking-[-0.01em] text-ink mb-2">
          {title}
        </h3>
        <div className="font-body text-[17px] leading-[1.47] text-ink-soft">
          {children}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  </div>
);

/* ---- Analytics summary card ---- */
export const StatCard = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) => (
  <div className="rounded-[18px] border border-hairline bg-canvas px-6 py-5">
    <div className="font-ui text-[14px] text-ink-soft mb-2">{label}</div>
    <div className="font-display text-[40px] font-semibold tracking-[-0.02em] leading-none text-ink">
      {value}
    </div>
    {sub && <div className="font-body text-[14px] text-ink-faint mt-2">{sub}</div>}
  </div>
);

/* ---- Buttons ---- */
export const ButtonPrimary = ({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) => (
  <button
    type={type}
    onClick={onClick}
    className="press active:press-active inline-flex items-center justify-center rounded-pill bg-primary text-on-primary font-ui text-[17px] px-[22px] py-[10px] cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary-focus"
    disabled={disabled}
  >
    {children}
  </button>
);

export const ButtonSecondary = ({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    className="press active:press-active inline-flex items-center justify-center rounded-pill bg-transparent text-primary border border-primary font-ui text-[17px] px-[22px] py-[10px] cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary-focus"
  >
    {children}
  </button>
);

/* ---- Text input + field wrapper ---- */
export const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) => (
  <label className="block mb-5">
    <span className="block font-ui text-[14px] font-medium text-ink-soft mb-2">
      {label}
    </span>
    {children}
    {hint && <span className="block font-body text-[13px] text-ink-faint mt-1.5">{hint}</span>}
  </label>
);

const inputCls =
  "w-full bg-canvas text-ink border border-hairline rounded-[12px] font-body text-[17px] px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors disabled:bg-parchment disabled:text-ink-faint";

export const TextInput = (
  props: React.InputHTMLAttributes<HTMLInputElement>
) => <input {...props} className={inputCls} />;

export const TextArea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) => <textarea {...props} className={`${inputCls} min-h-[112px] resize-y`} />;

export const Select = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) => <select {...props} className={inputCls} />;

/* ---- Filter / status tabs — pill segmented control ---- */
export const FilterTabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) => (
  <div className="inline-flex flex-wrap gap-1 p-1 rounded-pill bg-parchment border border-hairline mb-6">
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`press active:press-active font-ui text-[14px] px-4 py-1.5 rounded-pill cursor-pointer transition-colors ${active === t
            ? "bg-canvas text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "bg-transparent text-ink-soft"
          }`}
      >
        {t}
      </button>
    ))}
  </div>
);

/* ---- Status badge — soft tinted pill, no hard borders ---- */
const STATUS_STYLE: Record<string, string> = {
  Active: "bg-[#e3f4e8] text-[#1d7a3a]",
  Paid: "bg-[#e3f4e8] text-[#1d7a3a]",
  Approved: "bg-[#e3f4e8] text-[#1d7a3a]",
  Selected: "bg-[#e3f4e8] text-[#1d7a3a]",
  Completed: "bg-[#e3f4e8] text-[#1d7a3a]",
  Pending: "bg-[#fdf0e3] text-[#9a5b00]",
  "Pending Approval": "bg-[#fdf0e3] text-[#9a5b00]",
  "Pending Payment": "bg-[#fdf0e3] text-[#9a5b00]",
  "Under Review": "bg-[#eef0f2] text-[#4a4a52]",
  Submitted: "bg-[#e6f0fb] text-[#0066cc]",
  Issued: "bg-[#e6f0fb] text-[#0066cc]",
  Draft: "bg-[#eef0f2] text-[#4a4a52]",
  Closed: "bg-[#eef0f2] text-[#4a4a52]",
  Removed: "bg-[#fce8e8] text-[#c4313b]",
  Rejected: "bg-[#fce8e8] text-[#c4313b]",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`${STATUS_STYLE[status] ?? "bg-[#eef0f2] text-[#4a4a52]"} inline-flex items-center rounded-pill font-ui text-[12px] font-medium px-2.5 py-1`}
  >
    {status}
  </span>
);

/* ---- Data table chrome — hairline, no fills ---- */
export const Table = ({
  head,
  children,
}: {
  head: ReactNode;
  children: ReactNode;
}) => (
  <div className="rounded-[18px] border border-hairline bg-canvas overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-hairline">{head}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const Th = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <th className={`font-ui text-[13px] font-medium text-ink-faint px-4 py-3 ${className}`}>
    {children}
  </th>
);

export const Td = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <td
    className={`font-body text-[15px] text-ink px-4 py-3 border-t border-hairline-soft align-middle ${className}`}
  >
    {children}
  </td>
);

/* ---- Small inline brand mark (kept for the login surface) ---- */
export const CertSeal = () => (
  <div
    className="rounded-full bg-parchment border border-hairline w-16 h-16 flex flex-col items-center justify-center text-center"
    title="Trusted procurement"
  >
    <span className="font-ui text-[11px] font-semibold text-primary leading-none">
      Trusted
    </span>
    <span className="font-ui text-[10px] text-ink-faint leading-tight mt-0.5">
      since 1996
    </span>
  </div>
);

/* ---- Step progress indicator ---- */
export const StepIndicator = ({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 1-based
}) => (
  <div className="flex items-center gap-2 mb-8 overflow-x-auto">
    {steps.map((s, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <div key={s} className="flex items-center gap-2 shrink-0">
          <span
            className={`rounded-full w-7 h-7 flex items-center justify-center font-ui text-[13px] font-semibold ${active
                ? "bg-primary text-on-primary"
                : done
                  ? "bg-primary/10 text-primary"
                  : "bg-parchment text-ink-faint border border-hairline"
              }`}
          >
            {done ? "✓" : n}
          </span>
          <span
            className={`font-ui text-[14px] ${active ? "text-ink font-medium" : "text-ink-soft"
              }`}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="w-8 h-px bg-hairline mx-1" />}
        </div>
      );
    })}
  </div>
);

/* ---- Page header (title + subtitle + optional action) ---- */
export const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="flex items-end justify-between gap-4 mb-8">
    <div>
      <h1 className="font-display text-[40px] font-semibold tracking-[-0.02em] leading-[1.05] text-ink">
        {title}
      </h1>
      {subtitle && (
        <p className="font-body text-[17px] text-ink-soft mt-2">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/* ---- Product render placeholder (rests on a surface, picks up the shadow) ---- */
export const PhotoNotch = ({ label }: { label: string }) => (
  <div className="product-shadow rounded-[18px] bg-canvas border border-hairline-soft w-[112px] h-[84px] flex items-center justify-center">
    <span className="font-ui text-[13px] text-ink-faint text-center leading-tight px-2">
      {label}
    </span>
  </div>
);
