export const isDateOnlyString = (value) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

// Treat common "date picked but time not set" shapes as date-only-like.
// Examples:
// - HTML datetime-local midnight: 2026-02-03T00:00
// - ISO midnight: 2026-02-03T00:00:00.000Z
export const isDateOnlyLikeString = (value) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (isDateOnlyString(trimmed)) return true;

    return /^\d{4}-\d{2}-\d{2}T00:00(?::00(?:\.000)?)?(?:Z)?$/.test(trimmed);
};

export const parseLocalDateOnly = (value) => {
    const trimmed = String(value).trim();
    const datePart = trimmed.slice(0, 10); // YYYY-MM-DD
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Normalizes a date/time input into a Date.
// - If input is date-only (YYYY-MM-DD), it is treated as LOCAL time.
// - If bound is 'start'/'end' and input is date-only, time is set to 00:00 or 23:59:59.999.
export const normalizeDateBound = (value, bound) => {
    if (!value) return null;

    let date;
    if (value instanceof Date) {
        date = new Date(value);
    } else if (isDateOnlyLikeString(value)) {
        // Parse the date part as local time to avoid UTC shifting.
        date = parseLocalDateOnly(value);
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return null;

    if (isDateOnlyLikeString(value)) {
        if (bound === 'start') date.setHours(0, 0, 0, 0);
        if (bound === 'end') date.setHours(23, 59, 59, 999);
    }

    return date;
};

// Convenience helper for query-style ranges.
// If only one side is provided and it's date-only, expand to that full day.
export const normalizeDateRange = ({ from, to } = {}) => {
    const start = normalizeDateBound(from, 'start');
    const end = normalizeDateBound(to, 'end');

    if (start && end) {
        return start <= end ? { start, end } : { start: end, end: start };
    }

    if (start && !end) {
        if (isDateOnlyLikeString(from)) {
            return { start, end: normalizeDateBound(from, 'end') };
        }
        return { start, end: null };
    }

    if (!start && end) {
        if (isDateOnlyLikeString(to)) {
            return { start: normalizeDateBound(to, 'start'), end };
        }
        return { start: null, end };
    }

    return { start: null, end: null };
};
