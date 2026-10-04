const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_HOUR = 60;
const MINUTE_HEIGHT = 0.5;
const HOUR_HEIGHT = MINUTES_PER_HOUR * MINUTE_HEIGHT;
const HOUR_COUNT = 24;
const HEADER_HEIGHT = 40;
const GUTTER_WIDTH = 60;
const DAY_WIDTH = 240;
const CALENDAR_HEIGHT = HEADER_HEIGHT + HOUR_COUNT * HOUR_HEIGHT;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const EVENT_COLORS = Object.freeze([
    '#a8c7fa', '#f2b8b5', '#fde293', '#a8dab5',
    '#fcc7a5', '#a5e3e0', '#d7aefb', '#d3bfb2'
]);

const WEEKDAY_NAMES = Object.freeze(['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']);

function px(value) {
    return value + 'px';
}

const CALENDAR_STYLE = Object.freeze({
    position: 'relative',
    boxSizing: 'border-box',
    height: px(CALENDAR_HEIGHT),
    overflow: 'hidden',
    background: '#fff',
    color: '#202124',
    font: '12px/1 Arial, sans-serif'
});

const HORIZONTAL_GRID_STYLE = Object.freeze({
    position: 'absolute',
    left: '0',
    width: '100%',
    height: '1px',
    background: '#e0e0e0',
    zIndex: '1'
});

const VERTICAL_GRID_STYLE = Object.freeze({
    position: 'absolute',
    top: '0',
    width: '1px',
    height: px(CALENDAR_HEIGHT),
    background: '#ccc',
    zIndex: '3'
});

const TIME_LABEL_STYLE = Object.freeze({
    position: 'absolute',
    left: '0',
    width: px(GUTTER_WIDTH - 1),
    height: px(HOUR_HEIGHT),
    boxSizing: 'border-box',
    paddingRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    background: '#fff',
    color: '#3c4043',
    zIndex: '2'
});

const DAY_HEADER_STYLE = Object.freeze({
    position: 'absolute',
    top: '0',
    width: px(DAY_WIDTH),
    height: px(HEADER_HEIGHT),
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    borderBottom: '1px solid #ccc',
    zIndex: '4'
});

const EVENT_BLOCK_STYLE = Object.freeze({
    position: 'absolute',
    boxSizing: 'border-box',
    border: '1px solid #9aa0a6',
    padding: '1px 4px',
    overflow: 'hidden',
    color: '#3c4043',
    fontSize: '11px',
    lineHeight: '1',
    zIndex: '2'
});

function extendStyle(template, calculated) {
    return Object.assign({}, template, calculated);
}

function createCalendarStyle(dayCount) {
    return extendStyle(CALENDAR_STYLE, {
        width: px(GUTTER_WIDTH + dayCount * DAY_WIDTH)
    });
}

function createHorizontalGridStyle(top) {
    return extendStyle(HORIZONTAL_GRID_STYLE, { top: px(top) });
}

function createVerticalGridStyle(left) {
    return extendStyle(VERTICAL_GRID_STYLE, { left: px(left) });
}

function createTimeLabelStyle(hour) {
    return extendStyle(TIME_LABEL_STYLE, {
        top: px(HEADER_HEIGHT + hour * HOUR_HEIGHT)
    });
}

function createDayHeaderStyle(dayIndex) {
    return extendStyle(DAY_HEADER_STYLE, {
        left: px(GUTTER_WIDTH + dayIndex * DAY_WIDTH)
    });
}

function createEventBlockStyle(event, columnWidth) {
    return extendStyle(EVENT_BLOCK_STYLE, {
        top: px(HEADER_HEIGHT + event.startMin * MINUTE_HEIGHT),
        left: px(
            GUTTER_WIDTH + event.dayIndex * DAY_WIDTH + event.column * columnWidth
        ),
        width: px(columnWidth),
        height: px((event.endMin - event.startMin) * MINUTE_HEIGHT),
        background: event.color
    });
}

function createUTCDate(isoDate) {
    return new Date(isoDate + 'T00:00:00Z');
}

