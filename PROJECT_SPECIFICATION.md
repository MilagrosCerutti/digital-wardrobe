\# Project Specification

\#\# 1\. Document Purpose

This document defines the product requirements, domain model, business rules, functional requirements, non-functional requirements, MVP scope, and project boundaries for the application.

This document is the primary product-level source of truth for implementation.

Technical architecture, project structure, layer responsibilities, dependency rules, implementation phases, coding conventions, and development workflow are defined separately in:

\- \`ARCHITECTURE.md\`  
\- \`DEVELOPMENT\_PLAN.md\`

Any implementation decision must remain consistent with this specification unless explicitly approved and documented.

\---

\# 2\. Product Overview

The application is a digital wardrobe and personal styling assistant centered around the user's real wardrobe.

The product allows users to:

\- manage their real clothing collection;  
\- upload images of their clothing;  
\- classify clothing using controlled attributes;  
\- manually create outfits;  
\- receive algorithmic outfit recommendations;  
\- save outfits;  
\- customize and dress a 2D fashion Doll.

The application combines practical wardrobe management with a creative and playful fashion experience.

The product must not feel like a generic inventory management application.

The core product loop is:

\`Closet \-\> Inspire Me / Style It \-\> Outfit \-\> My Looks\`

The Doll experience provides a separate virtual fashion experience:

\`My Doll \-\> Customize \-\> Dress\`

\---

\# 3\. Product Objective

The primary objective is to help users rediscover and creatively use clothing they already own.

The system should transform a simple digital wardrobe into a personal styling playground by combining:

\- real clothing images;  
\- contextual outfit recommendations;  
\- manual outfit creation;  
\- explainable compatibility calculations;  
\- saved looks;  
\- a customizable 2D fashion Doll.

The MVP should demonstrate:

\- strong product thinking;  
\- sound software engineering;  
\- secure development practices;  
\- explainable recommendation logic;  
\- maintainable architecture;  
\- automated testing.

\---

\# 4\. Product Vision

To create a digital wardrobe experience where users can explore their personal style, discover combinations they would not normally consider, and have fun experimenting with the clothes they already own.

The long-term vision is a highly personalized fashion playground that combines wardrobe intelligence, styling, creativity, and virtual fashion.

\---

\# 5\. Product Mission

Make getting dressed more creative, personalized, and enjoyable by helping users discover new possibilities within their existing wardrobe.

\---

\# 6\. Product Principles

\#\# 6.1 Inspiration Over Management

The application must not feel like a simple inventory management system.

The Closet exists primarily to enable users to discover new possibilities within their existing wardrobe.

\#\# 6.2 Creativity Over Rigid Categorization

Clothing attributes help the system understand garments but must not restrict them to a single aesthetic.

A garment may participate in different outfit contexts depending on:

\- the other garments;  
\- Mood;  
\- Occasion;  
\- Formality;  
\- Style;  
\- Color;  
\- user preferences.

For example, a basic white T-shirt should not be considered exclusively casual. It may be appropriate for an elevated outfit when combined with a blazer and other suitable pieces.

\#\# 6.3 Recommendations Must Be Explainable

Recommendation results must provide understandable reasons for their selection.

The explanation must be based on actual recommendation data and scoring factors.

The system must not present invented explanations that are unrelated to the recommendation logic.

\#\# 6.4 Personalization Over Generic Recommendations

Recommendations must primarily use the user's actual wardrobe rather than generic predefined outfits.

\#\# 6.5 Playful, Not Administrative

The experience should feel:

\- visual;  
\- creative;  
\- personal;  
\- exploratory;  
\- enjoyable.

Forms and configuration must not dominate the product experience.

\#\# 6.6 Progressive Complexity

Users must be able to obtain value quickly through Quick Mode.

Advanced Mode should provide additional control for users who want more precise recommendations.

\#\# 6.7 User Ownership

The recommendation engine recommends; it does not decide for the user.

Users control:

\- their wardrobe;  
\- their saved looks;  
\- their Doll;  
\- their preferences.

\#\# 6.8 Real Wardrobe First

The real clothing collection is the foundation of the styling experience.

The Doll is a complementary creative experience and does not replace the real wardrobe.

\#\# 6.9 Explainability Over Artificial Intelligence

AI must not be introduced merely for appearance.

If a requirement can be implemented effectively with deterministic rules, scoring, filtering, and ranking, the MVP should prefer the understandable and maintainable solution.

The MVP recommendation engine must therefore be deterministic and rule-based.

\#\# 6.10 Delightful Details

The product may use:

\- subtle visual feedback;  
\- microinteractions;  
\- creative Style Card names;  
\- visual transitions;  
\- other details that improve the experience.

These details must not compromise usability or maintainability.

\#\# 6.11 Fashion Is Contextual

A clothing item is not inherently limited to one style or one use case.

Outfit suitability depends on the combination of garments and contextual factors such as:

\- Mood;  
\- Occasion;  
\- Formality;  
\- Style;  
\- Color;  
\- user preferences.

\#\# 6.12 Encourage Reuse, Not Consumption

The application should encourage users to make better use of clothing they already own rather than encouraging unnecessary purchases.

\---

\# 7\. Main Product Sections

The MVP contains the following main sections:

1\. Closet  
2\. Inspire Me  
3\. Style It  
4\. My Looks  
5\. My Doll  
6\. Admin

\---

\#\# 7.1 Closet

The user's real wardrobe.

Users can:

\- upload clothing images;  
\- classify clothing;  
\- view clothing;  
\- update clothing;  
\- archive clothing;  
\- restore archived clothing.

The Closet is the primary data source for Style It and Inspire Me.

\---

\#\# 7.2 Inspire Me

The algorithmic styling experience.

Users provide contextual information and receive ranked outfit recommendations generated from their own wardrobe.

Inspire Me has two modes:

\- Quick Mode  
\- Advanced Mode

The system also generates a Style Card and explanations for the recommendations.

\---

\#\# 7.3 Style It

The manual outfit builder.

Users can freely combine clothing items from their real Closet to create outfits.

Style It is intentionally different from Inspire Me:

\- Style It is user-driven.  
\- Inspire Me is algorithm-driven.

\---

\#\# 7.4 My Looks

The user's saved outfits.

My Looks contains outfits saved from:

\- Style It;  
\- Inspire Me.

Deleting a Look must not delete the underlying ClothingItems.

\---

\#\# 7.5 My Doll

A customizable 2D fashion avatar.

Users can:

\- customize supported physical characteristics;  
\- select Doll Items;  
\- dress the Doll;  
\- change equipped items.

Users do not need to manually draw their own clothing.

The Doll uses predefined 2D assets organized into visual layers.

\---

\#\# 7.6 Admin

The administrative area.

Administrators can:

\- view users;  
\- activate users;  
\- deactivate users;  
\- manage global catalogs;  
\- manage Doll Items;  
\- activate or deactivate catalog entries.

\---

\# 8\. Domain Model

\#\# 8.1 Core Entities

The MVP domain model contains:

\- User  
\- ClothingItem  
\- Outfit  
\- OutfitItem  
\- Doll  
\- DollItem  
\- DollEquipment  
\- Category  
\- Subcategory  
\- Material  
\- Pattern  
\- Color  
\- Style  
\- Occasion

Catalog entities are modeled as database entities rather than rigid application enums because administrators must be able to manage them.

\---

\# 9\. User

Attributes:

\- id  
\- firstName  
\- lastName  
\- email  
\- passwordHash  
\- role  
\- status  
\- createdAt  
\- updatedAt

A User:

\- owns ClothingItems;  
\- owns Outfits;  
\- owns exactly one Doll.

The email address must be unique.

Passwords must never be stored in plaintext.

\---

\# 10\. ClothingItem

Attributes:

\- id  
\- userId  
\- imageUrl  
\- categoryId  
\- subcategoryId  
\- materialId  
\- patternId  
\- fit  
\- formalityLevel  
\- isArchived  
\- createdAt  
\- updatedAt

Colors and Styles are many-to-many relationships represented by dedicated association entities.

The user must not manually type controlled catalog values.

The following are selected from controlled dropdowns:

\- Material  
\- Pattern  
\- Formality Level  
\- Category  
\- Subcategory  
\- Fit

The following support multiple selections:

\- Color  
\- Style

The image is uploaded by the user.

\---

\# 11\. ClothingItemColor

Attributes:

\- clothingItemId  
\- colorId

Represents the many-to-many relationship between ClothingItem and Color.

\---

\# 12\. ClothingItemStyle

Attributes:

\- clothingItemId  
\- styleId

Represents the many-to-many relationship between ClothingItem and Style.

\---

\# 13\. Outfit

Attributes:

\- id  
\- userId  
\- name  
\- source  
\- compatibilityScore  
\- occasion  
\- mood  
\- createdAt  
\- updatedAt

\`name\` is optional.

\`source\` distinguishes between:

\- manually created outfits;  
\- generated outfits.

An Outfit may be created through Style It or Inspire Me.

\---

\# 14\. OutfitItem

Attributes:

\- id  
\- outfitId  
\- clothingItemId

An Outfit contains multiple OutfitItems.

A ClothingItem may participate in multiple Outfits.

\---

\# 15\. Doll

Attributes:

\- id  
\- userId  
\- bodyType  
\- skinTone  
\- hairStyle  
\- hairColor  
\- eyeColor  
\- createdAt  
\- updatedAt

Each User owns exactly one Doll.

The exact supported appearance attributes may be expanded according to the final Doll catalog.

\---

\# 16\. DollItem

Attributes:

\- id  
\- name  
\- category  
\- layer  
\- assetUrl  
\- isActive  
\- createdAt  
\- updatedAt

DollItems are predefined visual assets.

Users do not need to create or draw these assets.

The assets are stored externally and referenced through asset URLs.

\---

\# 17\. DollEquipment

Attributes:

\- id  
\- dollId  
\- dollItemId

Represents the Doll Items currently equipped by a user's Doll.

The layered rendering system determines how equipped Doll Items are displayed.

\---

\# 18\. Catalog Entities

The following are globally managed catalogs:

\- Category  
\- Subcategory  
\- Material  
\- Pattern  
\- Color  
\- Style  
\- Occasion  
\- DollItem

Catalog records must support activation/deactivation where applicable.

Occasion is an administrator-managed catalog.

\---

\# 19\. Domain Relationships

The domain relationships are:

\- User 1:N ClothingItem  
\- User 1:N Outfit  
\- User 1:1 Doll  
\- Outfit 1:N OutfitItem  
\- ClothingItem 1:N OutfitItem  
\- ClothingItem N:M Color through ClothingItemColor  
\- ClothingItem N:M Style through ClothingItemStyle  
\- Doll 1:N DollEquipment  
\- DollItem 1:N DollEquipment  
\- Category 1:N ClothingItem  
\- Subcategory 1:N ClothingItem  
\- Material 1:N ClothingItem  
\- Pattern 1:N ClothingItem

All relationships must enforce appropriate referential integrity.

\---

\# 20\. Business Rules

\#\# 20.1 User Rules

\- Every user must have a unique email address.  
\- Passwords must never be stored in plaintext.  
\- Only authenticated users may access protected resources.  
\- Users may only access their own Closet, Outfits, Looks, and Doll resources.  
\- Inactive users cannot authenticate.  
\- Only administrators may manage global application data.

\#\# 20.2 Closet Rules

\- Every ClothingItem belongs to exactly one User.  
\- Every ClothingItem must contain an image.  
\- Required clothing attributes must be selected from controlled catalog values.  
\- A ClothingItem may have multiple Colors.  
\- A ClothingItem may have multiple Styles.  
\- An archived ClothingItem cannot be used to generate new outfits.  
\- Archived ClothingItems remain visible in existing saved outfits where historical integrity requires it.  
\- Users may restore archived ClothingItems.

\#\# 20.3 Outfit Rules

\- Every Outfit belongs to exactly one User.  
\- An Outfit must contain at least two ClothingItems.  
\- Structural compatibility must be validated before an Outfit is considered valid.  
\- Invalid combinations must not be generated by Inspire Me.  
\- Manual and generated outfits use the same core compatibility rules.  
\- Generated outfits receive a compatibility score.  
\- Users may save generated outfits.  
\- Users may create and save manual outfits.  
\- Deleting a saved Look must not delete its ClothingItems.

\#\# 20.4 Inspire Me Rules

\- Recommendations may only use active ClothingItems.  
\- Recommendations must respect selected user filters.  
\- Recommendations should prioritize higher compatibility scores.  
\- The recommendation system may support avoiding recently used clothing.  
\- The recommendation system may support prioritizing favorite pieces when the feature is enabled.  
\- Recommendation explanations must correspond to actual scoring and filtering factors.  
\- Quick Mode provides a low-friction recommendation flow.  
\- Advanced Mode provides additional recommendation controls.  
\- Inspire Me generates a Style Card before presenting ranked outfit results.

\#\# 20.5 Doll Rules

\- Every User owns exactly one Doll.  
\- Users can customize supported Doll appearance attributes.  
\- Users can dress their Doll using active DollItems.  
\- Users do not need to draw their own clothing.  
\- Only administrators can manage the global Doll catalog.  
\- Inactive DollItems cannot be selected.

\#\# 20.6 Administration Rules

\- Administrators can view users.  
\- Administrators can activate users.  
\- Administrators can deactivate users.  
\- Administrators can manage global catalogs.  
\- Administrators can activate and deactivate catalog entries.  
\- Administrative operations require administrator authorization.

\#\# 20.7 Security Rules

\- JWT authentication is required for protected API endpoints.  
\- Authorization must be enforced on the backend.  
\- Sensitive information must not be returned in API responses.  
\- All external input must be validated.  
\- Application errors must be handled centrally.  
\- Authentication secrets and credentials must not be hardcoded.

\---

\# 21\. Inspire Me

\#\# 21.1 Quick Mode

Quick Mode minimizes friction.

The MVP Quick Mode uses:

\- Mood  
\- Occasion

The user selects the desired context and requests recommendations.

The system must not require the user to complete an unnecessarily long form before generating recommendations.

\---

\# 22\. Advanced Mode

Advanced Mode provides additional control.

The MVP Advanced Mode may include:

\- Mood  
\- Occasion  
\- Formality  
\- Required Item  
\- Items to Avoid  
\- Use Favorites  
\- Avoid Recently Worn

Optional controls must remain optional unless a specific business rule requires them.

\---

\# 23\. Inspire Me Recommendation Pipeline

The recommendation engine follows this conceptual pipeline:

1\. Read user inputs.  
2\. Read active ClothingItems from the user's Closet.  
3\. Apply compatibility rules.  
4\. Apply user-selected filters.  
5\. Generate valid combinations.  
6\. Calculate compatibility scores.  
7\. Rank valid combinations.  
8\. Select the best results.  
9\. Generate the Style Card.  
10\. Generate evidence-based explanations for each result.

The recommendation engine must be deterministic and rule-based in the MVP.

An external AI service is not required.

\---

\# 24\. Style Card

Before displaying the recommendation results, Inspire Me should generate a Style Card describing the overall direction of the recommendation session.

The Style Card should communicate:

\- generated vibe/style name;  
\- short description;  
\- recommended color palette;  
\- key pieces;  
\- main characteristics;  
\- number of generated outfits.

The Style Card is intended to make the recommendation experience feel more personal and creative.

\---

\# 25\. Recommendation Explanation

Each generated outfit should communicate why it was recommended.

Possible factors include:

\- selected Mood;  
\- selected Occasion;  
\- Formality compatibility;  
\- Color compatibility;  
\- Style compatibility;  
\- recent-use preferences;  
\- favorite-item preferences.

Only factors actually used by the recommendation engine may be presented as reasons.

The system must never claim that an outfit was recommended because of a factor that did not participate in its calculation.

\---

\# 26\. Functional Requirements

\#\# Authentication and Authorization

\#\#\# FR-001

The system shall allow a new user to create an account.

\#\#\# FR-002

The system shall authenticate users using their registered credentials.

\#\#\# FR-003

The system shall store passwords using secure hashing.

\#\#\# FR-004

The system shall use JWT-based authentication for protected resources.

\#\#\# FR-005

The system shall enforce USER and ADMIN roles on the backend.

\---

\#\# Closet

\#\#\# FR-006

Authenticated users shall be able to add ClothingItems to their Closet.

\#\#\# FR-007

Users shall be able to upload a clothing image.

\#\#\# FR-008

Users shall classify ClothingItems using controlled catalog values.

\#\#\# FR-009

Users shall be able to view their Closet.

\#\#\# FR-010

Users shall be able to update their own ClothingItems.

\#\#\# FR-011

Users shall be able to archive ClothingItems.

\#\#\# FR-012

Users shall be able to restore archived ClothingItems.

\#\#\# FR-013

Users shall not be able to access or modify another user's ClothingItems.

\---

\#\# Style It

\#\#\# FR-014

Users shall be able to manually create outfits using their own ClothingItems.

\#\#\# FR-015

The system shall validate structural outfit compatibility.

\#\#\# FR-016

The system shall calculate a compatibility score for valid outfits.

\#\#\# FR-017

Users may assign an optional name to an outfit.

\#\#\# FR-018

Users shall be able to save manually created outfits.

\---

\#\# Inspire Me

\#\#\# FR-019

Users shall be able to generate recommendations through Quick Mode.

\#\#\# FR-020

Users shall be able to generate recommendations through Advanced Mode.

\#\#\# FR-021

The system shall generate valid outfit combinations from active user ClothingItems.

\#\#\# FR-022

The system shall calculate recommendation compatibility scores.

\#\#\# FR-023

The system shall rank generated outfits.

\#\#\# FR-024

The system shall generate a Style Card for a recommendation session.

\#\#\# FR-025

The system shall provide evidence-based explanations for recommendations.

\#\#\# FR-026

Users shall be able to save generated outfits.

\---

\#\# My Looks

\#\#\# FR-027

Users shall be able to view saved Looks.

\#\#\# FR-028

Users shall be able to view Look details.

\#\#\# FR-029

Users shall be able to delete saved Looks without deleting their ClothingItems.

\---

\#\# My Doll

\#\#\# FR-030

The system shall provide each user with a personal Doll.

\#\#\# FR-031

Users shall be able to customize supported Doll appearance attributes.

\#\#\# FR-032

Users shall be able to dress their Doll using available DollItems.

\#\#\# FR-033

The Doll shall use modular 2D visual layers.

\#\#\# FR-034

The system shall provide active DollItems from the global catalog.

\---

\#\# Administration

\#\#\# FR-035

Administrators shall be able to view registered users.

\#\#\# FR-036

Administrators shall be able to activate users.

\#\#\# FR-037

Administrators shall be able to deactivate users.

\#\#\# FR-038

Administrators shall be able to manage global catalogs.

\#\#\# FR-039

Administrators shall be able to activate or deactivate catalog entries.

\#\#\# FR-040

Administrative operations shall require administrator authorization.

\---

\#\# Persistence and Files

\#\#\# FR-041

The system shall persist application data using PostgreSQL through Supabase.

\#\#\# FR-042

The system shall store user clothing images and Doll assets using Supabase Storage.

\#\#\# FR-043

The database shall store references to stored assets rather than binary image data.

\---

\# 27\. Non-Functional Requirements

\#\#\# NFR-001 — Security

The system shall follow secure development practices for:

\- authentication;  
\- authorization;  
\- password storage;  
\- input validation;  
\- sensitive data handling.

\#\#\# NFR-002 — Password Hashing

Passwords shall be hashed using the hashing mechanism required by the project specification.

The implementation must never store plaintext passwords.

\#\#\# NFR-003 — JWT Security

JWT implementation shall follow secure token-handling practices.

Tokens must not contain unnecessary sensitive information.

\#\#\# NFR-004 — Authorization

Authorization shall always be enforced server-side.

Hiding a frontend button is not considered sufficient authorization.

\#\#\# NFR-005 — Input Validation

All externally supplied data shall be validated before reaching business logic.

\#\#\# NFR-006 — Error Handling

Backend errors shall be handled centrally and consistently.

\#\#\# NFR-007 — API Consistency

The API shall use consistent:

\- naming;  
\- HTTP semantics;  
\- response structures;  
\- error structures;  
\- status codes.

\#\#\# NFR-008 — Layered Architecture

The backend shall follow the layered architecture defined in \`ARCHITECTURE.md\`.

\#\#\# NFR-009 — Separation of Concerns

The following concerns must remain separated:

\- presentation;  
\- business logic;  
\- persistence;  
\- authentication;  
\- authorization;  
\- validation;  
\- infrastructure.

\#\#\# NFR-010 — Maintainability

The codebase shall be organized into cohesive, maintainable modules with clear responsibilities.

\#\#\# NFR-011 — Testability

Core business logic shall be independently testable.

\#\#\# NFR-012 — Automated Testing

Critical functionality shall have automated tests.

\#\#\# NFR-013 — Database Integrity

The database shall enforce appropriate:

\- primary keys;  
\- foreign keys;  
\- uniqueness constraints;  
\- data integrity constraints.

\#\#\# NFR-014 — Data Ownership

The backend shall enforce ownership boundaries between users.

\#\#\# NFR-015 — Archival

Resources requiring archival behavior shall use soft deletion or an equivalent archival mechanism where historical integrity is required.

\#\#\# NFR-016 — Performance

Normal user operations shall have reasonable response times.

The system should avoid unnecessary database queries and expensive computations.

\#\#\# NFR-017 — Scalability

The architecture shall support future expansion without requiring a complete rewrite.

\#\#\# NFR-018 — Configuration

Environment-specific configuration and secrets shall not be hardcoded in source code.

\#\#\# NFR-019 — Logging

Logs must not expose:

\- passwords;  
\- JWTs;  
\- credentials;  
\- sensitive user information.

\#\#\# NFR-020 — Infrastructure Cost

The MVP shall be implementable using free or free-tier infrastructure and open-source technologies unless a paid service is explicitly approved.

\---

\# 28\. Testing Requirements

\#\#\# TR-001 — Unit Tests

Core business logic shall have unit tests.

\#\#\# TR-002 — Authentication Tests

Authentication flows shall be tested for:

\- successful authentication;  
\- invalid credentials;  
\- invalid authentication scenarios.

\#\#\# TR-003 — Authorization Tests

Tests shall verify:

\- ownership boundaries;  
\- unauthorized resource access;  
\- administrator restrictions;  
\- non-admin rejection of administrative operations.

\#\#\# TR-004 — Recommendation Tests

The recommendation engine shall have tests covering:

\- compatibility;  
\- scoring;  
\- filtering;  
\- ranking;  
\- invalid combinations.

\#\#\# TR-005 — API Tests

Critical API endpoints shall have integration/API tests.

\#\#\# TR-006 — Validation Tests

Invalid input shall be tested to ensure validation occurs before business logic execution.

\#\#\# TR-007 — Regression

Existing tests shall continue to pass when new functionality is introduced.

\---

\# 29\. MVP Scope

The MVP includes:

\- secure authentication;  
\- JWT authorization;  
\- password hashing;  
\- user management;  
\- Closet management;  
\- clothing image uploads;  
\- controlled clothing catalogs;  
\- Style It;  
\- outfit compatibility;  
\- Inspire Me;  
\- Quick Mode;  
\- Advanced Mode;  
\- Style Cards;  
\- recommendation explanations;  
\- My Looks;  
\- My Doll;  
\- Doll customization;  
\- Doll dressing;  
\- Admin area;  
\- user activation/deactivation;  
\- catalog administration;  
\- PostgreSQL;  
\- Supabase;  
\- Supabase Storage;  
\- automated testing;  
\- security controls.

The MVP must demonstrate the complete core product loop:

\`Register \-\> Login \-\> Closet \-\> Style It / Inspire Me \-\> Outfit \-\> My Looks\`

The MVP must also demonstrate the Doll loop:

\`Customize Doll \-\> Select Doll Items \-\> Dress Doll\`

\---

\# 30\. Out of Scope

The following features are explicitly excluded from the MVP.

\#\# 30.1 AI and Computer Vision

\- Automatic clothing recognition  
\- Automatic clothing attribute extraction  
\- AI-generated outfits  
\- AI stylist chatbot  
\- AI image generation  
\- Automatic image background removal

\#\# 30.2 Virtual Try-On

\- Realistic avatar fitting  
\- AR try-on  
\- Photorealistic clothing simulation  
\- 3D avatars  
\- Clothing physics

\#\# 30.3 Social Features

\- Followers  
\- Likes  
\- Comments  
\- Public profiles  
\- Social feeds  
\- Community features

\#\# 30.4 E-Commerce

\- Shopping recommendations  
\- Product links  
\- Affiliate integrations  
\- Online purchases  
\- Brand integrations

\#\# 30.5 External Context APIs

\- Weather APIs  
\- Calendar integrations  
\- Location-based recommendations

\#\# 30.6 Advanced Wardrobe Management

\- Laundry tracking  
\- Cost-per-wear  
\- Purchase history  
\- Clothing expiration  
\- Advanced wardrobe statistics

\#\# 30.7 Advanced Personalization

\- Machine-learning user profiles  
\- Long-term behavioral prediction  
\- Automatic style profiling  
\- User-trained recommendation models

\---

\# 31\. Future Roadmap

Potential future versions may include:

\- automatic clothing attribute detection;  
\- weather-aware recommendations;  
\- outfit history;  
\- wear frequency analytics;  
\- more advanced recommendation scoring;  
\- expanded Doll customization;  
\- AI stylist functionality;  
\- computer vision;  
\- virtual try-on;  
\- 3D avatar;  
\- social features;  
\- shopping integrations;  
\- calendar integration;  
\- travel and packing assistant.

Future features must not be implemented as part of the MVP unless explicitly approved.

\---

\# 32\. Hard Project Boundaries

The following rules are mandatory.

1\. Features explicitly marked Out of Scope must not be implemented unless explicitly requested.  
2\. No paid third-party service may be introduced without explicit approval.  
3\. Deterministic business logic must not be replaced with AI unless explicitly required.  
4\. Business logic must not be placed directly inside controllers, routes, or frontend components.  
5\. Future features must not be implemented merely because they may be useful later.  
6\. Secrets and credentials must never be committed to source control.  
7\. The MVP must remain implementable using the approved free or free-tier infrastructure.  
8\. Backend authorization must never depend exclusively on frontend restrictions.  
9\. User-owned resources must always be protected by backend ownership checks.  
10\. Controlled catalog values must not be replaced by arbitrary free-text input when a catalog is defined.  
11\. Existing functionality must not be broken to implement unrelated features.  
12\. New dependencies must have a clear technical justification.  
13\. Architecture must remain consistent with \`ARCHITECTURE.md\`.  
14\. Development must follow the phases defined in \`DEVELOPMENT\_PLAN.md\`.

\---

\# 33\. MVP Success Criteria

The MVP is considered functionally complete when a user can:

1\. Register.  
2\. Log in securely.  
3\. Create and manage a personal Closet.  
4\. Upload clothing images.  
5\. Classify ClothingItems.  
6\. View clothing in the Closet.  
7\. Update clothing.  
8\. Archive and restore clothing.  
9\. Build an outfit manually through Style It.  
10\. Validate outfit compatibility.  
11\. Calculate outfit compatibility.  
12\. Save the outfit to My Looks.  
13\. Use Inspire Me in Quick Mode.  
14\. Use Inspire Me in Advanced Mode.  
15\. Receive a Style Card.  
16\. Receive ranked outfit recommendations.  
17\. Understand why recommendations were made.  
18\. Save generated Looks.  
19\. Customize a Doll.  
20\. Dress the Doll using available DollItems.

An administrator must also be able to:

1\. Authenticate as an administrator.  
2\. View users.  
3\. Activate users.  
4\. Deactivate users.  
5\. Manage global catalogs.  
6\. Manage DollItems.  
7\. Activate catalog entries.  
8\. Deactivate catalog entries.

\---

\# 34\. Implementation Guidance for Claude Code

Claude Code must treat this document as the product-level source of truth.

Before implementing functionality, Claude Code must verify that the requested behavior is consistent with:

1\. this document;  
2\. \`ARCHITECTURE.md\`;  
3\. \`DEVELOPMENT\_PLAN.md\`.

Claude Code must not:

\- invent undocumented business rules;  
\- introduce unnecessary features;  
\- bypass the defined architecture;  
\- place business logic in inappropriate layers;  
\- replace deterministic recommendation logic with AI;  
\- introduce paid services without approval;  
\- expose sensitive information;  
\- weaken authentication or authorization requirements.

When a requirement is ambiguous or conflicts with another requirement, Claude Code must stop and request clarification rather than silently choosing an arbitrary behavior.

\---

\# 35\. Document Status

This document represents the agreed product-level specification for the MVP.

The product decisions, domain model, business rules, functional requirements, non-functional requirements, testing requirements, scope, and project boundaries defined here are considered approved.

Technical implementation details are intentionally excluded from this document and belong in:

\- \`ARCHITECTURE.md\`  
\- \`DEVELOPMENT\_PLAN.md\`

University-specific requirements must remain consistent with this specification and must be incorporated where required by the course assignment.

This document must be updated if an approved requirement changes.  
