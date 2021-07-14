# Print service control panel
Front-end companion for [print-service](https://github.com/ussserrr/print-service).


## Demo
Desktop:

![desktop](/demo/desktop/safari.gif)


Mobile:

![mobile](/demo/mobile/safari.gif)


## Technologies overview
 - Latest & greatest NodeJS (v16 atm)
 - React with Hooks
 - First-class latest TypeScript support: strong typing system
 - Base Web components library. Advantages:
   - Nice look :)
   - Light/dark theme with hot swapping
   - Actively developing by folks of Uber
   - CSS-in-JS approach – modular structure, no separate style files
   - Convenient features (keyboard navigation, tooltips, accessibility, i18n)
   - Adaptive desktop/mobile design – only minor, mostly layout, adjustments are needed
 - urql GraphQL engine
   - Fits well with the React hooks paradigma
   - Built-in smart cache (can be easily further improved by enabling already shipped *normalized* caching mechanism)
   - File uploads (multipart spec)
   - Support GraphQL extensions convention
   - Works well with errors
 - Single-page progressive web app (SPA PWA): installable as a regular application
 - Client-side routing by react-router with a centralized routing config
 - Breadcrumbs (including dynamic) by use-react-router-breadcrumbs
 - Page title (including dynamic) by react-router-title
 - Luxon instead of Moment.js – modern dates managing package
 - Testing-ready configuration (via Jest)
 - Smart linter provided by create-react-app
 - Docker/Kubernetes-enabled solution
   - Small resulting image size – approx. 27 Mb including Nginx static server

### Some software strategies
 - Fetch API for REST requests
 - Lodash library for neat yet expressive code (where it is applicable)
 - Session storage for search filters
 - Same auto-generated GraphQL schema definitions as on server
 - Generic form/dialog widgets (HOC) suitable for typical data models


## Useful commands
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). See its docs for possible actions/documentation.

### Start
Development mode:
```bash
$ REACT_APP_API_URL=http://192.168.1.214:4000/api npm run start
```


In production, intended to be supplied with Docker-Nginx + Kubernetes. See [Dockerfile](/Dockerfile), [k8s configs](/k8s).

## Roadmap
See in-place TODOs to get a look on what can be improved in the future.