function parseTime(raw) {
    if (typeof raw !== 'string') {
        return { ok: false, reason: 'unparsable' };
    }

    let text = raw
        .replace(/[oOоО]/g, '0')
        .replace(/;/g, ':')
        .trim()
        .replace(/\s*([:.])\s*/g, '$1');

    let suffix = null;
    const suffixMatch = text.match(/([ap])\.?m\.?$/i);
    if (suffixMatch) {
        suffix = suffixMatch[1].toLowerCase();
        text = text.slice(0, suffixMatch.index).trim();
    }

    const match = text.match(/^(\d+)(?:([:.])(\d+))?$/);
    if (!match) {
        return { ok: false, reason: 'unparsable' };
    }

    let hour = Number(match[1]);
    const minute = match[3] === undefined ? 0 : Number(match[3]);

    if (suffix) {
        if (hour < 1 || hour > 12) {
            return { ok: false, reason: 'hour-out-of-range' };
        }
    } else if (hour < 0 || hour > 23) {
        return { ok: false, reason: 'hour-out-of-range' };
    }

    if (minute < 0 || minute > 59) {
        return { ok: false, reason: 'minute-out-of-range' };
    }

    if (suffix) {
        hour %= 12;
        if (suffix === 'p') hour += 12;
    }

    return { ok: true, minutes: hour * MINUTES_PER_HOUR + minute };
}

function parseDuration(raw) {
    if (typeof raw !== 'string') return null;

    const text = raw.trim();
    let match;
    let total;

    match = text.match(/^(\d+)\s*мин$/i);
    if (match) {
        total = Number(match[1]);
        return Number.isSafeInteger(total) ? total : null;
    }

    match = text.match(/^(\d+)\s*ч(?:\s*(\d+)\s*м)?$/i);
    if (match) {
        total = Number(match[1]) * MINUTES_PER_HOUR;
        if (match[2] !== undefined) total += Number(match[2]);
        return Number.isSafeInteger(total) ? total : null;
    }

    match = text.match(/^(\d+)\s*м$/i);
    if (match) {
        total = Number(match[1]);
        return Number.isSafeInteger(total) ? total : null;
    }

    return null;
}

function addError(errors, event, value, reason) {
    errors.push({ id: event.id, value, reason });
}

function validateEvent(event, order, periodStart, periodEnd, errors, validCount) {
    const eventDate = createUTCDate(event.date);

    if (eventDate < periodStart || eventDate >= periodEnd) {
        addError(errors, event, event.date, 'date-out-of-range');
        return null;
    }

    const dayIndex = (eventDate.getTime() - periodStart.getTime())
        / DAY_IN_MILLISECONDS;

    const start = parseTime(event.start);
    if (!start.ok) {
        addError(errors, event, event.start, start.reason);
        return null;
    }

    let endMin;

    if (Object.prototype.hasOwnProperty.call(event, 'duration')) {
        const duration = parseDuration(event.duration);
        if (duration === null) {
            addError(errors, event, event.duration, 'unparsable');
            return null;
        }

        endMin = start.minutes + duration;

        if (endMin <= start.minutes) {
            addError(errors, event, event.duration, 'end-before-start');
            return null;
        }

        if (endMin > MINUTES_PER_DAY) {
            addError(errors, event, event.duration, 'hour-out-of-range');
            return null;
        }
    } else {
        const end = parseTime(event.end);
        if (!end.ok) {
            addError(errors, event, event.end, end.reason);
            return null;
        }

        endMin = end.minutes;
        if (endMin <= start.minutes) {
            addError(errors, event, event.end, 'end-before-start');
            return null;
        }
    }

    return {
        id: event.id,
        title: event.title,
        dayIndex,
        startMin: start.minutes,
        endMin,
        order,
        color: EVENT_COLORS[validCount % EVENT_COLORS.length]
    };
}

function collectEvents(input, periodStart, periodEnd) {
    const errors = [];
    const byDay = Array.from({ length: input.days }, () => []);
    let validCount = 0;

    for (let order = 0; order < input.events.length; order++) {
        const event = validateEvent(
            input.events[order], order, periodStart, periodEnd, errors, validCount
        );
        if (!event) continue;

        byDay[event.dayIndex].push(event);
        validCount++;
    }

    return { errors, byDay };
}

