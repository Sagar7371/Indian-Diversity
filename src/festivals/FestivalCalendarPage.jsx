import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bell, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Heart, MapPin, Moon, Search, Sun, X } from 'lucide-react';
import { festivalRecords, festivalYears } from './festivalData.js';
import { festivalService } from './festivalService.js';
import './festivalCalendar.css';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const tagFilters = [
  { value: 'Harvest', label: '🌿 Harvest' },
  { value: 'Religious', label: 'ॐ Religious' },
  { value: 'National', label: '🇮🇳 National' },
  { value: 'Tribal', label: '🔺 Tribal' },
  { value: 'Seasonal', label: '☀️ Seasonal' },
  { value: 'Cultural', label: '🎭 Cultural' },
  { value: 'Folk', label: '🎭 Folk' }
];
const fallbackImage = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=75';

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fromISODate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value, options = { month: 'long', day: 'numeric', year: 'numeric' }) {
  return fromISODate(value).toLocaleDateString('en-IN', options);
}

function formatOccurrence(occurrence) {
  if (!occurrence) return 'Date not listed for this year';
  if (occurrence.startDate === occurrence.endDate) return formatDate(occurrence.startDate);
  return `${formatDate(occurrence.startDate, { month: 'short', day: 'numeric' })} – ${formatDate(occurrence.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function getOccurrenceOnDate(festival, date) {
  return festival.dates.find((occurrence) => occurrence.startDate <= date && occurrence.endDate >= date);
}

function FestivalCard({ festival, occurrence, onDetails }) {
  return (
    <article className="festivalResultCard">
      <div className="festivalCardImage">
        <img src={festival.images?.[0]?.url || fallbackImage} alt={festival.images?.[0]?.alt || festival.name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
        <span className="festivalCategoryTag">{festival.category}</span>
      </div>
      <div className="festivalCardContent">
        <div className="festivalCardMeta"><CalendarDays size={15} />{formatOccurrence(occurrence)}</div>
        <h3>{festival.name}</h3>
        <p className="festivalCardRegion"><MapPin size={14} />{festival.regions.filter((region) => region !== 'Pan India').join(' · ') || 'Across India'}</p>
        <p className="festivalCardDescription">{festival.shortDescription}</p>
        <button className="festivalDetailsButton" type="button" onClick={() => onDetails(festival, occurrence)}>View details <ArrowRight size={15} /></button>
      </div>
    </article>
  );
}

function StatTile({ label, value, detail }) {
  return <div className="festivalStat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default function FestivalCalendarPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [theme, setTheme] = useState('light');
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [scaleFilter, setScaleFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => festivalService.getFavorites());
  const [festivals, setFestivals] = useState([]);
  const [todayFestivals, setTodayFestivals] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [festivalMonthPages, setFestivalMonthPages] = useState({});
  const [expandedFestivalMonths, setExpandedFestivalMonths] = useState({});

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const today = toISODate(new Date());
  const stateOptions = useMemo(() => [...new Set(festivalRecords.flatMap((festival) => festival.states).filter((state) => state !== 'Pan India'))].sort(), []);
  const categories = useMemo(() => [...new Set(festivalRecords.map((festival) => festival.category))].sort(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    festivalService.list({
      year,
      month,
      state: stateFilter,
      category: categoryFilter,
      type: typeFilter,
      scale: scaleFilter,
      tag: tagFilter,
      search,
      favoriteIds: favoritesOnly ? favoriteIds : undefined
    }).then((records) => {
      if (active) setFestivals(records);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Festival dates could not be loaded.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [year, month, stateFilter, categoryFilter, typeFilter, scaleFilter, tagFilter, search, favoritesOnly, favoriteIds]);

  useEffect(() => {
    let active = true;
    Promise.all([festivalService.getByDate(today), festivalService.getUpcoming(today, 5)])
      .then(([todayRecords, upcomingRecords]) => {
        if (!active) return;
        setTodayFestivals(todayRecords);
        setUpcoming(upcomingRecords);
      })
      .catch(() => {
        if (active) {
          setTodayFestivals([]);
          setUpcoming([]);
        }
      });
    return () => { active = false; };
  }, [today]);

  useEffect(() => {
    if (!selectedFestival) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') closeDetails(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedFestival]);

  useEffect(() => {
    const festivalId = searchParams.get('festival');
    if (!festivalId) return;
    let active = true;
    festivalService.getById(festivalId).then((festival) => {
      if (!active || !festival) return;
      const occurrence = festival.dates.find((item) => item.year === new Date().getFullYear()) || festival.dates[0];
      if (occurrence) {
        setViewMonth(new Date(occurrence.year, Number(occurrence.startDate.slice(5, 7)) - 1, 1));
        setSelectedDate(occurrence.startDate);
      }
      setSelectedOccurrence(occurrence || null);
      setSelectedFestival(festival);
    }).catch(() => {});
    return () => { active = false; };
  }, [searchParams]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();
  const calendarCellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const calendarCells = Array.from({ length: calendarCellCount }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  const selectedFestivals = useMemo(() => festivals
    .map((festival) => ({ festival, occurrence: getOccurrenceOnDate(festival, selectedDate) }))
    .filter((item) => item.occurrence), [festivals, selectedDate]);

  const annualFestivalMonths = useMemo(() => Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    festivals: festivalRecords.flatMap((festival) => festival.dates
      .filter((occurrence) => occurrence.year === year && Number(occurrence.startDate.slice(5, 7)) - 1 === monthIndex)
      .map((occurrence) => ({ festival, occurrence })))
      .sort((a, b) => a.occurrence.startDate.localeCompare(b.occurrence.startDate))
  })).filter((monthItem) => monthItem.festivals.length), [year]);

  const monthFestivals = useMemo(() => festivals
    .map((festival) => ({
      festival,
      occurrence: festival.dates.find((item) => item.year === year && item.startDate <= `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}` && item.endDate >= `${year}-${String(month + 1).padStart(2, '0')}-01`)
    }))
    .filter((item) => item.occurrence)
    .sort((a, b) => a.occurrence.startDate.localeCompare(b.occurrence.startDate)), [festivals, year, month]);

  const searchResults = useMemo(() => search.trim()
    ? festivals.map((festival) => ({ festival, occurrence: festival.dates.find((item) => item.year === year) })).filter((item) => item.occurrence)
    : [], [festivals, search, year]);

  const stats = useMemo(() => {
    const regionCounts = new Map();
    const uniqueStates = new Set();
    const monthCategories = new Set();
    for (const festival of festivals) {
      monthCategories.add(festival.category);
      for (const state of festival.states) if (state !== 'Pan India') uniqueStates.add(state);
      for (const region of festival.regions) if (region !== 'Pan India') regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    }
    const mostCelebrated = [...regionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return { total: new Set(festivals.map((festival) => festival.id)).size, states: uniqueStates.size, categories: monthCategories.size, mostCelebrated };
  }, [festivals]);

  const nextMajor = upcoming.find(({ festival }) => festival.scale === 'Major');

  const changeMonth = (offset) => {
    const nextMonth = new Date(year, month + offset, 1);
    setViewMonth(nextMonth);
    setSelectedDate(toISODate(nextMonth));
  };

  const selectMonth = (nextMonth) => {
    const next = new Date(year, Number(nextMonth), 1);
    setViewMonth(next);
    setSelectedDate(toISODate(next));
  };

  const selectYear = (nextYear) => {
    const next = new Date(Number(nextYear), month, 1);
    setViewMonth(next);
    setSelectedDate(toISODate(next));
  };

  const showToday = () => {
    const current = new Date();
    setViewMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    setSelectedDate(toISODate(current));
  };

  const openDetails = async (festival, occurrence) => {
    setSelectedOccurrence(occurrence);
    setReminderMessage('');
    try {
      setSelectedFestival(await festivalService.getById(festival.id) || festival);
    } catch {
      setSelectedFestival(festival);
    }
  };

  const closeDetails = () => {
    setSelectedFestival(null);
    if (searchParams.has('festival')) {
      const next = new URLSearchParams(searchParams);
      next.delete('festival');
      setSearchParams(next, { replace: true });
    }
  };

  const toggleFavorite = (festival) => {
    const isFavorite = favoriteIds.includes(festival.id);
    setFavoriteIds(festivalService.setFavorite(festival.id, !isFavorite));
  };

  const addReminder = (festival, occurrence) => {
    const date = occurrence?.startDate || selectedDate;
    festivalService.setReminder({ festivalId: festival.id, festivalDate: date, reminderPreference: 'local-calendar' });
    setReminderMessage(`Reminder saved on this device for ${formatDate(date)}.`);
  };

  const toggleTag = (tag) => setTagFilter((current) => current === tag ? '' : tag);
  const clearFilters = () => {
    setSearch('');
    setStateFilter('');
    setCategoryFilter('');
    setTypeFilter('');
    setScaleFilter('');
    setTagFilter('');
    setFavoritesOnly(false);
  };

  return (
    <div className={`festivalCalendarPage theme-${theme}`}>
      <main className="festivalCalendarMain">
        <div className="festivalPageHeading">
          <div className="festivalEyebrow"><CalendarDays size={15} />Indian Culture · Year-round</div>
          <h1>Festival Calendar of <em>India</em></h1>
          <p>Explore the festivals, traditions and celebrations of India throughout the year.</p>
          <div className="festivalHeroLandmarks" aria-hidden="true"><span>🛕</span><span>🪷</span><span>💃</span><span>🐘</span><span>🏰</span></div>
        </div>

        <section className="festivalToday" aria-labelledby="festivalTodayTitle">
          <div className="festivalTodayIcon"><Sun size={21} /></div>
          <div className="festivalTodayCopy">
            <span id="festivalTodayTitle">Today in Indian Culture · {formatDate(today)}</span>
            {todayFestivals.length ? (
              <div className="festivalTodayList">{todayFestivals.map((festival) => <button type="button" key={festival.id} onClick={() => openDetails(festival, getOccurrenceOnDate(festival, today))}>{festival.name}<ArrowRight size={14} /></button>)}</div>
            ) : <p>No major festival is listed for this date.</p>}
          </div>
        </section>

        <section className="festivalFilters" aria-label="Festival filters">
          <label className="festivalSearch"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search festivals..." aria-label="Search festivals" /></label>
          <label><span>State / region</span><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}><option value="">All regions</option>{stateOptions.map((state) => <option key={state}>{state}</option>)}</select></label>
          <label><span>Category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label><span>Tradition</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">Religious & cultural</option><option value="Religious">Religious</option><option value="Cultural">Cultural</option><option value="Civic">Civic / national</option></select></label>
          <label><span>Scale</span><select value={scaleFilter} onChange={(event) => setScaleFilter(event.target.value)}><option value="">Major & minor</option><option value="Major">Major</option><option value="Minor">Minor</option></select></label>
          <button className={`festivalFavoritesFilter${favoritesOnly ? ' is-active' : ''}`} type="button" onClick={() => setFavoritesOnly((current) => !current)}><Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />My Festivals <span>{favoriteIds.length}</span></button>
        </section>

        <div className="festivalTagFilters" aria-label="Festival themes">
          <span>Explore by theme</span>
          {tagFilters.map(({ value, label }) => <button type="button" className={tagFilter === value ? 'is-active' : ''} aria-pressed={tagFilter === value} key={value} onClick={() => toggleTag(value)}>{label}</button>)}
          {(search || stateFilter || categoryFilter || typeFilter || scaleFilter || tagFilter || favoritesOnly) && <button className="festivalClearFilters" type="button" onClick={clearFilters}>Clear filters</button>}
        </div>

        <div className="festivalCalendarLayout">
          <section className="festivalCalendarPanel" aria-label={`${monthNames[month]} ${year} calendar`}>
            <div className="festivalCalendarToolbar">
              <div className="festivalMonthLabel"><h2>{monthNames[month]} {year}</h2></div>
              <div className="festivalMonthControls">
                <button type="button" className="festivalArrowButton" onClick={() => changeMonth(-1)} aria-label="Previous month"><ChevronLeft size={20} /></button>
                <button type="button" className="festivalTodayButton" onClick={showToday}>Today</button>
                <button type="button" className="festivalArrowButton" onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className="festivalWeekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
            <div className="festivalCalendarGrid">
              {calendarCells.map((day, index) => {
                if (!day) return <span className="festivalCalendarBlank" key={`blank-${index}`} aria-hidden="true" />;
                const date = toISODate(new Date(year, month, day));
                const dayFestivals = festivals.filter((festival) => getOccurrenceOnDate(festival, date));
                const isToday = date === today;
                const isSelected = date === selectedDate;
                return (
                  <button type="button" key={date} className={`festivalCalendarDay${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}${dayFestivals.length ? ' has-festival' : ''}`} aria-label={`${formatDate(date)}${dayFestivals.length ? `, ${dayFestivals.length} festival${dayFestivals.length === 1 ? '' : 's'}` : ''}`} aria-pressed={isSelected} aria-current={isToday ? 'date' : undefined} onClick={() => setSelectedDate(date)}>
                    <span className="festivalDayNumber">{day}</span>
                    {dayFestivals.length > 0 && <span className="festivalDayMarker"><i />{dayFestivals.length > 1 ? <b>{dayFestivals.length}</b> : null}</span>}
                  </button>
                );
              })}
            </div>
            <div className="festivalCalendarLegend"><span><i className="legendToday" />Today</span><span><i className="legendEvent" />Festival date</span><span>Number indicates multiple festivals</span></div>
          </section>

          <aside className="festivalQuickUpcoming" aria-labelledby="festivalQuickUpcomingTitle">
            <div className="festivalQuickHeading"><h2 id="festivalQuickUpcomingTitle">Festivals on {formatDate(selectedDate)}</h2><button type="button" onClick={() => document.getElementById('festivalUpcomingTitle')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>View all <ArrowRight size={14} /></button></div>
            {upcoming.length ? <div className="festivalQuickList">{upcoming.slice(0, 4).map(({ festival, occurrence }) => <button className="festivalQuickCard" type="button" key={`${festival.id}-${occurrence.startDate}`} onClick={() => openDetails(festival, occurrence)}><img src={festival.images?.[0]?.url || fallbackImage} alt="" loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} /><span className="festivalQuickInfo"><strong>{festival.name}</strong><small><CalendarDays size={12} />{formatOccurrence(occurrence)}</small><small><MapPin size={12} />{festival.regions.filter((region) => region !== 'Pan India').join(', ') || 'Pan India'}</small></span><ChevronRight size={16} /></button>)}</div> : <div className="festivalEmpty"><CalendarDays size={23} /><strong>No upcoming festivals listed.</strong></div>}
          </aside>

          <aside className="festivalDatePanel" aria-live="polite">
            <div className="festivalDatePanelHeading">
              <span className="festivalEyebrow">{search.trim() ? 'SEARCH RESULTS' : 'SELECTED DATE'}</span>
              <h2>{search.trim() ? `${searchResults.length} matching festivals` : formatDate(selectedDate)}</h2>
              {!search.trim() && <p>{selectedFestivals.length ? `${selectedFestivals.length} festival${selectedFestivals.length === 1 ? '' : 's'} on this date` : 'Indian Culture Explorer calendar'}</p>}
            </div>
            {loading ? <div className="festivalLoading"><span className="festivalSpinner" />Loading festival dates</div>
              : error ? <div className="festivalError" role="alert"><strong>Calendar unavailable</strong><p>{error}</p></div>
                : (search.trim() ? searchResults : selectedFestivals).length ? (
                  <div className="festivalResultList">{(search.trim() ? searchResults : selectedFestivals).map(({ festival, occurrence }) => <FestivalCard key={festival.id} festival={festival} occurrence={occurrence} onDetails={openDetails} />)}</div>
                ) : <div className="festivalEmpty"><CalendarDays size={23} /><strong>No major festival is listed for this date.</strong><span>Try another date, month, or filter.</span></div>}
          </aside>
        </div>

        <section className="festivalCultureFooter" aria-label="Festival calendar fact">
          <div className="festivalCultureFact"><span aria-hidden="true">💡</span><div><strong>Did you know?</strong><p>India celebrates over 2,000 festivals across regions, languages and communities throughout the year.</p></div></div>
          <div className="festivalFooterPhotos">{upcoming.slice(0, 4).map(({ festival, occurrence }) => <button type="button" key={`${festival.id}-${occurrence.startDate}`} onClick={() => openDetails(festival, occurrence)} aria-label={`Explore ${festival.name}`}><img src={festival.images?.[0]?.url || fallbackImage} alt={festival.name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} /></button>)}</div>
        </section>

        <section className="festivalYearOverview" aria-labelledby="festivalYearOverviewTitle">
          <div className="festivalYearHeading"><div><span className="festivalEyebrow">PLAN AHEAD</span><h2 id="festivalYearOverviewTitle">Festivals of {year}, month by month</h2><p>Browse every festival listed for this year. Open any card to learn about its traditions, food and regional celebrations.</p></div><span className="festivalYearCount">{annualFestivalMonths.reduce((count, monthItem) => count + monthItem.festivals.length, 0)} festivals</span></div>
          <div className="festivalYearMonths">{annualFestivalMonths.map(({ monthIndex, festivals: monthItems }) => {
            const pageIndex = festivalMonthPages[monthIndex] || 0;
            const isExpanded = Boolean(expandedFestivalMonths[monthIndex]);
            const totalPages = Math.ceil(monthItems.length / 4);
            const visibleMonthItems = isExpanded ? monthItems : monthItems.slice(pageIndex * 4, pageIndex * 4 + 4);
            return <section className="festivalYearMonth" key={monthIndex} aria-labelledby={`festival-month-${monthIndex}`}>
            <div className="festivalYearMonthHeading"><div><h3 id={`festival-month-${monthIndex}`}>{monthNames[monthIndex]} <span>{monthItems.length}</span></h3><p>Festivals and celebrations in {monthNames[monthIndex]}</p></div><div className="festivalMonthBrowse">{monthItems.length > 4 && <><button className="festivalMonthViewAll" type="button" onClick={() => setExpandedFestivalMonths((current) => ({ ...current, [monthIndex]: !isExpanded }))}>{isExpanded ? 'Show less' : 'View All'} <ArrowRight size={14} /></button>{!isExpanded && <><button type="button" aria-label={`Previous ${monthNames[monthIndex]} festivals`} disabled={pageIndex === 0} onClick={() => setFestivalMonthPages((current) => ({ ...current, [monthIndex]: Math.max(0, pageIndex - 1) }))}><ChevronLeft size={17} /></button><button type="button" aria-label={`More ${monthNames[monthIndex]} festivals`} disabled={pageIndex >= totalPages - 1} onClick={() => setFestivalMonthPages((current) => ({ ...current, [monthIndex]: Math.min(totalPages - 1, pageIndex + 1) }))}><ChevronRight size={17} /></button></>}</>}</div></div>
            <div className={`festivalYearCards${isExpanded ? ' is-expanded' : ''}`} id={`festival-cards-${monthIndex}`}>{visibleMonthItems.map(({ festival, occurrence }) => <article className="festivalYearCard" key={`${festival.id}-${occurrence.startDate}`}>
              <button className="festivalYearImageButton" type="button" onClick={() => openDetails(festival, occurrence)} aria-label={`Know more about ${festival.name}`}><img src={festival.images?.[0]?.url || fallbackImage} alt={festival.images?.[0]?.alt || festival.name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} /><span className="festivalImageDate"><CalendarDays size={12} />{formatOccurrence(occurrence)}</span></button>
              <div className="festivalYearCardBody"><h4>{festival.name}</h4><div className="festivalCardBadges">{festival.tags.slice(0, 2).map((tag) => <span className={`festivalBadge festivalBadge-${tag.toLowerCase()}`} key={tag}>{tag}</span>)}</div><p className="festivalYearRegion"><MapPin size={12} />{festival.regions.filter((region) => region !== 'Pan India').join(' · ') || 'Across India'}</p><button className="festivalKnowMore" type="button" onClick={() => openDetails(festival, occurrence)}>Know More <ArrowRight size={15} /></button></div>
            </article>)}</div>
          </section>;
          })}</div>
        </section>

        <section className="festivalMonthFestivals" aria-labelledby="festivalMonthFestivalsTitle">
          <div className="festivalSectionHeading">
            <div><span className="festivalEyebrow">BROWSE BY MONTH</span><h2 id="festivalMonthFestivalsTitle">Festivals in {monthNames[month]} {year}</h2></div>
            <span>{monthFestivals.length} {monthFestivals.length === 1 ? 'festival' : 'festivals'}</span>
          </div>
          {monthFestivals.length ? <div className="festivalMonthFestivalGrid">
            {monthFestivals.map(({ festival, occurrence }) => <FestivalCard key={festival.id} festival={festival} occurrence={occurrence} onDetails={openDetails} />)}
          </div> : <div className="festivalEmpty festivalMonthEmpty"><CalendarDays size={23} /><strong>No festivals match this month.</strong><span>Choose another month or clear some filters.</span></div>}
        </section>

        <section className="festivalStatsSection" aria-labelledby="festivalStatsTitle">
          <div className="festivalSectionHeading"><div><span className="festivalEyebrow">A QUICK LOOK</span><h2 id="festivalStatsTitle">This Month in Indian Culture</h2></div><span>{monthNames[month]} {year}</span></div>
          <div className="festivalStatsGrid">
            <StatTile label="Festivals this month" value={stats.total} detail="Matching current filters" />
            <StatTile label="States represented" value={stats.states} detail="Across the listed celebrations" />
            <StatTile label="Categories" value={stats.categories} detail="In this month’s calendar" />
            <StatTile label="Most represented region" value={stats.mostCelebrated} detail={nextMajor ? `Next major: ${nextMajor.festival.name}` : 'No upcoming major date listed'} />
          </div>
        </section>

        <section className="festivalUpcomingSection" aria-labelledby="festivalUpcomingTitle">
          <div className="festivalSectionHeading"><div><span className="festivalEyebrow">WHAT’S NEXT</span><h2 id="festivalUpcomingTitle">Upcoming Festivals</h2></div><span>Next 5 listed dates</span></div>
          {upcoming.length ? <div className="festivalUpcomingGrid">{upcoming.map(({ festival, occurrence }) => {
            const daysRemaining = Math.max(0, Math.ceil((fromISODate(occurrence.startDate) - fromISODate(today)) / 86400000));
            return <button className="festivalUpcomingCard" type="button" key={`${festival.id}-${occurrence.startDate}`} onClick={() => { setViewMonth(new Date(Number(occurrence.year), Number(occurrence.startDate.slice(5, 7)) - 1, 1)); setSelectedDate(occurrence.startDate); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <span className="festivalUpcomingDate">{formatDate(occurrence.startDate, { month: 'short', day: 'numeric' })}</span><strong>{festival.name}</strong><span>{festival.regions.filter((region) => region !== 'Pan India').join(' · ') || 'Across India'}</span><small>{daysRemaining === 0 ? 'Happening now' : `${daysRemaining} days remaining`}</small>
            </button>;
          })}</div> : <div className="festivalEmpty festivalUpcomingEmpty">No upcoming festivals are listed for the selected data set.</div>}
        </section>
      </main>

      {selectedFestival && (
        <div className="festivalModalBackdrop" onClick={closeDetails}>
          <section className="festivalDetailModal" role="dialog" aria-modal="true" aria-labelledby="festivalModalTitle" onClick={(event) => event.stopPropagation()}>
            <button className="festivalModalClose" type="button" onClick={closeDetails} aria-label="Close festival details"><X size={20} /></button>
            <div className="festivalModalHero"><img src={selectedFestival.images?.[0]?.url || fallbackImage} alt={selectedFestival.images?.[0]?.alt || selectedFestival.name} onError={(event) => { event.currentTarget.src = fallbackImage; }} loading="lazy" /><span>{selectedFestival.category}</span></div>
            <div className="festivalModalContent">
              <span className="festivalEyebrow">{selectedFestival.traditionType} · {selectedFestival.scale}</span>
              <h2 id="festivalModalTitle">{selectedFestival.name}</h2>
              <div className="festivalDetailMeta"><span><CalendarDays size={16} />{formatOccurrence(selectedOccurrence)}</span><span><MapPin size={16} />{selectedFestival.regions.join(' · ')}</span></div>
              <div className="festivalModalActions"><button type="button" className="festivalSaveButton" onClick={() => toggleFavorite(selectedFestival)}><Heart size={16} fill={favoriteIds.includes(selectedFestival.id) ? 'currentColor' : 'none'} />{favoriteIds.includes(selectedFestival.id) ? 'Saved to My Festivals' : 'Save festival'}</button><button type="button" className="festivalReminderButton" onClick={() => addReminder(selectedFestival, selectedOccurrence)}><Bell size={16} />Remind me</button></div>
              {reminderMessage && <p className="festivalReminderMessage" role="status">{reminderMessage}</p>}
              <div className="festivalDetailColumns">
                <section><h3>About</h3><p>{selectedFestival.description}</p></section>
                <section><h3>Cultural significance</h3><p>{selectedFestival.significance}</p></section>
                <section><h3>History & origin</h3><p>{selectedFestival.history}</p></section>
                <section><h3>How it is celebrated</h3><ul>{selectedFestival.traditions.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Important rituals & customs</h3><ul>{selectedFestival.rituals.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Traditional food</h3><ul>{selectedFestival.traditionalFoods.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Traditional clothing</h3><ul>{selectedFestival.traditionalClothing.map((item) => <li key={item}>{item}</li>)}</ul></section>
                <section><h3>Music & dance</h3><p>{[...selectedFestival.music, ...selectedFestival.dances].join(' · ') || 'Regional traditions vary.'}</p></section>
                <section><h3>Duration</h3><p>{selectedFestival.duration}</p></section>
                <section><h3>Best places to experience it</h3><p>{selectedFestival.bestPlaces.join(' · ')}</p></section>
                <section><h3>Related festivals</h3><div className="festivalRelatedLinks">{selectedFestival.relatedFestivals.map((id) => { const related = festivalRecords.find((item) => item.id === id); return related ? <button type="button" key={id} onClick={() => openDetails(related, related.dates.find((item) => item.year === year) || related.dates[0])}>{related.name}<ArrowRight size={13} /></button> : null; })}</div></section>
                <section><h3>Related states</h3><div className="festivalRelatedLinks">{selectedFestival.relatedStates.map((state) => <button type="button" key={state} onClick={() => navigate(`/state/${encodeURIComponent(state)}`)}>{state}<ArrowRight size={13} /></button>)}</div></section>
              </div>
              <section className="festivalSources"><h3>Sources</h3>{selectedFestival.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={14} /></a>)}</section>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
