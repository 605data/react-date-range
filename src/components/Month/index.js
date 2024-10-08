/* eslint-disable no-fallthrough */
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isBefore,
  isSameDay,
  isAfter,
  isWeekend,
  isWithinInterval,
  eachDayOfInterval,
} from 'date-fns';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { v4 as uuid } from 'uuid';
import {
  getMonthDisplayRange,
  calculateBroadcastWeekNumber,
  shouldRenderBroadcastDay,
} from '../../utils';
import DayCell, { rangeShape } from '../DayCell';

function renderWeekdays(styles, dateOptions, weekdayDisplayFormat, broadcastCalendar) {
  const now = new Date();
  return (
    <div className={styles.weekDays}>
      {eachDayOfInterval({
        start: startOfWeek(now, dateOptions),
        end: endOfWeek(now, dateOptions),
      }).map((day, i) => {
        if (i === 0 && broadcastCalendar) {
          return (
            <Fragment key={`week-number-${uuid()}`}>
              <span className={styles.weekDay}>
                #
              </span>
              <span className={styles.weekDay}>
                {format(day, weekdayDisplayFormat, dateOptions)}
              </span>
            </Fragment>
          );
        }
        return (
          <span className={styles.weekDay} key={`day-cell-${uuid()}`}>
            {format(day, weekdayDisplayFormat, dateOptions)}
          </span>
        );
      })}
    </div>
  );
}

class Month extends PureComponent {
  render() {
    const now = new Date();
    const { displayMode, focusedRange, drag, styles, disabledDates, disabledDay, month } = this.props;
    const minDate = this.props.minDate && startOfDay(this.props.minDate);
    const maxDate = this.props.maxDate && endOfDay(this.props.maxDate);
    const monthDisplay = getMonthDisplayRange(
      this.props.month,
      this.props.dateOptions,
      this.props.fixedHeight
    );
    let ranges = this.props.ranges;
    if (displayMode === 'dateRange' && drag.status) {
      let { startDate, endDate } = drag.range;
      ranges = ranges.map((range, i) => {
        if (i !== focusedRange[0]) return range;
        return {
          ...range,
          startDate,
          endDate,
        };
      });
    }
    const showPreview = this.props.showPreview && !drag.disablePreview;
    const indexToAddWeekNumber = [0, 7, 14, 21, 28, 35];
    return (
      <div className={styles.month} style={this.props.style}>
        {this.props.showMonthName ? (
          <div className={styles.monthName}>
            {format(this.props.month, this.props.monthDisplayFormat, this.props.dateOptions)}
          </div>
        ) : null}
        {this.props.showWeekDays &&
          renderWeekdays(styles, this.props.dateOptions, this.props.weekdayDisplayFormat, this.props.broadcastCalendar)}
        <div className={styles.days} onMouseLeave={this.props.onMouseLeave}>
          {eachDayOfInterval({ start: monthDisplay.start, end: monthDisplay.end }).map(
            (day, index) => {
              const isStartOfMonth = isSameDay(day, monthDisplay.startDateOfMonth);
              const isEndOfMonth = isSameDay(day, monthDisplay.endDateOfMonth);
              const isOutsideMinMax =
                (minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate));
              const isDisabledSpecifically = disabledDates.some(disabledDate =>
                isSameDay(disabledDate, day)
              );
              const isDisabledDay = disabledDay(day);
              if (this.props.broadcastCalendar && !shouldRenderBroadcastDay(day, this.props.month.getMonth())) {
                return null;
              }
              if (indexToAddWeekNumber.includes(index) && this.props.broadcastCalendar) {
                const weekNumber = calculateBroadcastWeekNumber(day);
                return (
                  <Fragment key={`firstRow-${weekNumber}-${month.valueOf()}`}>
                    <DayCell
                      {...this.props}
                      weekNumber={weekNumber}
                      disabled
                      key={`weekday-${weekNumber}-${month.valueOf()}`}
                      isPassive={false}
                      styles={styles}
                    />
                    <DayCell
                      {...this.props}
                      ranges={ranges}
                      day={day}
                      key={`day-${index}-${month.valueOf()}`}
                      preview={showPreview ? this.props.preview : null}
                      isWeekend={isWeekend(day, this.props.dateOptions)}
                      isToday={isSameDay(day, now)}
                      isStartOfWeek={isSameDay(day, startOfWeek(day, this.props.dateOptions))}
                      isEndOfWeek={isSameDay(day, endOfWeek(day, this.props.dateOptions))}
                      isStartOfMonth={isStartOfMonth}
                      isEndOfMonth={isEndOfMonth}
                      disabled={isOutsideMinMax || isDisabledSpecifically || isDisabledDay}
                      isPassive={false}
                      styles={styles}
                      onMouseDown={this.props.onDragSelectionStart}
                      onMouseUp={this.props.onDragSelectionEnd}
                      onMouseEnter={this.props.onDragSelectionMove}
                      dragRange={drag.range}
                      drag={drag.status}
                    />
                  </Fragment>
                );
              }
              return (
                <DayCell
                  {...this.props}
                  ranges={ranges}
                  day={day}
                  preview={showPreview ? this.props.preview : null}
                  isWeekend={isWeekend(day, this.props.dateOptions)}
                  isToday={isSameDay(day, now)}
                  isStartOfWeek={isSameDay(day, startOfWeek(day, this.props.dateOptions))}
                  isEndOfWeek={isSameDay(day, endOfWeek(day, this.props.dateOptions))}
                  isStartOfMonth={isStartOfMonth}
                  isEndOfMonth={isEndOfMonth}
                  key={`day-${index}-${month.valueOf()}`}
                  disabled={isOutsideMinMax || isDisabledSpecifically || isDisabledDay}
                  isPassive={this.props.broadcastCalendar ? false :
                    !isWithinInterval(day, {
                      start: monthDisplay.startDateOfMonth,
                      end: monthDisplay.endDateOfMonth,
                    })
                  }
                  styles={styles}
                  onMouseDown={this.props.onDragSelectionStart}
                  onMouseUp={this.props.onDragSelectionEnd}
                  onMouseEnter={this.props.onDragSelectionMove}
                  dragRange={drag.range}
                  drag={drag.status}
                />
              );
            }
          )}
        </div>
      </div>
    );
  }
}

Month.defaultProps = {};

Month.propTypes = {
  style: PropTypes.object,
  styles: PropTypes.object,
  month: PropTypes.object,
  drag: PropTypes.object,
  dateOptions: PropTypes.object,
  disabledDates: PropTypes.array,
  disabledDay: PropTypes.func,
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
  }),
  showPreview: PropTypes.bool,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  ranges: PropTypes.arrayOf(rangeShape),
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  onDragSelectionStart: PropTypes.func,
  onDragSelectionEnd: PropTypes.func,
  onDragSelectionMove: PropTypes.func,
  onMouseLeave: PropTypes.func,
  monthDisplayFormat: PropTypes.string,
  weekdayDisplayFormat: PropTypes.string,
  dayDisplayFormat: PropTypes.string,
  showWeekDays: PropTypes.bool,
  showMonthName: PropTypes.bool,
  fixedHeight: PropTypes.bool,
};

export default Month;
