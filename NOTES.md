# Notes

Fill this in as you go — it carries as much weight in review as the code.
Keep it short; bullets are fine.

## What I completed

<!-- Required items done, and anything from the optional list. -->

- Implemented the car inventory list using the provided GraphQL mock API.
- Added responsive car images for mobile (≤639px), tablet (640–1023px), and desktop (≥1024px) viewports.
- Used Material UI components for the interface and form controls.
- Added a form to create cars, with required-field validation and handling for API validation errors.
- Added model search with a debounce and sorting by year, newest first.
- Implemented useCars() to keep data-fetching and mutation logic outside the UI components.
- Added tests for components and the data hook, including relevant failure scenarios.

## What I left out, and why

<!-- Scope you consciously cut. Naming a trade-off reads better than silence. -->

- Server-side filtering, a separate year filter, and a car detail route are not included. They were optional extensions, so I prioritised completing the required list, create, search, sort, and test flows within the challenge scope.
- Pagination is not included because the mock inventory is small and the challenge does not require it.

## Decisions and trade-offs

<!-- Structure, state management, where filtering happens, what you tested and
     what you didn't, any library you added and why. -->

- Data access is isolated in useCars() so presentation components do not own GraphQL operations.
- Search and sorting are derived from the fetched list on the client. This keeps the implementation simple and avoids storing redundant copies of filtered or sorted data.
- The search input is debounced so the filtering work does not run on every keystroke.
- After a successful CreateCar mutation, the Apollo cache is updated so the newly created car appears in the existing list without an additional network request.
- Loading, request errors, an empty inventory, no search matches, and form/API validation errors are handled as distinct states.
- Tests use accessible roles and visible text where possible, focusing on user-observable behaviour rather than component implementation details.

## If I had another day

<!-- What you would do next, in priority order. -->

- Add more coverage for responsive image selection, sorting, and cache-update edge cases.
- Consider server-side filtering and pagination if the inventory became large.
- Review accessibility and responsive behaviour in a broader set of browsers and viewport sizes.

## Anything you should know to run it

<!-- Deviations from `npm install && npm run dev`, if any. -->
