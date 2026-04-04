# Gambling Math API Documentation

## Changelog

### Version 1.1 — April 2026

**Backend Changes:**

1. **Timer Configuration Endpoint** — Added GET /api/game_config endpoint returning timer durations (easy: 180s, medium: 300s, hard: 420s) with instructions for frontend display.

2. **Starting Points Increase** — Teams now start with 3000 points instead of 1000 points upon game registration.

3. **Minimum Bet Amount** — Minimum bet amount enforced at 200 points (previously 1). Bets below 200 are rejected with clear error message.

4. **Question Limit per Category** — Teams can answer maximum 3 questions per category. Category endpoint now returns `remaining_questions` field showing questions left (3 - answered).

5. **Question Randomization** — Questions are now served in random order instead of sequential order by ID, ensuring fair distribution.

6. **Leaderboard Tie-Breaking** — Teams with same points now ranked by fewer questions answered (lower questions_answered = higher rank), then alphabetically by team name.

7. **Leaderboard Filtering** — Teams that haven't answered any questions are now excluded from leaderboard rankings.

**API Changes Summary:**

- New endpoint: GET /api/game_config
- Updated endpoint: GET /api/category (returns remaining_questions)
- Updated endpoint: GET /api/leaderboard (returns questions_answered, filtered)
- Updated endpoint: POST /api/place_bet (minimum 200 validation)
- Updated endpoint: GET /api/get_question (randomized, category limit enforced)
- Updated model: TeamProfile.points default = 3000
- Updated model: Bet.amount minimum = 200

