# Festival Calendar Module

The calendar starts from `festivalData.js` through `festivalService.js`. The service uses the local records by default; set `VITE_FESTIVAL_API_BASE` to switch reads and admin mutations to an Express API without changing the page component.

The browser-only version stores favorites and reminder selections in localStorage. These are device-local preferences, not authenticated user records or scheduled notifications. Add authentication, reminder delivery, and admin authorization in the backend before exposing those operations to accounts.

## API contract

- `GET /api/festivals?year=&month=&state=&category=&type=&scale=&tag=&q=` lists filtered records.
- `GET /api/festivals/:id` returns one festival.
- `GET /api/festivals/date/:date` returns all records whose year-specific date range covers the ISO date.
- `GET /api/festivals/month/:month?year=` and `GET /api/festivals/year/:year` return calendar records.
- `GET /api/festivals/search?q=` searches names, states, regions and categories.
- `POST /api/admin/festivals`, `PUT /api/admin/festivals/:id`, `DELETE /api/admin/festivals/:id`, and `POST /api/admin/festivals/:id/dates` are exposed by the service adapter for a future authenticated admin API.
- `POST /api/festivals/:id/favorite`, `DELETE /api/festivals/:id/favorite`, `GET /api/user/favorites`, and `POST /api/festivals/:id/reminders` require user authentication and are not implemented by this frontend-only repository.

`festivalDocument.schema.json` is a MongoDB `$jsonSchema` validator example. Recommended indexes are a unique `slug`, multikey `dates.year`, `dates.startDate`/`dates.endDate`, `states`, `regions`, and `category`. Keep each lunar-calendar date as an explicit year-specific occurrence; do not extrapolate it from another year.
