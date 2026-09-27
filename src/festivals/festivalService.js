import { festivalRecords } from './festivalData.js';

const apiBase = (import.meta.env.VITE_FESTIVAL_API_BASE || '').replace(/\/$/, '');
const FAVORITES_KEY = 'indian-diversity-festival-favorites';
const REMINDERS_KEY = 'indian-diversity-festival-reminders';

function getOccurrencesForYear(festival, year) {
  return festival.dates.filter((occurrence) => occurrence.year === Number(year));
}

function matchesMonth(festival, year, month) {
  if (month === undefined || month === null || month === '') return true;
  const monthStart = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;
  const monthEnd = new Date(Date.UTC(Number(year), Number(month) + 1, 0)).toISOString().slice(0, 10);
  return getOccurrencesForYear(festival, year).some((occurrence) => occurrence.startDate <= monthEnd && occurrence.endDate >= monthStart);
}

function filterLocal(records, filters = {}) {
  const query = (filters.search || '').trim().toLocaleLowerCase();
  const requestedTag = filters.tag || '';
  const favoriteIds = filters.favoriteIds ? new Set(filters.favoriteIds) : null;

  return records.filter((festival) => {
    const year = filters.year ? Number(filters.year) : null;
    if (year && !getOccurrencesForYear(festival, year).length) return false;
    if (year && !matchesMonth(festival, year, filters.month)) return false;
    if (filters.state && !festival.states.includes(filters.state) && !festival.regions.includes(filters.state)) return false;
    if (filters.category && festival.category !== filters.category) return false;
    if (filters.type && festival.traditionType !== filters.type) return false;
    if (filters.scale && festival.scale !== filters.scale) return false;
    if (requestedTag && !festival.tags.includes(requestedTag)) return false;
    if (favoriteIds && !favoriteIds.has(festival.id)) return false;
    if (!query) return true;
    const searchable = [festival.name, festival.category, festival.traditionType, ...festival.states, ...festival.regions, ...festival.tags].join(' ').toLocaleLowerCase();
    return searchable.includes(query);
  });
}

async function request(path, options) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  });
  if (!response.ok) throw new Error(`Festival service returned ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

function queryString(filters = {}) {
  const params = new URLSearchParams();
  for (const key of ['year', 'month', 'state', 'category', 'type', 'scale', 'tag', 'search']) {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') params.set(key === 'search' ? 'q' : key, filters[key]);
  }
  return params.toString();
}

export const festivalService = {
  async list(filters = {}) {
    if (apiBase) {
      const query = queryString(filters);
      return request(`/api/festivals${query ? `?${query}` : ''}`);
    }
    return filterLocal(festivalRecords, filters);
  },

  async getById(id) {
    if (apiBase) return request(`/api/festivals/${encodeURIComponent(id)}`);
    return festivalRecords.find((festival) => festival.id === id) || null;
  },

  async getByDate(date) {
    if (apiBase) return request(`/api/festivals/date/${encodeURIComponent(date)}`);
    return festivalRecords.filter((festival) => festival.dates.some((occurrence) => occurrence.startDate <= date && occurrence.endDate >= date));
  },

  async search(query, filters = {}) {
    if (apiBase) return request(`/api/festivals/search?${new URLSearchParams({ q: query, ...filters })}`);
    return filterLocal(festivalRecords, { ...filters, search: query });
  },

  async getUpcoming(fromDate, limit = 5, filters = {}) {
    if (apiBase) return request(`/api/festivals/upcoming?${new URLSearchParams({ fromDate, limit: String(limit), ...filters })}`);
    return festivalRecords
      .flatMap((festival) => festival.dates
        .filter((occurrence) => occurrence.endDate >= fromDate)
        .map((occurrence) => ({ festival, occurrence })))
      .sort((a, b) => a.occurrence.startDate.localeCompare(b.occurrence.startDate))
      .slice(0, limit);
  },

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch {
      return [];
    }
  },

  setFavorite(id, isFavorite) {
    const favorites = new Set(this.getFavorites());
    if (isFavorite) favorites.add(id);
    else favorites.delete(id);
    const updated = [...favorites];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  },

  getReminders() {
    try {
      return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  setReminder(reminder) {
    const reminders = this.getReminders().filter((item) => !(item.festivalId === reminder.festivalId && item.festivalDate === reminder.festivalDate));
    reminders.push(reminder);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    return reminders;
  },

  createFestival(festival) {
    return request('/api/admin/festivals', { method: 'POST', body: JSON.stringify(festival) });
  },

  updateFestival(id, festival) {
    return request(`/api/admin/festivals/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(festival) });
  },

  deleteFestival(id) {
    return request(`/api/admin/festivals/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  addYearDates(id, dates) {
    return request(`/api/admin/festivals/${encodeURIComponent(id)}/dates`, { method: 'POST', body: JSON.stringify(dates) });
  }
};
