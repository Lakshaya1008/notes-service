# Notes Service

A simple Spring Boot REST API for managing notes.

## Features
- Create, read, update, delete notes
- Input validation
- Global exception handling
- PostgreSQL persistence

## Tech Stack
- Java 17+
- Spring Boot 3
- Spring Data JPA
- Spring Security
- PostgreSQL
- Maven

## API Endpoints

| Method | Endpoint            | Description        |
|------|---------------------|--------------------|
| POST | /api/notes          | Create a note      |
| GET  | /api/notes          | Get all notes      |
| GET  | /api/notes/{id}     | Get note by ID     |
| PUT  | /api/notes/{id}     | Update a note      |
| DELETE | /api/notes/{id}   | Delete a note      |

## Running Locally

1. Clone the repo
2. Configure PostgreSQL in `application.yml`
3. Run:
```bash
mvn spring-boot:run
```

Server starts on http://localhost:8081

## Status

Completed core backend features. Authentication can be added if required.
