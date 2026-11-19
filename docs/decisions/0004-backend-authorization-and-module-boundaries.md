# ADR 0004: Backend authorization rules and module boundaries

Back to the [ADR index](index.md).

- **Status:** Accepted
- **Date:** 2026-11-08
- **Related:** Epic #639, tasks #640 to #647 and #648. See the [Architecture Guide](../architecture.md) for the resulting structure.

## Context

The NestJS backend worked, but several rules documented for the application were not enforced on the server, and the code that implemented them was hard to maintain:

- A user with shared access to a vehicle could invite other users, edit any field of the vehicle and trigger the deletion of its events before the ownership was verified.
- Any authenticated user could create an event for any `vehicleId`, and only the creator of an event could edit or delete it, even though everyone with access to the vehicle could see it.
- The scheduling rules of events (a valid time range and no overlaps) were validated only by the frontend.
- The query that decides which vehicles a user can access was repeated in five places across the vehicle and events services, and the vehicle controller contained business logic and called Firebase directly.
- Errors were reported inconsistently: a duplicated plate ended in a generic 500 error, and missing vehicles returned an empty successful response.

The improvement had to be done without changing routes, methods or the shape of successful responses, and without modifying the frontend.

## Decision

Enforce the authorization rules on the server, centralize the access logic in a single module, keep controllers thin and report errors consistently. The changes were made in independent tasks (#640 to #647), each with its own pull request.

### Authorization rules

The rules documented in the README are enforced by the backend:

- **Owner:** can edit every field of the vehicle, share it and delete it.
- **Shared user:** can see the vehicle, update only its `location` and remove themselves from it. Changing the name, model, plate or image returns 403, but resending the stored values is accepted, so a client that sends the whole vehicle when moving it keeps working. Sharing the vehicle returns 403.
- **User without access:** receives 404, so the existence of the vehicle or the event is not revealed.
- **Deleting a vehicle:** the ownership is part of the deletion filter, so nothing is deleted when the user is not the owner. A shared user receives 403. When the vehicle is deleted, all its events are deleted, whoever created them.
- **Sharing and unsharing:** adding and removing a shared user are single atomic updates (`$push` with a "not already shared" condition, and `$pull`) instead of reading the vehicle, checking it and saving it.

### Event editing and scheduling rule

Events belong to a vehicle, not to the user who created them:

- Creating an event, or moving it to another vehicle, requires access to that vehicle.
- Every user with access to the vehicle of an event can edit and delete it. Editing or deleting the vehicle itself remains owner-only.
- The end time must be after the start time (400), and an event cannot overlap another event of the same vehicle and date (409). Events that only touch each other are allowed, and the event being updated is ignored in the overlap check.
- When updating, the vehicle, date and times are validated only if they actually change, so editing the title of an existing event is never blocked.
- Dates use the `YYYY-MM-DD` format and times the `HH:mm` format, the ones the frontend already sends.

### Module boundaries

- **`VehicleAccessModule`:** owns the rule that decides which vehicles a user can access (the owner and the users the vehicle is shared with), the accessible vehicle ids and the ownership check. It exports the access service, and both the vehicle and events services use it, so the query exists in a single place.
- **Vehicles depend on events, not the other way round:** the vehicle module imports the events module and calls the events service to delete the events of a deleted vehicle. The events module no longer registers the vehicle model and the vehicle module no longer registers the event model. There are no circular module dependencies.
- **`VehicleSharingService`:** holds the logic of sharing and unsharing a vehicle, so the controller only delegates to services and no longer depends on Firebase.
- **`FirebaseModule`:** a global module that initializes Firebase Admin from the validated configuration and exposes token verification and user lookup by email. Only Firebase errors that mean the user cannot be found are reported as 404.

### Validation and errors

- The environment variables are validated at startup, and the request bodies and the `:id` route parameters are validated with DTOs and an id pipe, so invalid requests are rejected with 400.
- A global exception filter keeps the response of HTTP exceptions, maps database errors (duplicated keys to 409, cast and validation errors to 400) and returns a generic message for unexpected errors, which are logged with their stack.
- The vehicle service throws `NotFoundException` instead of returning an empty successful response, as the events service already did.

## Alternatives considered

- **Keep the shared-access query in every service:** it required no change, but the rule that decides who can access a vehicle would remain duplicated in five places and could diverge. It was rejected.
- **Make the vehicle and events modules depend on each other (`forwardRef`):** it would have allowed events to call the vehicle service, but it creates a circular dependency that is hard to reason about. It was rejected in favor of a one-way dependency plus the shared access module.
- **Delete the events through an event emitter (`@nestjs/event-emitter`):** it fully decouples the modules, but it adds a package and makes the deletion implicit. It was rejected because a direct call from vehicles to events is simpler and explicit.
- **Merge vehicles and events into a single module:** it removes the dependency, but it mixes two domains with different rules. It was rejected.
- **Only the creator of an event can edit or delete it (previous behavior):** it was rejected because everyone with access to the vehicle can see its events, and the README states that users with granted access can manage usage events.
- **Only the owner can manage events:** it would block the main use of sharing a vehicle, which is scheduling its usage. It was rejected.
- **Delete the events before the vehicle:** a failure after the events are deleted would leave a vehicle without its events. Deleting the vehicle first was chosen, so a failure can never do that.
- **Enforce the rules only in the frontend:** the API can be called without the interface, so the server must enforce them. The frontend rules are kept and the server applies the same ones.
