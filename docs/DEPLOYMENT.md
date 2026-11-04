# Deployment

The existing `chatgpt.site` artifact is a static frontend deployment and cannot be assumed to run Spring Boot or proxy API traffic. Deploy `apps/api` to a Java/container-capable HTTPS service and PostgreSQL to a managed or controlled database service. Use a separate API domain with exact CORS configuration, or preferably a same-site reverse proxy that presents `/api` under the frontend domain.

Before production: configure HTTPS, strong database credentials and session settings, migrate before release, restrict actuator exposure, back up PostgreSQL, add error monitoring, and verify a rollback path. No production API deployment has been performed.
