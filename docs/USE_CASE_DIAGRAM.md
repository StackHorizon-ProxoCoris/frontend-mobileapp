# Use Case Diagrams

This document provides an actor-oriented view of SIAGA's current capabilities. The diagrams below use exported PlantUML assets so the documentation shows standard UML use case notation with stickman actors and system boundaries directly in Markdown.

---

## 1. Actor Summary

| Actor | Role in the System |
|---|---|
| Citizen | Reports issues, monitors community activity, joins positive actions, and receives alerts |
| Government Officer | Triages incoming reports, updates statuses, submits resolution proof, and monitors operational dashboards |
| Super Admin | Manages users, roles, moderation, analytics, and system-level configuration |
| Supabase Auth | Supports authentication, session validation, and password recovery |
| Gemini AI | Supports the safety and disaster-preparedness chat assistant |
| BMKG API | Supplies real-time earthquake alert data |
| Expo Push | Delivers native push notifications to mobile devices |

---

## 2. System Overview Use Case Diagram

![System Overview Use Case Diagram](./usecase_diagram/system%20overview.png)

---

## 3. Citizen Use Case Diagram

![Citizen Use Case Diagram](./usecase_diagram/citizen%20experience.png)

---

## 4. Government and Admin Use Case Diagram

![Government and Admin Use Case Diagram](./usecase_diagram/Goverment%20and%20admin.png)

---

## 5. Scope Notes

- The diagrams focus on capabilities already represented in the current mobile app and backend routes.
- `Citizen` and `Government Officer` share the same authentication flow, but land on different dashboards based on role.
- `Submit Resolution Proof` is modeled as an `extend` relationship because it is a specialized outcome of updating a report to a resolved state.
- External services are shown as supporting actors to clarify which parts of the platform depend on Supabase Auth, Gemini, BMKG, and Expo Push.
- Diagram assets are loaded from `docs/usecase_diagram/` so they render consistently on GitHub after each push.
