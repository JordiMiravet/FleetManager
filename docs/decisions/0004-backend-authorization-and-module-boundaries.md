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