---

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
    - [1. Login](#1-login)
    - [1.1 Game Configuration](#11-game-configuration)
    - [2. Categories](#2-categories)
    - [3. Place Bet](#3-place-bet)
    - [4. Get Question](#4-get-question)
    - [5. Submit Answer](#5-submit-answer)
    - [6. Leaderboard](#6-leaderboard)
- [Game Flow](#game-flow)
- [Error Handling](#error-handling)

---

## Overview

A gambling-style math quiz API where teams bet points on math questions across categories and difficulty levels. Questions are served as images containing the question and four options (A/B/C/D). Correct answers pay out based on the bet amount multiplied by the payout multiplier.

Teams start with **3000 points**. Points are deducted on bet placement and awarded back (with winnings) on correct answers.

---

## Base URL

```
https://gambling-math.bits-apogee.org/api
```

> **Note**: All endpoint URLs must NOT have a trailing slash. `/api/login` is valid, `/api/login/` will 404.

---

## Authentication

JWT (JSON Web Token) via `djangorestframework-simplejwt`.

### Obtaining Tokens

```
POST /api/login
```

Returns `access` (60 min default) and `refresh` (7 days default) tokens.

### Using Tokens

Include in all authenticated requests:

```
Authorization: Bearer <access_token>
```

### Refreshing Tokens

> **Note**: The refresh endpoint requires the SimpleJWT URLs to be included in routing. If not configured, re-authenticate via `/api/login` instead.

```
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}
```

**Success Response** — `200 OK`

```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response**

| Status | Condition                        | Response                                                               |
| ------ | -------------------------------- | ---------------------------------------------------------------------- |
| 401    | Invalid or expired refresh token | `{"detail": "Token is invalid or expired", "code": "token_not_valid"}` |

---

### 1.1 Game Configuration

Returns timer duration configuration for each question difficulty level.

**Request**

```
GET /api/game_config
```

**Authentication**: None required (AllowAny)

**Request Body**: None

**Success Response** — `200 OK`

```json
{
    "timer_easy": 180,
    "timer_medium": 300,
    "timer_hard": 420,
    "instructions": "Timer durations per question difficulty: Easy questions have 3 minutes (180 seconds), Medium questions have 5 minutes (300 seconds), Hard questions have 7 minutes (420 seconds). Timer starts when the question is displayed."
}
```

**Notes**

- Timer values are in seconds
- Frontend should display countdown timer based on difficulty level
- Timer should persist across page refreshes (frontend responsibility)
- Instructions text is intended to be displayed to users

---

## Data Models

### Category

| Field         | Type        | Description                |
| ------------- | ----------- | -------------------------- |
| `id`          | integer     | Unique identifier          |
| `name`        | string(100) | Category name (unique)     |
| `description` | string      | Category description       |
| `is_active`   | boolean     | Whether category is active |
| `created_at`  | datetime    | Creation timestamp         |

### Question

| Field         | Type     | Description                          |
| ------------- | -------- | ------------------------------------ |
| `id`          | integer  | Unique identifier                    |
| `category_id` | integer  | FK → Category                        |
| `level`       | string   | `easy`, `medium`, or `hard`          |
| `text`        | string   | Question text (may be empty)         |
| `image`       | string   | Relative URL to question image       |
| `explanation` | string   | Explanation (not exposed via API)    |
| `points`      | integer  | Internal field (not used in payouts) |
| `is_active`   | boolean  | Whether question is active           |
| `created_at`  | datetime | Creation timestamp                   |

### Option

| Field               | Type        | Description                                                        |
| ------------------- | ----------- | ------------------------------------------------------------------ |
| `id`                | integer     | Unique identifier                                                  |
| `question_id`       | integer     | FK → Question                                                      |
| `text`              | string(255) | Option label: `A`, `B`, `C`, `D`                                   |
| `is_correct`        | boolean     | Whether this is the correct answer                                 |
| `payout_multiplier` | float       | Multiplier for the selected correct option's payout (default: 2.0) |

### TeamProfile

| Field        | Type        | Description                   |
| ------------ | ----------- | ----------------------------- |
| `team_name`  | string(120) | Team name (unique)            |
| `points`     | integer     | Current balance (start: 3000) |
| `created_at` | datetime    | Creation timestamp            |

### Bet

| Field         | Type     | Description                 |
| ------------- | -------- | --------------------------- |
| `id`          | integer  | Unique identifier           |
| `team_id`     | integer  | FK → TeamProfile            |
| `category_id` | integer  | FK → Category               |
| `amount`      | integer  | Bet amount (min: 200)       |
| `level`       | string   | `easy`, `medium`, or `hard` |
| `status`      | string   | `open`, `won`, or `lost`    |
| `payout`      | integer  | Payout amount (0 if lost)   |
| `created_at`  | datetime | Creation timestamp          |

### CategoryProgress

| Field                | Type     | Description                          |
| -------------------- | -------- | ------------------------------------ |
| `id`                 | integer  | Unique identifier                    |
| `team_id`            | integer  | FK → TeamProfile                     |
| `category_id`        | integer  | FK → Category                        |
| `questions_answered` | integer  | Count of questions answered (max: 3) |
| `created_at`         | datetime | Creation timestamp                   |

**Constraint**: UniqueConstraint on (team_id, category_id) — one progress record per team per category.

---

## API Endpoints

---

### 1. Login

Authenticates a user and returns JWT tokens with team info.

**Request**

```
POST /api/login
```

**Authentication**: None

**Request Body**

| Field      | Type   | Required | Description   |
| ---------- | ------ | -------- | ------------- |
| `username` | string | Yes      | Team username |
| `password` | string | Yes      | Team password |

**Request Example**

```json
{
    "username": "team_alpha",
    "password": "securepassword123"
}
```

**Success Response** — `200 OK`

```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "team": {
        "team_name": "Team Alpha",
        "points": 3000
    }
}
```

> **Edge case**: If the user has no `TeamProfile`, the response returns `"team_name": "<username>"` and `"points": 0`.

**Error Responses**

| Status | Condition                    | Response                                           |
| ------ | ---------------------------- | -------------------------------------------------- |
| 400    | Missing username or password | `{"detail": "username and password are required"}` |
| 401    | Invalid credentials          | `{"detail": "invalid credentials"}`                |

---

### 2. Categories

#### 2.1 List Categories

Returns all active categories. Inactive categories are excluded.

**Request**

```
GET /api/category
```

**Authentication**: Bearer token required

**Request Body**: None

**Success Response** — `200 OK`

```json
[
    {
        "id": 1,
        "name": "Probability",
        "description": "Questions on Probability",
        "remaining_questions": 3
    },
    {
        "id": 2,
        "name": "Trigonometry",
        "description": "Questions on Trigonometry",
        "remaining_questions": 2
    }
]
```

> **Note**: `remaining_questions` indicates how many questions the team can still answer for this category (maximum 3 per category).

**Error Responses**

| Status | Condition             | Response                                                      |
| ------ | --------------------- | ------------------------------------------------------------- |
| 401    | Missing/invalid token | `{"detail": "Authentication credentials were not provided."}` |

#### 2.2 Create / Update Category

Creates a new category or updates the description of an existing one by name. **Admin only.**

**Request**

```
POST /api/category
```

**Authentication**: Bearer token required — **Admin only**

**Request Body**

| Field         | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| `name`        | string | Yes      | Category name (unique) |
| `description` | string | No       | Category description   |

**Request Example**

```json
{
    "name": "Calculus",
    "description": "Questions on derivatives and integrals"
}
```

**Success Response** — `201 Created` (new category)

```json
{
    "id": 16,
    "name": "Calculus",
    "description": "Questions on derivatives and integrals"
}
```

**Success Response** — `200 OK` (updated existing)

```json
{
    "id": 16,
    "name": "Calculus",
    "description": "Updated description"
}
```

**Error Responses**

| Status | Condition             | Response                                                      |
| ------ | --------------------- | ------------------------------------------------------------- |
| 400    | Missing name          | `{"detail": "name is required"}`                              |
| 401    | Missing/invalid token | `{"detail": "Authentication credentials were not provided."}` |
| 403    | Non-admin user        | `{"detail": "admin only"}`                                    |

---

### 3. Place Bet

Places a bet on a category and difficulty level. Points are deducted immediately.

**Request**

```
POST /api/place_bet/{category_id}
```

**Authentication**: Bearer token required

**URL Parameters**

| Parameter     | Type    | Description        |
| ------------- | ------- | ------------------ |
| `category_id` | integer | ID of the category |

**Request Body**

| Field    | Type    | Required | Constraints              | Description      |
| -------- | ------- | -------- | ------------------------ | ---------------- |
| `amount` | integer | Yes      | ≥ 200, ≤ current points  | Bet amount       |
| `level`  | string  | Yes      | `easy`, `medium`, `hard` | Difficulty level |

**Request Example**

```
POST /api/place_bet/3
```

```json
{
    "amount": 200,
    "level": "medium"
}
```

**Success Response** — `201 Created`

```json
{
    "bet_id": 42,
    "amount": 200,
    "level": "medium",
    "status": "open",
    "remaining_points": 2800
}
```

**Error Responses**

| Status | Condition                                  | Response                                                                 |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------ |
| 400    | Missing amount or level                    | `{"detail": "amount and level are required"}`                            |
| 400    | Amount is not an integer                   | `{"detail": "amount must be an integer"}`                                |
| 400    | Amount < 200                               | `{"detail": "minimum bet amount is 200"}`                                |
| 400    | Insufficient points                        | `{"detail": "insufficient points"}`                                      |
| 400    | Invalid level value                        | `{"detail": "invalid level"}`                                            |
| 400    | Open bet already exists for this cat+level | `{"detail": "open bet already exists for this category and level"}`      |
| 400    | No unanswered questions for this cat+level | `{"detail": "no unanswered questions left for this category and level"}` |
| 401    | Missing/invalid token                      | `{"detail": "Authentication credentials were not provided."}`            |
| 404    | Category not found or inactive             | `{"detail": "Not found."}`                                               |
| 404    | No TeamProfile for user                    | `{"detail": "Not found."}`                                               |

> **Note**: Both 404 conditions return the same response. The category lookup also filters by `is_active=True` — an inactive category returns 404 just like a non-existent one.

---

### 4. Get Question

Returns an unanswered question for the given difficulty level. Only returns questions from categories where the team has an **open bet** for that level.

**Request**

```
GET /api/get_question/{level}
```

**Authentication**: Bearer token required

**URL Parameters**

| Parameter | Type   | Description                 |
| --------- | ------ | --------------------------- |
| `level`   | string | `easy`, `medium`, or `hard` |

**Request Body**: None

**Request Example**

```
GET /api/get_question/medium
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
```

**Success Response** — `200 OK`

```json
{
    "question_id": 15,
    "category_id": 3,
    "image": "/media/questions/Probability/medium/q1.png",
    "text": "",
    "level": "medium",
    "options": [
        { "id": 57, "text": "A" },
        { "id": 58, "text": "B" },
        { "id": 59, "text": "C" },
        { "id": 60, "text": "D" }
    ]
}
```

**Notes**

- `image` — Domain-relative URL path (e.g., `/media/questions/...`). Construct the full URL by prepending the domain: `https://gambling-math.bits-apogee.org` + image value. In production, images are served via nginx; in development, Django serves them directly.
- `image` can be `null` if the question has no uploaded image. Fall back to `text` in that case.
- `text` — May be empty for image-based questions. Use `image` when available.
- `options[].text` — Label only (`A`/`B`/`C`/`D`). The actual option content is embedded in the question image.
- Questions are now served in **random order** (not sequential by ID)
- Teams can only get questions from categories where they've answered fewer than 3 questions
- If a team has answered 3 questions for all categories with open bets, returns 404
- If you have open bets in **multiple categories** for the same level, questions from all those categories are pooled and returned in random order.

**Error Responses**

| Status | Condition                                     | Response                                                      |
| ------ | --------------------------------------------- | ------------------------------------------------------------- |
| 401    | Missing/invalid token                         | `{"detail": "Authentication credentials were not provided."}` |
| 404    | No open bet or no unanswered questions        | `{"detail": "question not found"}`                            |
| 404    | Category limit reached (3 questions answered) | `{"detail": "question not found"}`                            |
| 404    | No TeamProfile for user                       | `{"detail": "Not found."}`                                    |

> **Note**: The `level` parameter is not validated. Passing an invalid value (e.g., `expert`) returns 404 `"question not found"` rather than a 400 error.

---

### 5. Submit Answer

Submits an answer for a question, resolves the associated open bet, and awards points if correct.

**Request**

```
POST /api/answer
```

**Authentication**: Bearer token required

**Request Body**

| Field         | Type    | Required | Description                       |
| ------------- | ------- | -------- | --------------------------------- |
| `question_id` | integer | Yes      | ID of the question being answered |
| `option_id`   | integer | Yes      | ID of the selected option         |

**Request Example**

```json
{
    "question_id": 15,
    "option_id": 58
}
```

**Success Response (Correct)** — `200 OK`

```json
{
    "correct": true,
    "points_awarded": 300,
    "bet_status": "won",
    "payout": 300,
    "total_points": 1150
}
```

**Success Response (Incorrect)** — `200 OK`

```json
{
    "correct": false,
    "points_awarded": 0,
    "bet_status": "lost",
    "payout": 0,
    "total_points": 850
}
```

**Payout Calculation**

```
payout = bet_amount × selected_correct_option.payout_multiplier
points_awarded = payout  (if correct, else 0)
```

All options currently use the default multiplier of `2.0`, meaning a correct answer doubles the bet.

**Error Responses**

| Status | Condition                        | Response                                                      |
| ------ | -------------------------------- | ------------------------------------------------------------- |
| 400    | Missing question_id or option_id | `{"detail": "question_id and option_id are required"}`        |
| 400    | Already answered this question   | `{"detail": "already answered"}`                              |
| 400    | No open bet for this cat+level   | `{"detail": "no open bet found"}`                             |
| 401    | Missing/invalid token            | `{"detail": "Authentication credentials were not provided."}` |
| 404    | Invalid question_id              | `{"detail": "Not found."}`                                    |
| 404    | Invalid option_id for question   | `{"detail": "Not found."}`                                    |
| 404    | No TeamProfile for user          | `{"detail": "Not found."}`                                    |

---

### 6. Leaderboard

Returns all teams ranked by points (descending), with alphabetical tiebreaker by team name.

**Request**

```
GET /api/leaderboard
```

**Authentication**: Bearer token required

**Request Body**: None

**Success Response** — `200 OK`

```json
{
    "results": [
        {
            "rank": 1,
            "team_name": "Team Alpha",
            "points": 2500,
            "questions_answered": 5,
            "is_current_team": true
        },
        {
            "rank": 2,
            "team_name": "Team Beta",
            "points": 2100,
            "questions_answered": 7,
            "is_current_team": false
        },
        {
            "rank": 3,
            "team_name": "Team Gamma",
            "points": 1800,
            "questions_answered": 4,
            "is_current_team": false
        }
    ]
}
```

> **Note**:
>
> - Teams are sorted by: **points DESC** → **questions_answered ASC** → **team_name ASC**
> - Tie-breaking: If teams have equal points, the team with fewer questions answered ranks higher
> - Only teams that have answered at least 1 question appear on leaderboard
> - `questions_answered` counts total questions answered by the team
> - `is_current_team` is `true` for the requesting user's team

**Error Responses**

| Status | Condition             | Response                                                      |
| ------ | --------------------- | ------------------------------------------------------------- |
| 401    | Missing/invalid token | `{"detail": "Authentication credentials were not provided."}` |

---

## Game Flow

A complete game round follows this sequence:

```
Step 0: GET TIMER CONFIG (optional)
    GET /api/game_config
    → Get timer durations for each difficulty level

Step 1: LOGIN
    POST /api/login { username, password }
    → Get access & refresh tokens, team info (name, points)

Step 2: GET CATEGORIES
    GET /api/category
    → List all active categories with remaining_questions (max 3 per category)

Step 3: PLACE BET (can repeat for different category+level combos)
    POST /api/place_bet/{category_id} { amount, level }
    → Points deducted, bet created with status "open"

Step 4: GET QUESTION
    GET /api/get_question/{level}
    → Get unanswered question image + options A/B/C/D
    → Timer starts based on difficulty (easy: 180s, medium: 300s, hard: 420s)

Step 5: SUBMIT ANSWER
    POST /api/answer { question_id, option_id }
    → Bet resolved (won/lost), points awarded if correct

Step 6: CHECK LEADERBOARD
    GET /api/leaderboard
    → View rankings with your position highlighted
```

> **Important**:
>
> - You can have multiple open bets simultaneously — one per (category, level) combination. For example, you can bet on Probability+easy, Probability+medium, and Trigonometry+easy at the same time. When you call `GET /api/get_question/easy`, it returns a question from any category where you have an open easy bet.
> - Each team can answer a **maximum of 3 questions per category**. Once 3 questions are answered for a category, no more questions will be served from that category.
> - Questions are served in **random order**, not sequentially by ID.

### Detailed Example Walkthrough

```bash
# 0. Get timer configuration (optional)
curl -X GET https://gambling-math.bits-apogee.org/api/game_config
# → {"timer_easy": 180, "timer_medium": 300, "timer_hard": 420,
#    "instructions": "Timer durations per question difficulty..."}

# 1. Login
curl -X POST https://gambling-math.bits-apogee.org/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "team_alpha", "password": "password123"}'
# → {"access": "eyJ...", "refresh": "eyJ...", "team": {"team_name": "Team Alpha", "points": 3000}}

# 2. Get categories
curl -X GET https://gambling-math.bits-apogee.org/api/category \
  -H "Authorization: Bearer eyJ..."
# → [{"id": 1, "name": "Probability", "description": "Questions on Probability", "remaining_questions": 3}, ...]

# 3. Place bet (200 points on Probability, medium)
curl -X POST https://gambling-math.bits-apogee.org/api/place_bet/1 \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 200, "level": "medium"}'
# → {"bet_id": 5, "amount": 200, "level": "medium", "status": "open", "remaining_points": 2800}

# 4. Get question (medium level)
curl -X GET https://gambling-math.bits-apogee.org/api/get_question/medium \
  -H "Authorization: Bearer eyJ..."
# → {"question_id": 23, "category_id": 1, "image": "/media/questions/Probability/medium/q1.png",
#    "text": "", "level": "medium", "options": [{"id": 89, "text": "A"}, ...]}

# 5. Submit answer
curl -X POST https://gambling-math.bits-apogee.org/api/answer \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"question_id": 23, "option_id": 90}'
# Correct:  {"correct": true,  "points_awarded": 400, "bet_status": "won",  "payout": 400, "total_points": 3200}
# Incorrect: {"correct": false, "points_awarded": 0,    "bet_status": "lost", "payout": 0,   "total_points": 2800}

# 6. Leaderboard
curl -X GET https://gambling-math.bits-apogee.org/api/leaderboard \
  -H "Authorization: Bearer eyJ..."
# → {"results": [{"rank": 1, "team_name": "Team Alpha", "points": 3200, "questions_answered": 1, "is_current_team": true}, ...]}
```

---

## Error Handling

### Error Response Format

All errors return JSON. Most use a simple format:

```json
{
    "detail": "Error message description"
}
```

Token-related errors use an extended format with a `code` and `messages` array (see below).

### HTTP Status Codes

| Status | Meaning      | Common Causes                                   |
| ------ | ------------ | ----------------------------------------------- |
| 200    | OK           | Successful GET or POST                          |
| 201    | Created      | Resource created (bet, category)                |
| 400    | Bad Request  | Invalid/missing params, business rule violation |
| 401    | Unauthorized | Missing or expired JWT token                    |
| 403    | Forbidden    | Authenticated but lacks permission (admin)      |
| 404    | Not Found    | Resource does not exist or is inactive          |

### Authentication Errors

```json
// No token provided
{ "detail": "Authentication credentials were not provided." }

// Expired/invalid token (different format)
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

> **Frontend note**: Token errors have a different shape (`code` + `messages` array) compared to standard errors (`detail` only). Handle both formats.

### Rate Limiting

- Anonymous requests: **20/minute** (throttled)
- Authenticated requests: not throttled

---

## Quick Reference

| Method | Endpoint                       | Auth | Admin | Description              |
| ------ | ------------------------------ | ---- | ----- | ------------------------ |
| POST   | `/api/login`                   | No   | No    | Authenticate, get tokens |
| GET    | `/api/game_config`             | No   | No    | Get timer configuration  |
| GET    | `/api/category`                | Yes  | No    | List active categories   |
| POST   | `/api/category`                | Yes  | Yes   | Create/update category   |
| POST   | `/api/place_bet/{category_id}` | Yes  | No    | Place a bet              |
| GET    | `/api/get_question/{level}`    | Yes  | No    | Get unanswered question  |
| POST   | `/api/answer`                  | Yes  | No    | Submit answer            |
| GET    | `/api/leaderboard`             | Yes  | No    | View rankings            |

---

_API Version 1.1 — April 2026_
