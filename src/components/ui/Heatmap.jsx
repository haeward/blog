import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const BlogHeatmap = ({ startDate, endDate, values, totalPosts, totalWords }) => {
  // Format word count for display
  const formattedWordCount = totalWords >= 1000
    ? `${(totalWords / 1000).toFixed(1)}k`
    : totalWords.toLocaleString();

  const getColorClass = (count) => {
    if (!count || count === 0) return 'color-empty';
    if (count < 200) return 'color-scale-1';
    if (count < 500) return 'color-scale-2';
    if (count < 1000) return 'color-scale-3';
    return 'color-scale-4';
  };

  const handleDayClick = (value) => {
    if (value && value.slug) {
      window.location.href = `/blog/${value.slug}`;
    }
  };

  return (
    <div className="blog-stats">
      <div className="heatmap-container">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          classForValue={(value) => {
            if (!value || value.count === 0) {
              return 'color-empty';
            }
            return getColorClass(value.count);
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) {
              return null;
            }
            let tooltipHtml = `
              <div style="
                text-align: center;
                padding: 8px 12px;
                font-weight: 500;
                color: var(--tooltip-text, #333);
              ">${value.date}</div>
            `;

            if (value.title) {
              tooltipHtml += `
                <div style="
                  text-align: center;
                  padding: 0 12px 8px;
                  color: var(--tooltip-text, #333);
                "><span style="color: var(--tooltip-title, #3182ce); font-weight: 500;">${value.title}</span> | <span style="color: var(--tooltip-count, #38a169);">${value.count} words</span></div>
              `;
            } else {
              tooltipHtml += `
                <div style="
                  text-align: center;
                  padding: 0 12px 8px;
                  color: var(--tooltip-text, #333);
                "><span style="color: var(--tooltip-count, #38a169);">${value.count || 0} words</span></div>
              `;
            }

            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': tooltipHtml,
            };
          }}
          showMonthLabels={true}
          showWeekdayLabels={true}
          showOutOfRangeDays={true}
          horizontal={true}
          gutterSize={3}
          weekdayLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
          onClick={handleDayClick}
          transformDayElement={(element, value) => {
            if (value && value.slug) {
              return React.cloneElement(element, {
                style: { cursor: 'pointer' }
              });
            }
            return element;
          }}
        />

        <ReactTooltip 
          id="heatmap-tooltip" 
          className="custom-tooltip"
          border="0.5px solid"
          borderColor="var(--tooltip-border, #ddd)"
          opacity={1}
          place="top"
          delayShow={100}
          delayHide={400}
          style={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            color: 'var(--tooltip-text, #333)',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            padding: '0',
            fontSize: '14px',
            maxWidth: '250px',
            zIndex: 9999
          }}
        />
      </div>

      <div className="stats-summary">
        <p className="text-black/60 dark:text-white/45">
          {totalPosts} Posts | {formattedWordCount} Words
        </p>
      </div>
    </div>
  );
};

export default BlogHeatmap;
