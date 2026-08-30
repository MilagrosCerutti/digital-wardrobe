\# Architecture

\#\# 1\. Purpose

This document defines the technical architecture, structural organization, development standards, security principles, testing strategy, and implementation rules for the project.

The architecture exists to keep the application:

\- understandable;  
\- maintainable;  
\- secure;  
\- testable;  
\- modular;  
\- scalable within the expected project scope;  
\- consistent with the approved product requirements;  
\- aligned with the university's full-stack development requirements.

The architecture must provide sufficient engineering quality without introducing unnecessary complexity or enterprise-level infrastructure that is not justified by the application.

\---

\#\# 2\. Architectural Principles

The following principles apply to the entire project.

\#\#\# 2.1 Separation of Concerns

Each layer and module must have a clearly defined responsibility.

Business logic must not be placed directly inside:

\- routes;  
\- controllers;  
\- React components;  
\- database queries;  
\- form handlers.

Responsibilities must remain separated across the appropriate layers.

\#\#\# 2.2 Layered Architecture

The backend must follow a layered architecture:

\`\`\`text  
Route  
  ↓  
Middleware  
  ↓  
Controller  
  ↓  
Service  
  ↓  
Repository  
  ↓  
Database  
Each layer must communicate only with the layers it is expected to know about.

Controllers must not directly access the database.

Frontend components must not directly access the database or backend persistence layer.

\#\#\# \*\*2.3 Feature-Based Frontend Organization\*\*

The frontend must combine shared application infrastructure with feature-based organization.

Application-specific functionality must be grouped by feature:

auth    
closet    
inspire-me    
style-it    
my-looks    
doll    
admin

This prevents the frontend from becoming a collection of unrelated files and allows each major feature to evolve independently.

\#\#\# \*\*2.4 Security by Design\*\*

Security must be considered during implementation rather than added after the application is complete.

Authentication, authorization, ownership validation, password protection, input validation, and secure error handling are architectural requirements.

\#\#\# \*\*2.5 Backend as the Source of Truth\*\*

Business rules must be enforced by the backend.

The frontend may perform validation to improve the user experience, but frontend validation must never be considered a security or business-rule boundary.

The backend must independently validate all important rules.

\#\#\# \*\*2.6 Simplicity Over Overengineering\*\*

The project must use the simplest architecture that adequately solves the actual problem.

The following must not be introduced unless a concrete requirement justifies them:

\* microservices;    
\* message queues;    
\* event buses;    
\* Kubernetes;    
\* distributed systems;    
\* unnecessary state-management infrastructure;    
\* unnecessary abstraction layers.

The project should demonstrate engineering judgment rather than unnecessary technical complexity.

\#\#\# \*\*2.7 Explicit Over Clever\*\*

Readable and explicit code is preferred over overly abstract or clever implementations.

Premature abstraction must be avoided.

Abstractions should be introduced when a real recurring responsibility exists.

\---

\#\# \*\*3\\. System Architecture\*\*

The application follows a full-stack client-server architecture.

┌───────────────────────────────────────┐    
│              Frontend                 │    
│                                       │    
│ React \\+ Vite                          │    
│ React Router                          │    
│ TanStack Query                        │    
│ Tailwind CSS                          │    
│ CSS Modules when justified            │    
└───────────────────┬───────────────────┘    
                    │    
                    │ HTTP / REST API    
                    │ Authorization: Bearer \\\<JWT\\\>    
                    ↓    
┌───────────────────────────────────────┐    
│               Backend                 │    
│                                       │    
│ Express                               │    
│ Routes                                │    
│ Middlewares                           │    
│ Controllers                           │    
│ Services                              │    
│ Repositories                          │    
│ Validators                            │    
└───────────────────┬───────────────────┘    
                    │    
                    │    
                    ↓    
┌───────────────────────────────────────┐    
│             Persistence               │    
│                                       │    
│ Supabase                              │    
│ PostgreSQL                            │    
│ Storage where required                │    
└───────────────────────────────────────┘

The backend is responsible for:

\* authentication;    
\* authorization;    
\* business rules;    
\* validation;    
\* recommendation logic;    
\* persistence;    
\* data integrity;    
\* API responses.

The frontend is responsible for:

\* presentation;    
\* navigation;    
\* user interaction;    
\* local UI state;    
\* server-state consumption;    
\* displaying validation and API errors;    
\* communicating with the backend through the API layer.

\---

\#\# \*\*4\\. Technology Responsibilities\*\*

\#\#\# \*\*4.1 Frontend\*\*

The frontend uses:

\* React;    
\* Vite;    
\* React Router;    
\* TanStack Query;    
\* Axios;    
\* TypeScript;    
\* Tailwind CSS;    
\* CSS Modules when justified.

React is responsible for the user interface and component model.

Vite is responsible for frontend development and build tooling.

React Router is responsible for navigation and route protection.

TanStack Query is responsible for server state.

Axios is responsible for HTTP communication through a centralized API/service layer.

\#\#\# \*\*4.2 Backend\*\*

The backend uses:

\* Node.js;    
\* Express;    
\* TypeScript;    
\* Express Router;    
\* middleware-based request processing;    
\* JWT authentication;    
\* bcrypt password hashing;    
\* Jest;    
\* Supertest.

\#\#\# \*\*4.3 Persistence\*\*

The persistence layer uses:

\* Supabase;    
\* PostgreSQL.

Supabase provides the hosted PostgreSQL persistence environment and may also provide storage capabilities where required by the product.

The application must preserve a clear repository boundary around persistence operations.

\---

\#\# \*\*5\\. Backend Architecture\*\*

The backend follows strict layered architecture.

backend/    
└── src/    
    ├── config/    
    ├── controllers/    
    ├── middlewares/    
    ├── models/    
    ├── repositories/    
    ├── routes/    
    ├── services/    
    ├── types/    
    ├── utils/    
    ├── validators/    
    ├── app.ts    
    └── server.ts

\#\#\# \*\*5.1 Routes\*\*

Routes define HTTP endpoints and connect them with middleware and controllers.

Routes must not contain business logic.

Example responsibility:

POST /api/v1/auth/login    
        ↓    
validation middleware    
        ↓    
authentication controller

Routes should remain small and declarative.

\#\#\# \*\*5.2 Middlewares\*\*

Middlewares handle cross-cutting HTTP concerns.

Examples include:

\* authentication;    
\* authorization;    
\* request validation;    
\* CORS;    
\* error handling;    
\* request processing concerns.

Authentication middleware verifies the JWT.

Authorization middleware verifies the authenticated user's role and, when necessary, ownership.

\#\#\# \*\*5.3 Controllers\*\*

Controllers are responsible for translating HTTP requests into application operations and translating service results into HTTP responses.

Controllers may:

\* read request parameters;    
\* read request body;    
\* invoke services;    
\* return HTTP responses.

Controllers must not:

\* execute business rules;    
\* calculate business values;    
\* directly query the database;    
\* contain complex authorization logic;    
\* duplicate validation rules already belonging to services or validators.

\#\#\# \*\*5.4 Services\*\*

Services contain application and business logic.

This is one of the most important architectural rules.

Business rules must live in services rather than only in controllers or forms.

Examples:

clothingService    
outfitService    
inspireMeService    
dollService    
userService    
adminService

The recommendation engine and compatibility calculations must be implemented as testable business logic within the appropriate service/domain layer.

\#\#\# \*\*5.5 Repositories\*\*

Repositories isolate persistence operations.

Repositories are responsible for:

\* database queries;    
\* inserts;    
\* updates;    
\* deletes;    
\* persistence-specific filtering;    
\* persistence-specific mapping.

Repositories must not contain application-level business rules.

For example:

Service:    
"Can this user modify this clothing item?"

Repository:    
"Find clothing item X belonging to user Y."

\#\#\# \*\*5.6 Validators\*\*

Validators are responsible for validating the structure and basic validity of incoming data.

Validation must exist on the backend even if equivalent frontend validation exists.

Examples:

\* required fields;    
\* valid formats;    
\* valid enum/catalog values;    
\* string lengths;    
\* numeric ranges;    
\* request shape.

Business rules remain the responsibility of services.

\#\#\# \*\*5.7 Models\*\*

Models represent domain and persistence-related data structures as appropriate to the selected implementation.

Database models and API DTOs must not automatically be treated as the same concept.

\---

\#\# \*\*6\\. Backend Request Flow\*\*

A protected request should follow this general flow:

HTTP Request    
    ↓    
Route    
    ↓    
Request Validation    
    ↓    
Authentication    
    ↓    
Authorization    
    ↓    
Controller    
    ↓    
Service    
    ↓    
Repository    
    ↓    
PostgreSQL / Supabase    
    ↓    
Repository    
    ↓    
Service    
    ↓    
Controller    
    ↓    
HTTP Response

Global error handling must be applied centrally.

No controller should manually implement a different error-response strategy for every endpoint.

\---

\#\# \*\*7\\. API Architecture\*\*

The backend exposes a versioned REST API.

The API base path is:

/api/v1

Example:

GET /api/v1/clothing    
GET /api/v1/clothing/:id    
POST /api/v1/clothing    
PATCH /api/v1/clothing/:id    
DELETE /api/v1/clothing/:id

HTTP methods must represent the intended operation.

\#\#\# \*\*7.1 API Principles\*\*

The API must provide:

\* consistent HTTP methods;    
\* meaningful status codes;    
\* consistent success responses;    
\* consistent error responses;    
\* request validation;    
\* authentication where required;    
\* authorization where required;    
\* pagination where appropriate;    
\* filtering where appropriate;    
\* ownership validation for private resources.

\#\#\# \*\*7.2 Error Responses\*\*

API errors must use consistent JSON structures.

Example:

{    
  "error": "A clothing item with the specified id was not found."    
}

Validation errors should normally use an appropriate 4xx status.

Internal implementation details must not be exposed to the client.

The API must not expose:

\* password hashes;    
\* JWT secrets;    
\* database internals;    
\* stack traces;    
\* sensitive configuration.

\---

\#\# \*\*8\\. API Versioning\*\*

All application endpoints must be exposed under:

/api/v1

Future breaking API changes may introduce:

/api/v2

The current project must not create unnecessary versions before a real breaking change exists.

\---

\#\# \*\*9\\. Authentication Architecture\*\*

The application uses JWT-based authentication.

\#\#\# \*\*9.1 Registration\*\*

Registration must:

1\. validate the incoming data;    
2\. verify that the email is not already registered;    
3\. hash the password with bcrypt;    
4\. persist the user;    
5\. never store the plain-text password.

\#\#\# \*\*9.2 Login\*\*

Login must:

1\. validate credentials;    
2\. retrieve the user;    
3\. verify the password using bcrypt;    
4\. verify that the account is active;    
5\. generate a JWT;    
6\. return the authenticated session information required by the frontend.

\#\#\# \*\*9.3 JWT\*\*

The JWT must contain only the minimum information required for authentication and authorization.

The JWT must never contain:

\* passwords;    
\* password hashes;    
\* secrets;    
\* unnecessary sensitive personal information.

Authenticated API requests must use:

Authorization: Bearer \\\<JWT\\\>

The frontend may use an Axios interceptor or a centralized service mechanism to attach the token.

The exact client-side token storage mechanism must be selected with security considerations and documented during implementation. Regardless of storage strategy, the API contract remains:

Authorization: Bearer \\\<JWT\\\>

\#\#\# \*\*9.4 Authentication Middleware\*\*

Authentication middleware must:

1\. obtain the JWT;    
2\. verify its signature;    
3\. verify expiration;    
4\. extract the authenticated identity;    
5\. attach the authenticated user context to the request.

Invalid or missing authentication must result in an appropriate unauthorized response.

\---

\#\# \*\*10\\. Authorization Architecture\*\*

Authentication and authorization are separate concerns.

A valid JWT does not automatically grant access to every resource.

Authorization must consider:

\* user role;    
\* resource ownership;    
\* administrative privileges.

Example:

USER    
  ↓    
can access own resources

ADMIN    
  ↓    
can access authorized administrative operations

A user must not be able to access or modify another user's private resources merely because the resource ID is known.

Frontend route protection is not a security boundary.

The backend must enforce authorization independently.

\---

\#\# \*\*11\\. Roles\*\*

The application supports at least:

USER    
ADMIN

Roles must be enforced on the backend.

Frontend role-based navigation exists for user experience, but it does not replace backend authorization.

\---

\#\# \*\*12\\. Frontend Architecture\*\*

The frontend follows a feature-based architecture combined with shared infrastructure.

frontend/    
└── src/    
    ├── assets/    
    ├── components/    
    ├── features/    
    ├── hooks/    
    ├── layouts/    
    ├── pages/    
    ├── routes/    
    ├── services/    
    ├── types/    
    ├── utils/    
    ├── App.tsx    
    └── main.tsx    
\---

\#\# \*\*13\\. Frontend Features\*\*

The main product features are:

features/    
├── auth/    
├── closet/    
├── inspire-me/    
├── style-it/    
├── my-looks/    
├── doll/    
└── admin/

Each feature may contain:

components/    
hooks/    
services/    
types/    
utils/

only when those structures are actually required.

Do not create empty or unnecessary folders merely to satisfy a template.

\---

\#\# \*\*14\\. Shared Components\*\*

Shared reusable UI components belong under:

components/

Examples:

components/    
├── Button/    
├── Input/    
├── Select/    
├── MultiSelect/    
├── Checkbox/    
├── RadioGroup/    
├── Modal/    
├── Card/    
├── Badge/    
├── Tabs/    
├── Dropdown/    
├── Toast/    
├── Spinner/    
├── EmptyState/    
└── ErrorState/

Shared components must remain domain-agnostic whenever possible.

A reusable \`Button\` must not depend on the Closet feature.

\---

\#\# \*\*15\\. Feature-Specific Components\*\*

Components that belong specifically to a feature must remain inside that feature.

Example:

features/    
└── inspire-me/    
    ├── components/    
    │   ├── ModeSelector.tsx    
    │   ├── StyleCard.tsx    
    │   ├── OutfitRecommendation.tsx    
    │   └── RecommendationExplanation.tsx    
    ├── hooks/    
    ├── services/    
    └── types/

A component should only be moved to the shared component layer when genuine reuse exists.

\---

\#\# \*\*16\\. Frontend Pages\*\*

The application includes:

pages/    
├── HomePage.tsx    
├── LoginPage.tsx    
├── RegisterPage.tsx    
├── ClosetPage.tsx    
├── InspireMePage.tsx    
├── StyleItPage.tsx    
├── MyLooksPage.tsx    
├── DollPage.tsx    
└── admin/    
    └── AdminPage.tsx

The public home route is:

/

and is represented by:

HomePage

The \`HomePage\` is a public product entry point and will later be implemented according to the approved visual design.

The visual identity of the application is a product requirement and must not be replaced by a generic automatically generated interface.

\---

\#\# \*\*17\\. Frontend Routing\*\*

Public routes:

/    
/login    
/register

Protected application routes:

/closet    
/inspire-me    
/style-it    
/my-looks    
/doll

Administrative routes:

/admin

React Router must include a wildcard route:

\\\*

for unknown routes.

Detail pages must obtain dynamic route parameters using React Router mechanisms such as \`useParams\`.

\---

\#\# \*\*18\\. Protected Routes\*\*

Protected routes must prevent unauthenticated users from navigating to authenticated application pages.

Administrative routes must additionally verify that the authenticated user has the appropriate role.

However:

Frontend protection \\\!= backend security

Every protected API operation must independently enforce authentication and authorization.

\---

\#\# \*\*19\\. Authentication State\*\*

The frontend must maintain centralized authentication state.

Conceptually:

AuthProvider    
├── user    
├── isAuthenticated    
├── isLoading    
└── authentication actions

The application must be able to determine:

\* whether the user is authenticated;    
\* which user is authenticated;    
\* whether authentication state is still loading;    
\* which role the user has.

Authentication state must not be duplicated independently across every page.

\---

\#\# \*\*20\\. API Communication\*\*

HTTP communication must be centralized.

Components must not contain arbitrary HTTP requests such as:

fetch("/api/v1/...")

throughout the application.

The expected flow is:

Component    
   ↓    
Feature Hook    
   ↓    
Feature Service    
   ↓    
API Client    
   ↓    
Backend

Axios must remain in the service/API communication layer.

\---

\#\# \*\*21\\. API Client\*\*

A centralized API client must handle common HTTP concerns.

Conceptually:

services/    
└── api/    
    └── apiClient.ts

Responsibilities include:

\* base URL;    
\* common request configuration;    
\* authentication headers;    
\* response parsing;    
\* common HTTP error handling.

Feature services must use the centralized API client rather than configuring HTTP independently.

\---

\#\# \*\*22\\. Feature Services\*\*

Feature-specific API services belong inside their corresponding feature.

Example:

features/    
└── closet/    
    └── services/    
        └── clothingService.ts

Possible responsibilities:

getClothing()    
getClothingById()    
createClothing()    
updateClothing()    
archiveClothing()    
restoreClothing()

The exact operations must correspond to the actual API and approved functional requirements.

\---

\#\# \*\*23\\. Server State Management\*\*

TanStack Query is the selected solution for server state.

Server state includes data such as:

\* Closet contents;    
\* catalog data;    
\* saved Looks;    
\* Doll data;    
\* recommendations;    
\* user information;    
\* administrative data.

TanStack Query should handle concerns such as:

\* fetching;    
\* caching;    
\* refetching;    
\* loading states;    
\* mutations;    
\* invalidation.

Redux is not required.

Redux Toolkit should not be introduced merely for architectural appearance.

\---

\#\# \*\*24\\. Local UI State\*\*

React state/hooks should be used for local UI state.

Examples include:

\* selected tab;    
\* open modal;    
\* temporary form values;    
\* selected clothing item;    
\* current outfit composition;    
\* UI visibility state.

Local UI state should not be moved into global state unless there is a concrete reason.

\---

\#\# \*\*25\\. State Responsibility\*\*

The application should maintain a clear separation:

React State    
    ↓    
Local UI state

TanStack Query    
    ↓    
Server state

Backend    
    ↓    
Business state and persistence

Business rules must not be duplicated between frontend state and backend services.

\---

\#\# \*\*26\\. Product Feature Architecture\*\*

\#\#\# \*\*26.1 Closet\*\*

The Closet represents the user's real clothing collection.

It must support the approved clothing metadata and image-based clothing management.

Catalog-controlled attributes should not be implemented as arbitrary free-text input when the product requirement defines controlled options.

The frontend should obtain catalog options from the backend.

\#\#\# \*\*26.2 Inspire Me\*\*

Inspire Me generates outfit recommendations from the user's real clothing collection.

It supports:

Quick Mode    
Advanced Mode

The user can provide contextual filters such as:

\* mood;    
\* occasion;    
\* formality;    
\* other approved recommendation criteria.

The recommendation engine belongs to the backend.

The frontend displays:

Style Card    
\\+    
Outfit Recommendations    
\\+    
Recommendation Explanation

The compatibility calculation must be implemented as testable business logic.

\#\#\# \*\*26.3 Style It\*\*

Style It allows the user to manually combine real clothing images to construct an outfit.

The feature is intentionally different from Inspire Me:

Inspire Me    
→ algorithmic recommendations

Style It    
→ manual outfit construction

\#\#\# \*\*26.4 My Looks\*\*

My Looks stores outfits created or saved from:

\* Style It;    
\* Inspire Me.

The backend remains the source of truth for persisted Looks.

\#\#\# \*\*26.5 Doll\*\*

Doll provides a customizable 2D avatar experience.

The user can customize the Doll using predefined clothing assets and configurable appearance attributes.

The product intentionally avoids requiring users to manually draw every clothing item.

The Doll should behave conceptually like a virtual wardrobe/dress-up experience.

The implementation must keep the Doll feature modular so that more advanced avatar capabilities can be added later without redesigning the entire architecture.

\#\#\# \*\*26.6 Admin\*\*

The Admin feature provides administrative operations permitted by the product requirements.

Administrative functionality must be protected through backend role authorization.

\---

\#\# \*\*27\\. UI Architecture\*\*

The UI architecture consists of:

Shared UI    
    \\+    
Feature UI    
    \\+    
Pages    
    \\+    
Layouts

Shared UI components must be reusable.

Feature components must contain domain-specific interaction.

Pages compose features into navigable screens.

Layouts define shared structural elements such as navigation or application shells.

\---

\#\# \*\*28\\. Design System\*\*

The project must maintain centralized design tokens for:

\* typography;    
\* spacing;    
\* border radius;    
\* shadows;    
\* breakpoints;    
\* sizes;    
\* transitions;    
\* theme values.

Repeated visual values should not be arbitrarily hardcoded throughout the application.

The design system must support consistent visual implementation.

\---

\#\# \*\*29\\. Approved Product Design\*\*

The frontend visual implementation must follow the approved product design and visual direction defined for Digital Wardrobe.

The expected workflow is:

Product Requirements    
        ↓    
Approved Design References    
        ↓    
Frontend Implementation

The approved design is a \*\*core product requirement\*\*, not optional visual inspiration.

Claude Code must treat the approved design references as the primary visual authority when implementing the frontend.

Claude Code must not independently invent, replace, or reinterpret the established visual identity when an approved design already exists.

\---

\#\#\# \*\*29.1 Primary Design Reference — HomePage\*\*

The current approved \*\*HomePage / Landing Page\*\* is the interactive design created in Lovable:

\[\*\*https://digital-wardrobe-pastel.lovable.app\*\*\](https://digital-wardrobe-pastel.lovable.app/)

This page is the \*\*primary visual and interaction reference for the Digital Wardrobe frontend\*\*.

Claude Code must study and reproduce the visual language, composition, hierarchy, styling, and interaction patterns established by this reference when implementing the HomePage.

The HomePage implementation should match the approved Lovable design as closely as reasonably possible while remaining consistent with the project's architecture and technical requirements.

The reference defines the intended:

\* visual identity;    
\* color palette;    
\* typography;    
\* typography hierarchy;    
\* spacing system;    
\* proportions;    
\* page composition;    
\* navigation style;    
\* button styling;    
\* borders;    
\* panels;    
\* section structure;    
\* component appearance;    
\* visual hierarchy;    
\* decorative elements;    
\* imagery and illustrations;    
\* animation and motion language;    
\* hover and interaction behavior;    
\* Y2K / fashion-doll visual language;    
\* retro computer and videogame-inspired UI;    
\* scrapbook and personal-diary elements;    
\* overall personality of the application.

The HomePage is therefore not merely an example of the design.

It establishes the \*\*visual foundation and design language for the entire Digital Wardrobe application\*\*.

\---

\#\#\# \*\*29.2 Design System Derived from the HomePage\*\*

All subsequent frontend pages must visually belong to the same product universe established by the approved HomePage.

When implementing pages such as:

\* My Doll;    
\* Closet;    
\* Item Details;    
\* Style It / Outfit Builder;    
\* My Looks;    
\* Favorites;    
\* Profile;    
\* Settings;    
\* and any additional authenticated application pages;

Claude Code must derive their visual language from the approved HomePage rather than creating independent page-specific designs.

The following characteristics must remain visually coherent across the application:

\* color palette;    
\* typography and font hierarchy;    
\* button language;    
\* border treatment;    
\* panel treatment;    
\* spacing principles;    
\* visual density;    
\* corner treatment;    
\* labels and metadata;    
\* navigation patterns;    
\* interactive states;    
\* hover states;    
\* selected states;    
\* empty states;    
\* decorative language;    
\* illustration style;    
\* icon treatment;    
\* animation principles;    
\* overall Y2K / fashion-doll aesthetic.

The authenticated application should feel like the \*\*same product continuing from the HomePage\*\*, not like a separate dashboard or a different application.

\---

\#\#\# \*\*29.3 Existing Design References\*\*

The current approved visual design references also include the Digital Wardrobe UI/UX concept boards created during the product design phase.

These references provide additional visual context for the intended:

\* visual identity;    
\* overall aesthetic;    
\* color palette;    
\* typography;    
\* layout direction;    
\* navigation style;    
\* component appearance;    
\* spacing and proportions;    
\* use of illustrations and decorative elements;    
\* Y2K / fashion-doll visual language;    
\* retro computer and videogame-inspired UI;    
\* scrapbook and personal-diary elements;    
\* overall personality of the application.

When a specific approved page design exists, that page-specific reference should be followed.

When a specific page does not yet have an approved design, Claude Code should use the \*\*HomePage design and the established visual system as the primary source of truth\*\* and extend it consistently.

Claude Code should not create a new visual language simply because a page is not explicitly shown in an existing reference.

\---

\#\#\# \*\*29.4 Design Authority\*\*

The hierarchy of authority is:

1\. \*\*Product Requirements\*\* define what the application must do.    
2\. \*\*Approved Design References\*\* define how the application should look and feel.    
3\. \*\*Frontend Architecture\*\* defines how the implementation should be structured.    
4\. \*\*Implementation decisions\*\* must respect all three.

If a functional requirement and a visual reference appear to conflict, preserve the required functionality while making the \*\*smallest possible visual adaptation\*\* necessary to remain consistent with the approved design system.

If an implementation detail is not explicitly specified, Claude Code should prefer the closest existing pattern from the approved design rather than inventing a new one.

\---

\#\#\# \*\*29.5 Visual Consistency Requirements\*\*

Claude Code must not arbitrarily:

\* change the typography;    
\* change the major color palette;    
\* introduce unrelated gradients;    
\* introduce heavy or unnecessary shadows;    
\* introduce generic card-based layouts;    
\* replace approved layouts;    
\* replace designed components with generic UI components;    
\* remove or significantly alter approved decorative elements;    
\* remove the Y2K / fashion-doll visual language;    
\* replace the retro computer / videogame-inspired UI language;    
\* remove the scrapbook / personal-diary character;    
\* convert the application into a generic dashboard;    
\* introduce generic AI-generated UI patterns;    
\* replace the approved visual direction with a conventional SaaS interface;    
\* replace the approved visual direction with a conventional ecommerce interface;    
\* replace the approved visual direction with a conventional productivity application.

In particular, Claude Code must avoid introducing visual patterns simply because they are common in modern web applications.

\*\*Common does not mean approved.\*\*

The implementation must remain specific to Digital Wardrobe.

\---

\#\#\# \*\*29.6 Implementation Principle\*\*

The goal is not to mechanically reproduce individual pixels from the references.

The goal is to preserve the \*\*design intent\*\*.

When a reference contains visual details that cannot be implemented literally, Claude Code should preserve, in order of importance:

1\. visual identity;    
2\. hierarchy;    
3\. composition;    
4\. proportions;    
5\. interaction pattern;    
6\. visual rhythm;    
7\. aesthetic character.

A technically different implementation is acceptable when necessary, provided that the resulting user experience remains visually and behaviorally consistent with the approved design.

\---

\#\#\# \*\*29.7 Motion and Interaction\*\*

The approved HomePage also establishes the expected motion language of Digital Wardrobe.

Animations should be:

\* subtle;    
\* polished;    
\* intentional;    
\* smooth;    
\* responsive;    
\* consistent with the fashion/editorial aesthetic.

Where appropriate, the application may use:

\* scroll-triggered reveals;    
\* hover interactions;    
\* subtle transitions;    
\* gentle movement;    
\* interactive previews;    
\* animated state changes;    
\* micro-interactions.

Animations must support the experience rather than distract from it.

Claude Code must not introduce excessive:

\* bouncing;    
\* spinning;    
\* particle effects;    
\* flashy transitions;    
\* exaggerated 3D effects;    
\* generic SaaS animation patterns.

New pages should reuse the established motion language instead of inventing unrelated animation styles.

\---

\#\#\# \*\*29.8 Responsive Design\*\*

The approved design language must be preserved across:

\* desktop;    
\* tablet;    
\* mobile.

Responsive behavior may require changes to layout and composition, but those changes must preserve the original visual hierarchy and personality.

Claude Code must not treat responsive design as simply shrinking the desktop layout.

Mobile layouts should remain intentionally designed within the same Digital Wardrobe visual system.

\---

\#\#\# \*\*29.9 Final Design Rule\*\*

The following principle should guide all frontend visual decisions:

\> \*\*Digital Wardrobe should feel like one cohesive fashion universe.\*\*

The HomePage at:

\[\*\*https://digital-wardrobe-pastel.lovable.app\*\*\](https://digital-wardrobe-pastel.lovable.app/)

establishes the visual foundation of that universe.

Every subsequent page should feel like another part of the same world.

A user should be able to navigate from the HomePage into the authenticated application and immediately recognize that they are still inside \*\*Digital Wardrobe\*\*.

The frontend should feel:

\* feminine without becoming childish;    
\* playful without becoming messy;    
\* nostalgic without looking outdated;    
\* editorial without becoming cold;    
\* polished without becoming corporate;    
\* visually rich without becoming overwhelming.

The approved design direction must remain consistent throughout the entire application.

\---

\#\# \*\*30\\. Styling Strategy\*\*

Tailwind CSS is the primary styling system.

CSS Modules are permitted when component-specific styling cannot be expressed cleanly or maintainably with Tailwind.

No additional styling framework should be introduced without architectural justification.

Rules:

\* Tailwind is the default.    
\* CSS Modules are permitted when justified.    
\* Do not mix styling systems arbitrarily within a component.    
\* Do not introduce styled-components or another styling framework without approval.    
\* Repeated design values must use centralized tokens where appropriate.

\---

\#\# \*\*31\\. Responsive Design\*\*

The application must support:

Mobile    
Tablet    
Desktop

Responsive behavior must be considered during initial implementation.

Mobile support must not be treated as a final-stage patch.

Layouts and interactive elements must remain usable across supported screen sizes.

\---

\#\# \*\*32\\. Accessibility\*\*

The frontend must follow appropriate accessibility practices.

The application should use:

\* semantic HTML;    
\* accessible labels;    
\* keyboard navigation;    
\* visible focus states;    
\* appropriate ARIA attributes when necessary;    
\* sufficient contrast;    
\* meaningful alternative text for relevant images.

Interactive components such as:

\* modals;    
\* dropdowns;    
\* tabs;    
\* forms;    
\* selects;    
\* buttons

must remain accessible.

\---

\#\# \*\*33\\. UI States\*\*

Data-driven screens must explicitly handle:

Loading    
Success    
Empty    
Error

Example:

Closet    
  ↓    
No clothing items    
  ↓    
Empty State    
  ↓    
Add your first piece

The same principle applies to:

\* My Looks;    
\* Inspire Me;    
\* Style It;    
\* Doll;    
\* administrative screens.

\---

\#\# \*\*34\\. Frontend Validation\*\*

Frontend validation exists primarily for user experience.

It must:

\* provide immediate feedback;    
\* show validation errors visibly;    
\* prevent obviously invalid submissions.

However:

Frontend validation    
        \\+    
Backend validation

are both required.

Frontend validation must never replace backend validation.

\---

\#\# \*\*35\\. Error Handling\*\*

API errors must be displayed in a comprehensible way.

Errors should appear:

\* near the action that failed;    
\* or in a clearly visible application-level error area.

The frontend must not expose raw backend implementation details.

For example, users should not see:

PostgreSQL constraint violation

as the primary UI message.

\---

\#\# \*\*36\\. Database and Persistence Architecture\*\*

The application uses Supabase with PostgreSQL.

The backend remains responsible for application-level business rules.

Database constraints should also be used where appropriate to protect data integrity.

The persistence architecture follows:

Service    
   ↓    
Repository    
   ↓    
Supabase / PostgreSQL

Application services must not bypass repositories to execute arbitrary persistence operations.

\---

\#\# \*\*37\\. Database Migrations\*\*

Database evolution must be explicitly represented in the project.

backend/    
└── database/    
    └── migrations/

Migrations must be version-controlled.

Database structure must not depend exclusively on manually modifying a production database.

\---

\#\# \*\*38\\. Domain Model Boundary\*\*

The following concepts must remain distinguishable:

Database Model    
Domain Model    
DTO / API Response    
Frontend Type

They may share structures where appropriate, but they must not be assumed to be identical.

This prevents internal persistence details from leaking into API responses.

\---

\#\# \*\*39\\. Business Logic Location\*\*

Business rules must be implemented in backend services.

Examples of business logic include:

\* recommendation calculations;    
\* clothing compatibility;    
\* ownership rules;    
\* authorization-sensitive operations;    
\* validation involving multiple entities;    
\* outfit persistence rules;    
\* catalog restrictions;    
\* administrative operations.

Controllers and forms must not become the source of truth for business rules.

\---

\#\# \*\*40\\. Recommendation Engine\*\*

The Inspire Me recommendation engine must be implemented as deterministic, testable business logic.

Conceptually:

User Clothing    
      \\+    
User Filters    
      ↓    
Candidate Generation    
      ↓    
Compatibility Calculation    
      ↓    
Ranking    
      ↓    
Recommended Outfits    
      \\+    
Explanations

The frontend must consume the result.

It must not independently reproduce the recommendation algorithm.

The recommendation engine should remain modular so that its scoring rules can evolve independently.

\---

\#\# \*\*41\\. No Duplicate Business Logic\*\*

A business rule should have one authoritative implementation.

For example:

Backend:    
compatibilityScore \\= calculated result

The frontend may display:

92% compatibility

but should not implement a second algorithm to independently calculate \`92\`.

\---

\#\# \*\*42\\. File Uploads and Images\*\*

User-provided clothing images are application data and must be handled through a controlled upload flow.

The architecture must separate:

Image file    
    ↓    
Storage    
    ↓    
Stored file reference    
    ↓    
Database metadata

The database should store the metadata/reference necessary to associate the image with the clothing item rather than unnecessarily storing raw image binary data in normal relational records.

Uploads must be validated and protected against unauthorized access.

\---

\#\# \*\*43\\. Environment Configuration\*\*

Environment-specific configuration must not be hardcoded.

The project must use:

.env    
.env.example

The real \`.env\` file must never be committed to Git.

\`.env.example\` must document the required configuration variables without containing real secrets.

Examples may include:

DATABASE\\\_URL    
SUPABASE\\\_URL    
SUPABASE\\\_KEY    
JWT\\\_SECRET    
API\\\_URL

The exact variable names must be defined during implementation.

\---

\#\# \*\*44\\. Centralized Configuration\*\*

Environment variables should be loaded and validated through a centralized configuration module.

Conceptually:

backend/    
└── src/    
    └── config/    
        └── environment.ts

Application code should not repeatedly access raw environment variables throughout unrelated modules.

\---

\#\# \*\*45\\. Secrets\*\*

The following must never be committed to the repository:

\* JWT secrets;    
\* database passwords;    
\* Supabase secret keys;    
\* API keys;    
\* private credentials;    
\* production secrets.

Secrets must not be logged.

\---

\#\# \*\*46\\. Logging\*\*

Logs must be useful for debugging without exposing sensitive information.

Never log:

\* passwords;    
\* password hashes;    
\* JWT secrets;    
\* authentication tokens;    
\* private credentials.

Internal error details may be logged server-side when appropriate, while API responses must remain sanitized.

\---

\#\# \*\*47\\. Testing Architecture\*\*

Testing is part of the architecture.

The project must prioritize meaningful behavior and business-rule testing rather than artificial coverage.

Backend tests are mandatory and must cover successful cases, validation errors, permission errors, and domain-specific rules.

Frontend tests may additionally be implemented for important user-facing behavior.

\---

\#\# \*\*48\\. Backend Tests\*\*

Backend tests are organized into:

backend/    
└── tests/    
    ├── unit/    
    └── integration/

\#\#\# \*\*Unit Tests\*\*

Unit tests should cover isolated logic such as:

\* services;    
\* validators;    
\* business rules;    
\* recommendation algorithms;    
\* compatibility calculations;    
\* utilities.

Unit tests should not require unnecessary external dependencies.

\#\#\# \*\*Integration Tests\*\*

Integration tests should verify interactions across layers.

Examples:

Route    
 ↓    
Middleware    
 ↓    
Controller    
 ↓    
Service    
 ↓    
Repository    
 ↓    
Database    
\---

\#\# \*\*49\\. Security Tests\*\*

Security-sensitive behavior must have explicit tests.

Examples:

Missing token → 401    
Invalid token → 401    
Expired token → 401    
Insufficient role → 403    
Unauthorized resource ownership → 403    
Invalid credentials → authentication failure    
Password hash stored securely    
Password hash not returned    
Sensitive JWT data not exposed    
\---

\#\# \*\*50\\. Frontend Tests\*\*

Frontend tests are recommended for important user-facing behavior.

They may cover:

\* components;    
\* hooks;    
\* forms;    
\* user interactions;    
\* feature flows.

The main focus should be observable behavior rather than implementation details.

\---

\#\# \*\*51\\. Test Isolation\*\*

Tests must use predictable data.

A test that modifies persistent data must either:

\* reset the affected data;    
\* use an isolated test environment;    
\* or otherwise ensure that the test does not affect other tests.

Integration tests must not depend on the execution order of other tests.

\---

\#\# \*\*52\\. Test Naming\*\*

Test names must describe behavior.

Prefer:

should reject access when the clothing item belongs to another user

over:

should call findByIdForUser

Tests should remain meaningful even if the implementation changes.

\---

\#\# \*\*53\\. No Fake Coverage\*\*

Tests must not exist only to increase coverage percentages.

Avoid meaningless tests such as:

expect(component).toBeDefined()

when the component contains important behavior that is not tested.

Tests should target:

\* requirements;    
\* business rules;    
\* security;    
\* edge cases;    
\* critical user flows.

\---

\#\# \*\*54\\. Regression Testing\*\*

When a bug is discovered:

Bug    
 ↓    
Fix    
 ↓    
Regression Test

A reproducible bug should receive a regression test whenever the behavior is reasonably testable.

\---

\#\# \*\*55\\. Code Quality Standards\*\*

The project uses TypeScript strictness and consistent code-quality tooling.

At minimum, the project should use:

ESLint    
Prettier

Code must remain formatted and lintable throughout development.

\---

\#\# \*\*56\\. TypeScript Rules\*\*

Strict TypeScript configuration must be enabled.

Avoid:

any

unless there is a concrete technical reason.

Prefer:

unknown

for genuinely unknown data, followed by explicit type narrowing.

Arbitrary type casts must not be used merely to silence compiler errors.

\---

\#\# \*\*57\\. Naming Conventions\*\*

\#\#\# \*\*Backend Files\*\*

Use descriptive lowercase filenames:

clothing.controller.ts    
clothing.service.ts    
clothing.repository.ts    
clothing.routes.ts    
clothing.validator.ts

\#\#\# \*\*Frontend Components\*\*

Use PascalCase:

ClothingCard.tsx    
ClothingForm.tsx    
RecommendationCard.tsx

\#\#\# \*\*Hooks\*\*

Use:

useCloset.ts    
useAuth.ts    
useInspireMe.ts

\#\#\# \*\*Variables and Functions\*\*

Use camelCase:

getClothingItems()    
calculateCompatibilityScore()    
authenticatedUser

\#\#\# \*\*Types\*\*

Use PascalCase:

ClothingItem    
OutfitRecommendation    
UserRole    
\---

\#\# \*\*58\\. Naming Intent\*\*

Avoid vague names such as:

data    
result    
thing    
item    
response

when a more descriptive name is possible.

Prefer:

clothingItems    
outfitRecommendations    
authenticatedUser    
catalogOptions

Code should communicate intent clearly.

\---

\#\# \*\*59\\. Single Responsibility\*\*

Modules and functions should have focused responsibilities.

A service should not become a giant module responsible for unrelated domains.

If a module grows too large, it should be evaluated for logical decomposition.

\---

\#\# \*\*60\\. DRY and Abstraction\*\*

Unnecessary duplication should be avoided.

However, abstraction must not be introduced prematurely.

Prefer:

simple explicit implementation

over:

complex abstraction created only to eliminate a few repeated lines

Abstraction should follow a real recurring need.

\---

\#\# \*\*61\\. Comments\*\*

Comments should explain why something is done when the reason is not obvious.

Avoid comments that simply repeat the code.

Bad:

// Get clothing items    
const clothingItems \\= await getClothingItems();

Useful:

// Archived clothing items are excluded from the active Closet view.    
\---

\#\# \*\*62\\. Documentation\*\*

Documentation should explain non-obvious technical decisions, including:

\* architectural decisions;    
\* security decisions;    
\* complex business rules;    
\* recommendation logic;    
\* persistence behavior;    
\* external integrations.

The project documentation must remain synchronized with significant architectural changes.

\---

\#\# \*\*63\\. Error Handling Standards\*\*

Errors must never be silently swallowed.

Avoid:

try {    
  ...    
} catch {    
}

Errors must be:

\* handled;    
\* propagated;    
\* transformed;    
\* or logged appropriately.

The chosen behavior must be intentional.

\---

\#\# \*\*64\\. Imports\*\*

Imports must remain organized and consistent.

Excessive relative paths such as:

../../../../../../something

should be avoided.

TypeScript path aliases may be used where they improve readability and maintainability.

The exact aliases will be defined during implementation.

\---

\#\# \*\*65\\. Dead Code\*\*

The repository should not contain unnecessary:

\* unused imports;    
\* unused variables;    
\* dead functions;    
\* abandoned components;    
\* experimental files;    
\* obsolete implementations.

When an implementation is replaced, obsolete code should be removed unless it has a documented purpose.

\---

\#\# \*\*66\\. API Types\*\*

API requests and responses must have explicit types.

The frontend must not rely on arbitrary untyped objects received from the backend.

Types should describe:

\* request payloads;    
\* response payloads;    
\* pagination;    
\* errors;    
\* domain-facing data.

\---

\#\# \*\*67\\. Frontend Dependency Rules\*\*

The intended dependency direction is:

Pages    
  ↓    
Features / Shared Components    
  ↓    
Hooks / Services    
  ↓    
API Client    
  ↓    
Backend API

Shared components must not depend on domain-specific features.

Features should avoid unnecessary dependencies on other features.

Circular dependencies are prohibited.

\---

\#\# \*\*68\\. Feature Isolation\*\*

The following relationship is undesirable:

closet    
  ↓    
inspire-me    
  ↓    
doll    
  ↓    
closet

Features must remain as independent as practical.

Shared functionality should be extracted into shared infrastructure only when genuine reuse exists.

\---

\#\# \*\*69\\. Asset Organization\*\*

Global assets belong under:

frontend/src/assets/

Assets exclusive to a feature may be colocated with that feature when appropriate.

For example, Doll-specific visual assets may live inside:

features/doll/

The goal is to avoid one enormous global assets directory containing unrelated feature resources.

\---

\#\# \*\*70\\. Project Structure\*\*

The approved project structure is:

project-root/    
│    
├── backend/    
│   ├── src/    
│   │   ├── config/    
│   │   ├── controllers/    
│   │   ├── middlewares/    
│   │   ├── models/    
│   │   ├── repositories/    
│   │   ├── routes/    
│   │   ├── services/    
│   │   ├── types/    
│   │   ├── utils/    
│   │   ├── validators/    
│   │   ├── app.ts    
│   │   └── server.ts    
│   │    
│   ├── database/    
│   │   └── migrations/    
│   │    
│   └── tests/    
│       ├── unit/    
│       └── integration/    
│    
├── frontend/    
│   ├── src/    
│   │   ├── assets/    
│   │   ├── components/    
│   │   ├── features/    
│   │   │   ├── auth/    
│   │   │   ├── closet/    
│   │   │   ├── inspire-me/    
│   │   │   ├── style-it/    
│   │   │   ├── my-looks/    
│   │   │   ├── doll/    
│   │   │   └── admin/    
│   │   ├── hooks/    
│   │   ├── layouts/    
│   │   ├── pages/    
│   │   │   └── admin/    
│   │   ├── routes/    
│   │   ├── services/    
│   │   ├── types/    
│   │   ├── utils/    
│   │   ├── App.tsx    
│   │   └── main.tsx    
│   │    
│   └── tests/    
│       ├── unit/    
│       └── integration/    
│    
├── docs/    
├── .env.example    
├── .gitignore    
├── README.md    
├── PROJECT\\\_SPECIFICATION.md    
├── ARCHITECTURE.md    
└── DEVELOPMENT\\\_PLAN.md    
\---

\#\# \*\*71\\. Frontend Page Structure\*\*

The expected page structure is:

pages/    
├── HomePage.tsx    
├── LoginPage.tsx    
├── RegisterPage.tsx    
├── ClosetPage.tsx    
├── InspireMePage.tsx    
├── StyleItPage.tsx    
├── MyLooksPage.tsx    
├── DollPage.tsx    
└── admin/    
    └── AdminPage.tsx

Pages should primarily compose feature components and coordinate page-level behavior.

They should not become large containers containing all business logic.

\---

\#\# \*\*72\\. Claude Code Development Rules\*\*

Claude Code must follow this architecture when implementing the project.

\#\#\# \*\*72.1 Read Before Implementing\*\*

Before implementing or modifying a feature, Claude Code must inspect:

PROJECT\\\_SPECIFICATION.md    
ARCHITECTURE.md    
DEVELOPMENT\\\_PLAN.md

and any relevant existing source files.

It must follow already-approved architectural decisions.

\#\#\# \*\*72.2 Do Not Invent Parallel Architecture\*\*

Claude Code must not create an alternative structure because it appears easier for a particular feature.

It must not:

\* bypass services;    
\* place database queries in controllers;    
\* place HTTP requests directly in components;    
\* create random global folders;    
\* duplicate shared components;    
\* introduce an unapproved state-management system.

\#\#\# \*\*72.3 Implement Incrementally\*\*

Claude Code must not attempt to implement the entire project in one uncontrolled operation.

Development must follow the phases defined in:

DEVELOPMENT\\\_PLAN.md

Each phase must be completed and verified before dependent phases begin.

\#\#\# \*\*72.4 Verify Before Continuing\*\*

After implementing a meaningful phase, Claude Code must verify:

\* compilation;    
\* linting;    
\* tests;    
\* relevant functionality;    
\* architectural consistency.

A feature that does not satisfy its tests must not be considered complete.

\#\#\# \*\*72.5 Respect Existing Work\*\*

Claude Code must inspect existing code before creating new files.

It must avoid:

\* duplicate services;    
\* duplicate types;    
\* duplicate components;    
\* duplicate utilities;    
\* redundant API clients.

If an existing abstraction already satisfies the requirement, it should be reused.

\#\#\# \*\*72.6 No Unapproved Dependencies\*\*

Claude Code must not install new dependencies merely for convenience.

A new dependency must have a clear technical justification and must be consistent with the architecture.

\#\#\# \*\*72.7 No Hardcoded Business Data\*\*

Business data that belongs to backend catalogs or persistence must not be hardcoded into frontend components.

The frontend must obtain dynamic application data through the API.

\#\#\# \*\*72.8 No Business Logic in Presentation\*\*

React components should not contain complex business algorithms.

For example, the Inspire Me compatibility algorithm must remain in the backend/business layer.

\#\#\# \*\*72.9 No Database Access Outside Repositories\*\*

Database access must remain inside repositories or the explicitly designated persistence layer.

Controllers and frontend code must never directly access PostgreSQL/Supabase.

\#\#\# \*\*72.10 Tests Are Part of the Feature\*\*

When implementing a new business rule or security-sensitive operation, Claude Code must implement the corresponding tests as part of the same development task.

The intended workflow is:

Requirement    
    ↓    
Implementation    
    ↓    
Tests    
    ↓    
Verification    
\---

\#\# \*\*73\\. Architectural Compliance\*\*

An implementation is not considered correct merely because it works.

It must also comply with the architecture.

For example, the following is architecturally incorrect even if the endpoint works:

Controller    
   ↓    
Supabase query

The correct structure is:

Controller    
   ↓    
Service    
   ↓    
Repository    
   ↓    
Supabase / PostgreSQL

Similarly, the following is architecturally incorrect:

React Component    
   ↓    
Axios request

when implemented independently across many components.

The preferred structure is:

React Component    
   ↓    
Hook    
   ↓    
Feature Service    
   ↓    
API Client    
   ↓    
Backend    
\---

\#\# \*\*74\\. University Requirement Alignment\*\*

The architecture explicitly supports the technical concepts required by the university assignment, including:

\* Express Router;    
\* middlewares;    
\* centralized error handling;    
\* CORS;    
\* JWT authentication;    
\* authorization;    
\* React with Vite;    
\* React components;    
\* React state;    
\* React effects;    
\* React Router;    
\* forms;    
\* Axios;    
\* validation;    
\* API error handling;    
\* Jest;    
\* Supertest.

The architecture must remain compatible with the formal requirements defined by the university assignment.

\---

\#\# \*\*75\\. Security Requirements Derived from the University Specification\*\*

The architecture must enforce the following:

\* JWT authentication;    
\* role-based authorization;    
\* resource ownership checks where applicable;    
\* hashed passwords;    
\* no password exposure;    
\* no sensitive information inside JWTs;    
\* protected private and administrative operations;    
\* backend business-rule validation.

A valid JWT alone is not sufficient for authorization.

The backend must verify both role and ownership where appropriate.

\---

\#\# \*\*76\\. Final Architectural Rule\*\*

The project should remain:

Structured    
Layered    
Feature-Oriented    
Secure    
Testable    
Type-Safe    
Maintainable    
Responsive    
Design-Driven    
Simple Enough to Understand

The architecture must evolve only when the application's real requirements justify the change.

Any architectural change that affects established project structure, security, persistence, API contracts, or dependency boundaries must be documented before implementation.

The goal is not to build the most complex architecture possible.

The goal is to build a well-engineered application with clear boundaries, sound engineering decisions, and a structure that can be understood and maintained by another developer.  
