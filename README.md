Secure Voting Application – Node.js

A backend-focused Voting Application built using Node.js, Express, SQLite, and JWT, designed to demonstrate authentication, authorization, data integrity, and secure voting logic.

 Features

 Voter Registration & Login

 Candidate Registration & Login

JWT-based Authentication

Role-based Authorization (Voter vs Candidate)

 One Vote per Voter (Strictly Enforced)

 Accurate Vote Counting

 Candidates can view ONLY their own votes

 Auditable Vote Mapping (Voter → Candidate)

Persistent SQLite Database

> Tech Stack
Layer	Technology
Runtime	Node.js
Framework	Express.js
Database	SQLite
Authentication	JWT (JSON Web Tokens)
Password Security	bcrypt
Environment Config	dotenv
> Database Schema
> voters
Column	Description
voter_id	Unique voter ID
name	Voter name
email	Unique email
password	Hashed password
has_voted	Prevents duplicate voting
> candidates
Column	Description
candidate_id	Unique candidate ID
name	Candidate name
email	Unique email
party	Political party
password	Hashed password
votes	Cached vote count
> votes
Column	Description
vote_id	Unique vote record
voter_id	One-to-one mapping (UNIQUE)
candidate_id	Candidate voted for

 This table ensures:

One vote per voter

Exact voter → candidate mapping

Accurate vote counting

Authentication & Authorization

JWT tokens are issued on successful login

Tokens are passed via HTTP headers:

Authorization: Bearer <JWT_TOKEN>


JWT payload contains role information:

{
  "voter_id": 1,
  "role": "voter"
}


or

{
  "candidate_id": 2,
  "role": "candidate"
}

API Endpoints
>Voter APIs
Method	Endpoint	Description
POST	/auth/register	Register voter
POST	/auth/login	Login voter
POST	/vote/:candidateId	Cast vote (once only)
GET	/candidates	View all candidates
>Candidate APIs
Method	Endpoint	Description
POST	/candidates/register	Register candidate
POST	/candidates/login	Login candidate
GET	/candidates/me/votes	View own votes
