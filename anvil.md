### Project name
car-rental-backend

### Project description
This is the backend half of a car renting web application.
This application will manage clients, cars, rentals, reservations, car maintenance schedules and accidents
It is currently in very early development

### Technologies used
1. Languages : Node.js + Typescript
2. Framework : Express.js
3. Database : Typeorm + MySql

### Folder structure

These are the folder names that contain important files in the application, (no /src directory exists in the project) :

- /routers : contains the project express routers, each router belongs to a specific domain/entity (routers does not have any business logic of any kind, they just handoff to their respective service method, the service handles all)
- /services : contains the service classes that handle business logic
- /entities : contains typeorm database entity declarations
- /repositories : contains typeorm repository declarations (just one file that contains repos for all entities)
- /dto : contains typescript interface declarations to use in services to determine body fields
- /validators : contains JOI validators used in routers to validate the request body
- /__tests__ : contains unit tests
- jest.config.js : contains the setup for unit testing
- data-source.ts : contains the typeorm database config and initialization
- index.ts : the main entry point of the app

All these folders contain multiple files, each file represents an entity/domain (except the repositories folder)