function addElement(parent, tagName, styles, text) {
    const element = document.createElement(tagName);
    Object.assign(element.style, styles);
    if (text !== undefined) element.textContent = text;
    parent.appendChild(element);
    return element;
}

function setCalendarFrame(calendar, dayCount) {
    Object.assign(calendar.style, createCalendarStyle(dayCount));
    calendar.replaceChildren();
}

function renderGrid(calendar, dayCount) {
    for (let hour = 0; hour < HOUR_COUNT; hour++) {
        addElement(
            calendar,
            'div',
            createHorizontalGridStyle(HEADER_HEIGHT + hour * HOUR_HEIGHT)
        );
    }

    addElement(calendar, 'div', createHorizontalGridStyle(CALENDAR_HEIGHT - 1));

    for (let index = 0; index < dayCount; index++) {
        addElement(
            calendar,
            'div',
            createVerticalGridStyle(GUTTER_WIDTH + index * DAY_WIDTH)
        );
    }

    const calendarWidth = GUTTER_WIDTH + dayCount * DAY_WIDTH;
    addElement(
        calendar,
        'div',
        createVerticalGridStyle(calendarWidth - 1)
    );
}

function renderTimeLabels(calendar) {
    for (let hour = 0; hour < HOUR_COUNT; hour++) {
        const label = String(hour).padStart(2, '0') + ':00';
        addElement(calendar, 'div', createTimeLabelStyle(hour), label);
    }
}

function renderDayHeaders(calendar, periodStart, dayCount) {
    for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
        const date = new Date(periodStart.getTime());
        date.setUTCDate(date.getUTCDate() + dayIndex);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const title = WEEKDAY_NAMES[date.getUTCDay()] + ', ' + day + '.' + month;

        addElement(calendar, 'div', createDayHeaderStyle(dayIndex), title);
    }
}

function assignColumns(group) {
    const columnEnds = [];

    for (const event of group) {
        let column = 0;
        while (column < columnEnds.length && columnEnds[column] > event.startMin) {
            column++;
        }

        if (column === columnEnds.length) {
            columnEnds.push(event.endMin);
        } else {
            columnEnds[column] = event.endMin;
        }
        event.column = column;
    }

    return columnEnds.length;
}

function renderEventGroup(calendar, group) {
    const columnCount = assignColumns(group);

    for (const event of group) {
        const columnWidth = DAY_WIDTH / columnCount;
        addElement(
            calendar,
            'div',
            createEventBlockStyle(event, columnWidth),
            event.title
        );
    }
}

function renderDayEvents(calendar, events) {
    events.sort((a, b) => a.startMin - b.startMin || a.order - b.order);

    let group = [];
    let groupMaxEnd = -1;

    for (const event of events) {
        if (group.length > 0 && event.startMin >= groupMaxEnd) {
            renderEventGroup(calendar, group);
            group = [];
        }

        if (group.length === 0) {
            groupMaxEnd = event.endMin;
        } else {
            groupMaxEnd = Math.max(groupMaxEnd, event.endMin);
        }
        group.push(event);
    }

    if (group.length > 0) renderEventGroup(calendar, group);
}

function renderCalendar(input, periodStart, byDay) {
    const calendar = document.getElementById('calendar');

    setCalendarFrame(calendar, input.days);
    renderGrid(calendar, input.days);
    renderTimeLabels(calendar);
    renderDayHeaders(calendar, periodStart, input.days);

    for (const events of byDay) {
        renderDayEvents(calendar, events);
    }
}

(function main() {
    const input = window.INPUT;
    const periodStart = createUTCDate(input.startDate);
    const periodEnd = new Date(periodStart.getTime());
    periodEnd.setUTCDate(periodEnd.getUTCDate() + input.days);
    const { errors, byDay } = collectEvents(input, periodStart, periodEnd);

    window.ERRORS = errors;
    renderCalendar(input, periodStart, byDay);
})();

