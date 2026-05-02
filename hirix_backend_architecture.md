# Hirix Backend Architecture
**Stack:** FastAPI (Python) · 9-Layer Hexagonal + DDD + Event-Driven System

---

## FOLDER STRUCTURE

```
hirix-backend/
│
├── .env                                                — secrets (never committed)
├── .env.example
├── pyproject.toml                                      — deps, ruff, mypy config
├── Dockerfile
├── docker-compose.yml
└── Makefile                                            — dev shortcuts
│
└── app/
    ├── main.py                                         — FastAPI init, CORS, routers mount
    ├── config.py                                       — pydantic-settings, env loading
    ├── dependencies.py                                 — DB sessions, auth, rate limit deps
    │
    ├── layer1_agents/                                  [LangGraph · Stateful]
    │   ├── orchestrator.py                             — LangGraph workflow builder, state mgmt
    │   ├── decision_engine.py                          — weighted scoring, rule arbitration
    │   ├── human_review.py                             — approval queue, SLA timers
    │   ├── reasoning_trace.py                          — audit trail builder
    │   └── agents/                                     [Stateless workers]
    │       ├── screening_agent.py                      — resume eval, scoring
    │       ├── copilot_agent.py                        — recruiter assistant, RAG
    │       ├── scheduler_agent.py                      — calendar + availability
    │       ├── sourcing_agent.py                       — passive candidate search
    │       ├── outreach_agent.py                       — personalized email drafts
    │       ├── jd_agent.py                             — job description generation
    │       └── analytics_agent.py                      — report summarization
    │
    ├── layer2_adapters/                                [Concrete impls · Provider swap]
    │   ├── llm/
    │   │   ├── openai_adapter.py
    │   │   └── anthropic_adapter.py
    │   ├── db/
    │   │   ├── postgres_adapter.py
    │   │   └── redis_adapter.py
    │   ├── vector/
    │   │   └── pinecone_adapter.py                     — embed + search 400M profiles
    │   ├── messaging/
    │   │   └── kafka_adapter.py                        — produce/consume events
    │   ├── email/
    │   │   └── sendgrid_adapter.py
    │   ├── storage/
    │   │   └── s3_adapter.py
    │   └── calendar/
    │       ├── google_calendar_adapter.py
    │       └── outlook_adapter.py
    │
    ├── layer3_ports/                                   [ABC interfaces only]
    │   ├── llm_port.py                                 — LLMPort ABC: complete(), embed()
    │   ├── storage_port.py                             — upload, download, delete
    │   ├── messaging_port.py                           — publish, subscribe
    │   ├── vector_port.py                              — upsert, query similarity
    │   ├── email_port.py                               — send, template
    │   └── notification_port.py
    │
    ├── layer4_application/                             [Business workflows]
    │   ├── jobs/
    │   │   ├── create_job.py
    │   │   ├── publish_job.py                          — post to job boards, notify
    │   │   ├── close_job.py
    │   │   └── duplicate_job.py
    │   ├── candidates/
    │   │   ├── submit_application.py                   — emits application.submitted
    │   │   ├── screen_candidate.py                     — triggers L1 agent flow
    │   │   ├── move_stage.py
    │   │   ├── reject_candidate.py
    │   │   └── override_ai_decision.py
    │   ├── interviews/
    │   │   ├── schedule_interview.py
    │   │   └── submit_feedback.py
    │   ├── offers/
    │   │   ├── create_offer.py
    │   │   └── approve_offer.py
    │   └── people/
    │       ├── onboard_employee.py
    │       ├── create_review_cycle.py
    │       └── request_time_off.py
    │
    ├── layer5_domain/                                  [Zero infra deps]
    │   ├── entities/                                   [Domain objects]
    │   │   ├── job.py                                  — Job entity, value objects (Salary, Location)
    │   │   ├── candidate.py                            — Candidate, Skills, Experience
    │   │   ├── application.py                          — Application, AIDecision, Stage
    │   │   ├── employee.py
    │   │   └── interview.py
    │   ├── repositories/                               [Abstract repos]
    │   │   ├── job_repository.py
    │   │   ├── candidate_repository.py
    │   │   └── application_repository.py
    │   ├── services/
    │   │   ├── scoring_service.py                      — weighted score calc
    │   │   ├── pipeline_service.py                     — stage transition rules
    │   │   └── bias_detection_service.py
    │   └── events/                                     [Domain events]
    │       ├── application_events.py                   — ApplicationSubmitted, Screened
    │       ├── hiring_events.py                        — CandidateHired, OfferSent
    │       └── employee_events.py
    │
    ├── layer6_data/                                    [PostgreSQL · Redis · S3]
    │   ├── models/                                     [SQLAlchemy ORM]
    │   │   ├── company_model.py
    │   │   ├── user_model.py
    │   │   ├── job_model.py
    │   │   ├── candidate_model.py                      — includes pgvector embedding col
    │   │   ├── application_model.py
    │   │   ├── employee_model.py
    │   │   ├── interview_model.py
    │   │   ├── ai_decision_model.py
    │   │   ├── audit_log_model.py
    │   │   └── notification_model.py
    │   ├── repositories_impl/                          [Concrete repos]
    │   │   ├── postgres_job_repo.py
    │   │   ├── postgres_candidate_repo.py
    │   │   └── postgres_application_repo.py
    │   └── migrations/
    │       └── alembic/                                — versioned DB migrations
    │
    ├── layer7_crosscutting/                            [Applies to every layer]
    │   ├── logging.py                                  — structlog, PII masking middleware
    │   ├── tracing.py                                  — OpenTelemetry spans
    │   ├── metrics.py                                  — Prometheus counters/histograms
    │   └── rate_limiting.py                            — Redis sliding window
    │
    ├── layer8_governance/                              [Compliance · Ethics]
    │   ├── audit_log.py                                — every action persisted
    │   ├── gdpr.py                                     — right-to-erasure, anonymization
    │   ├── policy_engine.py                            — RBAC rule evaluation
    │   └── ai_ethics.py                                — bias checks, explainability
    │
    ├── layer9_resilience/                              [Fault tolerance]
    │   ├── circuit_breaker.py                          — closed/open/half-open
    │   ├── retry.py                                    — exponential backoff + jitter
    │   ├── health_checks.py                            — /health, /ready, /live
    │   └── dlq_handler.py                              — dead-letter queue replay
    │
    ├── api/
    │   └── v1/                                         [All endpoints versioned]
    │       ├── auth.py                                 — signup, login, refresh, OAuth
    │       ├── jobs.py                                 — CRUD, publish, pipeline
    │       ├── candidates.py                           — global DB, move stage, override AI
    │       ├── applications.py                         — public apply endpoint
    │       ├── ai_copilot.py                           — SSE streaming, generate-jd, salary
    │       ├── employees.py                            — HRIS: people, org chart
    │       ├── calendar.py                             — events, find-availability
    │       ├── reports.py                              — analytics endpoints
    │       ├── files.py                                — upload, presigned URLs
    │       ├── settings.py                             — company, team, integrations
    │       └── webhooks.py                             — inbound: LinkedIn, Indeed
    │
    ├── worker/                                         [Celery async tasks]
    │   ├── screening_worker.py                         — Kafka consumer → trigger L1
    │   ├── email_worker.py
    │   ├── sourcing_worker.py                          — background passive search
    │   └── celery_app.py                               — broker config
    │
    ├── schemas/                                        [Pydantic v2]
    │   ├── job_schemas.py                              — JobCreate, JobRead, JobUpdate
    │   ├── candidate_schemas.py
    │   ├── ai_schemas.py                               — AiDecision, ReasoningTrace, ScreeningResult
    │   └── event_schemas.py                            — Kafka event envelopes
    │
    ├── kafka/
    │   ├── producer.py                                 — publish events
    │   ├── consumer.py                                 — subscribe + dispatch
    │   └── topics.py                                   — topic name constants
    │
    ├── websocket/
    │   ├── manager.py                                  — connection pool, broadcast
    │   └── routes.py                                   — WS /ws/{company_id}/{user_id}
    │
    ├── tests/
    │   ├── unit/                                       — layer5 domain logic
    │   ├── integration/                                — layer4 use cases
    │   ├── api/                                        — FastAPI TestClient
    │   └── conftest.py                                 — fixtures, test DB
    │
    └── scripts/
        ├── seed_db.py                                  — demo data, plan tiers
        ├── create_kafka_topics.py
        └── backfill_embeddings.py                      — Pinecone bulk upsert
```

---

## FULL SYSTEM ARCHITECTURE — 9-Layer Hexagonal + DDD + Event-Driven

### End-to-End Request & Event Flow

```
User/UI/API (External)
  → L2 Adapter (FastAPI/gRPC) [Transform]
  → L3 Port Interface [Contract]
  → L4 Application Workflow [Orchestrate]
  → L1 Agentic Orchestrator [AI Decide]
  → L5 Domain Core Logic [Business Rules]
  → L3 Port Repo/EventBus [Persist/Emit]
  → L2 Adapter DB/Kafka/S3 [Execute]
  → L6 Infra PG/Redis/Pinecone [Store]
  ⇢ Kafka Event Bus [Async Emit]
  ⇢ L4 Workers/Consumers [Process]
  ⇢ L1 Agents Notify [Respond]

→ Sync request flow    ⇢ Async event flow
L7 / L8 / L9 apply horizontally at every node
```

---

## LAYER 1 — AGENTIC CONTROL LAYER
**Badge:** LangGraph · Plan → Act → Observe → Reflect
**Role:** Orchestrates agents · Makes decisions · Emits structured outputs

### Inputs
- Kafka / EventBus — Topic: `application.requests`
- REST / gRPC — Optional sync trigger
- Input Contract: `layer1.output.v1.json` · Transport: Kafka / REST · Format: JSON

### Input Event Schema (SCREENING_REQUIRED)
```
event_type:   "SCREENING_REQUIRED"
event_id:     "evt_01N68..."
candidate_id: "cand_123"
job_id:       "job_456"
resume_id:    "res_789"
source:       "careers_portal"
priority:     "normal"
```

### Output Event Schema (SCREENING_COMPLETED)
```
event_type:      "SCREENING_COMPLETED"
candidate_id:    "cand_123"
decision:        "SHORTLISTED"
score:           84
confidence:      0.91
human_review:    false
decision_source: "AI-RULES"
```

### 1.1 Core Components

**A. Agent Orchestrator** (LangGraph · Stateful)
- Builds & executes workflow graph
- Schedules agent tasks
- Manages execution context
- Handles retries & timeouts
- Maintains state in Redis
- Stack: LangGraph, Python, FastAPI, Redis

**B. Agents (Stateless)** — Specialized workers
- Screening Agent — evaluate candidate vs JD
- Recruiter Copilot — assist recruiters, chat/suggestions
- Interview Agent — analyze interviews
- Other Specialized agents as required
- Stack: OpenAI/Claude, Prompt Templates, Pydantic

**C. Decision Engine** (Arbitration & Scoring)
- Aggregates agent outputs
- Applies business rules
- Resolves conflicts
- Calculates final score
- Determines next action
- Confidence aggregation
- Stack: Python, Rules Engine, Custom/Drools

**D. Agent Task Queue** (Async Execution)
- Queue agent tasks
- Ensure reliability
- Decouple execution
- Support retries & DLQ
- Stack: Redis / Kafka / RabbitMQ

**E. Reasoning Trace** (Observability)
- Capture reasoning steps
- Metrics & traces
- Debug & audit support
- Correlation IDs
- Stack: OpenTelemetry, ELK / Grafana

**F. Human-in-the-Loop** (Approval System)
- Trigger human review
- SLA timers & reminders
- Escalation rules
- Auto-resolution policies
- Notifications
- Stack: FastAPI/UI, SendGrid / Slack

### 1.2 Memory (3-Tier)

| Memory Tier | Purpose | Tech |
|---|---|---|
| Session Memory (Short-term) | Conversation context · Short-lived · TTL-based | Redis · TTL keys |
| Semantic Memory (Long-term) | Candidate embeddings · Semantic search · Context retrieval | Pinecone (Vector DB) |
| Canonical State (Source of Truth) | Candidates, Jobs, Applications · Workflow state · Audit logs | PostgreSQL |

### 1.3 Internal Screening Flow (9 Steps)
1. **Receive Event** — Orchestrator receives SCREENING_REQUIRED
2. **Load Context** — Fetch candidate, job, resume, embeddings via Ports
3. **Plan & Schedule** — Build execution plan (LangGraph), schedule agent tasks
4. **Execute Agents** — Invoke agents (parallel where possible) with retries & timeouts
5. **Collect Outputs** — Agents return structured JSON (score, reasoning, confidence)
6. **Decision Engine** — Aggregate, apply rules, resolve conflicts, calculate final score
7. **Human Review?** — If required, send to approval queue and wait
8. **Final Decision** — Decision object created with audit metadata
9. **Emit Event** — Emit SCREENING_COMPLETED to Application Layer

### 1.4 Execution Model & Key Principles
- Orchestrator = Stateful — holds workflow context & execution state
- Agents = Stateless — do not persist state between calls
- Communication = Async (Events) + Optional Sync (API); agents run in parallel where possible
- Reliability = Retries (exponential backoff) · Timeouts · DLQ
- Layer 1 never accesses databases or external systems directly
- All external interactions go through Ports → Adapters
- All inputs/outputs are structured events with versioned schemas
- Every decision is auditable & traceable

---

## LAYER 2 — ADAPTERS LAYER
**Badge:** Implements Ports · Handles Retries, Resilience, Security, Data Transformation
**Role:** Concrete implementations · Provider abstraction · Observability by default

### Call Path
```
L1 Agents/Orchestrator → L3 Ports (Interface) → L2 Adapters (Implementation) → External Systems
```

### Served Ports
- LLMPort → LLM Adapters
- StoragePort → Storage Adapters
- VectorPort → Vector DB Adapters
- EventBusPort → Messaging Adapters
- AgentPort → Agent Service Adapters
- SecretsPort → Secrets Adapters
- FilePort → File/Blob Adapters
- TelemetryPort → Telemetry Adapters

### 2.2 Adapter Implementations

**2.2.1 LLM Adapters (LLMPort)**
- OpenAI Adapter · Anthropic Adapter · Azure OpenAI Adapter · Google Gemini · Cohere Adapter · Custom LLM Adapter
- Capabilities: Chat/Completions, Embeddings, Function Calling, Streaming, Usage Tracking, Prompt/Response Logging

**2.2.2 Storage Adapters (StoragePort)**
- PostgreSQL · MySQL · MongoDB Adapter · DynamoDB · Redis (Key/Value) · S3/MinIO
- Capabilities: CRUD Ops, Transactions, Connection Pooling, Pagination & Filtering, Bulk Ops, Query Optimization

**2.2.3 Vector DB Adapters (VectorPort)**
- Pinecone · Weaviate · Qdrant · Milvus · OpenSearch
- Capabilities: Embedding Upsert/Query, Similarity Search (kNN), Metadata Filtering, Hybrid Search, Namespace Mgmt, Batch Ops

**2.2.4 Messaging Adapters (EventBusPort)**
- Kafka · RabbitMQ · AWS SQS · Azure Service Bus · NATS
- Capabilities: Publish/Subscribe, Consumer Groups, Offset Mgmt, DLQ Handling, Schema Registry Integration, Exactly-Once (Idempotent)

**2.2.5 Agent Service Adapters (AgentPort)**
- Internal Agent Service · External Microservice · HTTP Agent · gRPC Agent · Function-as-a-Service
- Capabilities: Invoke Agent, Timeout & Cancellation, Circuit Breaker, Response Validation, Idempotency Key Support

**2.2.6 Auxiliary Adapters**
- Secrets: HashiCorp Vault, AWS Secrets Manager, Azure Key Vault
- File/Blob: S3 Adapter, GCS Adapter, Azure Blob
- Telemetry: OpenTelemetry, Prometheus, Datadog

### 2.3 Cross-Cutting Infrastructure (All Adapters)
- Resilience: Retry (Exponential Backoff) · Circuit Breaker · Timeout · Bulkhead Isolation
- Rate Limiting: Token/Request Rate Limiting · Adaptive Throttling · Per-tenant Quotas
- Caching: Response Caching · Contextual Caching · Configurable TTL
- Security: AuthN/AuthZ · OAuth2/API Keys · Encryption In Transit · PII Masking/Redaction
- Observability: Structured Logging · Metrics (RED/USE) · Distributed Tracing · Correlation ID

### 2.4 Adapter Execution Flow (Every Call)
1. **Receive Call** — From Ports Layer (L3) · Validate input against port contract & auth context
2. **Pre-Process** — Transform/Enrich · Map to provider format · Add headers/auth
3. **Resilience Guard** — Rate limit check · Circuit breaker check · Timeout budget check
4. **Execute Call** — Call external system via provider SDK/API
5. **Post-Process** — Map response to port contract · Validate & sanitize
6. **Record & Emit** — Update usage & cost · Emit events (if any)
7. **Return Response** — Return standardized response/error to Ports Layer

On Failure → Retry with backoff → If retries exhausted → Circuit open → Fallback/Failover → Return standardized error

---

## LAYER 3 — PORTS LAYER (Interface Layer)
**Badge:** Defines the Contract (What) · Technology-Agnostic · Stable · Versioned
**Rule:** L1 depends on Ports · L2 implements Ports · L3 has NO dependency on any other layer

### Primary Consumers
- Orchestrator — LLMPort, VectorPort
- Agents — LLMPort, StoragePort
- Decision Engine — StoragePort, EventBusPort
- Memory Manager — VectorPort, StoragePort

### What Belongs / Does NOT Belong
- ✓ Interfaces / Abstractions · Request/Response Schemas · Exception Definitions · Behavior Rules · Versioning Info
- ✗ Business Logic · Database Queries · HTTP Clients · SDK Calls · Retry Logic

### 3.2 Ports Catalog

**3.2.1 LLM Port (LLMPort)**
- Methods: `generateCompletion()`, `generateEmbedding()`, `chatCompletion()`, `rerank()`, `moderate()`
- Input: LLMRequest (model, messages, temp, maxTokens)
- Output: LLMResponse (text, usage, finishReason)
- Exceptions: LLMRateLimitEx, LLMServiceEx, LLMTimeoutEx

**3.2.2 Storage Port (StoragePort)**
- Methods: `getById()`, `find()`, `create()`, `update()`, `delete()`, `count()`
- Input: StorageQuery · Output: StorageResult
- Exceptions: StorageNotFoundException, StorageConflictEx, StorageUnavailableEx

**3.2.3 Vector Port (VectorPort)**
- Methods: `searchSimilar()`, `upsert()`, `deleteById()`, `getById()`
- Input: VectorQuery · Output: VectorResult
- Exceptions: VectorNotFoundException, VectorServiceEx, VectorTimeoutEx

**3.2.4 Event Bus Port (EventBusPort)**
- Methods: `publish()`, `subscribe()`, `acknowledge()`
- Input: EventEnvelope · Output: AckResult
- Exceptions: EventPublishEx, EventConsumeEx, EventSerializationEx

**3.2.5 Agent Port (AgentPort)**
- Methods: `invokeAgent()`, `InvokeWorkflow()`
- Input: AgentRequest · Output: AgentResponse
- Exceptions: AgentInvocationEx, AgentTimeoutEx, AgentUnavailableEx

**3.2.6 Secrets Port (SecretsPort)**
- Methods: `getSecret()`, `getSecrets()`, `rotateSecret()`
- Input: SecretRequest · Output: SecretResult
- Exceptions: SecretNotFoundException, SecretAccessEx

**3.2.7 File Port (FilePort)**
- Methods: `upload()`, `download()`, `delete()`, `signedUrl()`
- Input: FileRequest · Output: FileResult
- Exceptions: FileNotFoundException, FileUploadEx, FileAccessEx

**3.2.8 Telemetry Port (TelemetryPort)**
- Methods: `log()`, `metric()`, `trace()`, `event()`
- Input: TelemetryData · Output: AckResult
- Exceptions: TelemetryEx, TelemetryUnavailableEx

### 3.3 Contract & Behavior Rules
- All I/O are JSON (or Protobuf)
- PII must be encrypted in transport
- No sensitive data in logs
- Retry/resilience logic lives in L2, NOT in ports

### 3.5 Cross-Layer Interaction Flow
1. **L4 → L1** — Application sends SCREENING_REQUIRED event via Kafka
2. **L1 Uses Ports** — Orchestrator/Agents call ports (interfaces defined in L3)
3. **L2 Implements** — Adapters implement the ports and execute logic
4. **L6 Accessed** — Adapters call external systems (DB, APIs, etc.)
5. **Response Flows Back** — Adapter → Port → Layer 1 (Agentic)
6. **L1 Emits Result** — Emit SCREENING_COMPLETED event via EventBusPort
7. **L4 Consumes** — Application layer consumes result event

**Dependency Rule:** L1 depends on L3 (Ports). L2 depends on L3. L3 has NO dependency on any other layer.

---

## LAYER 4 — APPLICATION LAYER
**Badge:** Orchestrates Business Workflows · Owns State · Consumes Agentic Services · Emits Events
**Rule:** Stateless services where possible · State in DB · Idempotent · Observable

### Events Consumed (from L1)
- SCREENING_COMPLETED · SCREENING_FAILED · HUMAN_REVIEW_REQUESTED · AGENT_HEARTBEAT · AGENT_ERROR

### Events Published (to L1)
- SCREENING_REQUIRED · INTERVIEW_ANALYSIS_REQUIRED · REASONING_TRACE_REQUEST · FEEDBACK_REQUESTED

### Ports Used (via L3)
- EventBusPort (publish/subscribe) · StoragePort (read/write domain data)
- NotificationPort (send notifications) · ConfigPort (read configuration)
- ExternalServicePort (call external)

### 4.2 Key Components

**4.2.1 Workflow Orchestrator** (State Machines / Saga)
- Screening Workflow · Interview Workflow · Offer Workflow
- Feedback Workflow · Exception Handling · Compensation / Rollback
- Tech: Temporal / Camunda / AWS Step Functions

**4.2.2 Domain Services** (Business Logic)
- Candidate Service · Job Service · Application Service
- Interview Service · Decision Service · Notification Service
- Tech: FastAPI (Python)

**4.2.3 State Management** (Source of Truth)
- Workflow State · Candidate State · Decision State
- Audit State · Feedback State · Reference Data
- Tech: PostgreSQL / Aurora

**4.2.4 Event Manager** (Producer / Consumer)
- Event Publisher · Event Consumer · Dead Letter Queue
- Event Schema Registry · Idempotency Handler · Event Routing
- Tech: Kafka / Schema Registry (Confluent)

**4.2.5 Policy & Rule Engine** (Business Rules)
- Eligibility Rules · Scoring Rules · Approval Rules
- Escalation Rules · SLA Rules · Compliance Rules
- Tech: Drools / Custom Rule Engine

**4.2.6 API Gateway** (External Interface)
- REST / GraphQL APIs · Authentication · Rate Limiting
- API Versioning · Request Validation · Response Standardization
- Tech: Kong / Spring Cloud Gateway

**4.2.7 Notification Service** (Communication)
- Email Service · SMS Service · In-App Notifications
- Webhook Service · Template Engine · Delivery Tracking
- Tech: SendGrid / Twilio / SES

**4.2 Data & State Mgmt** (Caching / Redis)
- Reference Data Cache · User Session Cache
- Workflow Cache · Config Cache · Scoring Weights Cache
- Tech: Redis Cluster

### 4.3 End-to-End Business Workflow — Screening Flow
1. **Receive Trigger** — Job created or Application received
2. **Validate & Enrich** — Validate input, enrich candidate & job information
3. **Emit to L1** — Publish SCREENING_REQUIRED to Kafka
4. **Await Result** — Listen for SCREENING_COMPLETED or FAILED
5. **Process Result** — Persist results, update state, calculate score, apply rules
6. **Business Decision** — Apply business rules, decide next action (Shortlist/Reject/Review)
7. **Human Review?** — Route to reviewer, track SLA, collect decision
8. **Finalize** — Finalize decision, update state, trigger notifications
9. **Emit Outcome** — Publish final outcome SCREENING_OUTCOME event

### 4.4 Event Contracts

Events Published by L4 (to L1 / Other Systems):
`SCREENING_REQUIRED` · `INTERVIEW_SCHEDULED` · `HUMAN_REVIEW_REQUIRED` · `DECISION_FEEDBACK` · `HIRING_DECISION_MADE`

Events Consumed by L4 (from L1 / Other Systems):
`SCREENING_COMPLETED` · `SCREENING_FAILED` · `HUMAN_REVIEW_COMPLETED` · `AGENT_HEARTBEAT` · `AGENT_ERROR`

---

## LAYER 5 — DOMAIN CORE (Business Domain Layer)
**Badge:** Pure Business Logic · No Frameworks · No Infrastructure · DDD Aggregates
**Role:** Heart of the system — encodes what the system does, rules that govern it, value it delivers

### 5.1 Core Domain Entities (Aggregate Roots)

**Candidate (AR)**
- Fields: id, name, email, phone, location, skills, experience, education, resumeUrl, status, createdAt
- Invariant: Email must be unique
- VO children: Skills, Experience, Education

**Job (AR)**
- Fields: id, title, description, department, location, employmentType, experienceLevel, requirements, createdAt, status
- Invariant: Job title unique per org
- VO children: Requirements, Skills, ExperienceLevel, Locations

**Application (AR)**
- Fields: id, candidateId, jobId, appliedAt, currentStage, status, source, resumeSnapshot, metadata
- Invariant: Candidate can apply only once per job
- VO children: Status History, Source, Metadata

**Interview (AR)**
- Fields: id, applicationId, type, status, scheduledAt, duration, meetingUrl, interviewerIds, score, feedbackStatus
- Invariant: Interview must belong to a valid application

**Evaluation (AR)**
- Fields: id, interviewId, evaluatorId, overallScore, competencies, comments, recommendation, decidedBy
- Invariant: Score must be within defined scale

**Decision (AR)**
- Fields: id, applicationId, decisionType, decisionStage, decidedBy, notes, offerDetails
- Invariant: Decision valid for current stage only

**User / Employee (AR)**
- Fields: id, name, email, role, department, permissions, employerId
- Invariant: Role must be valid in the system

**Organization (AR)**
- Fields: id, name, type, industry, size, address, settings, billingInfo, status
- Invariant: Organization name must be unique

### 5.2 Value Objects (Immutable)
`Email` · `PhoneNumber` · `Skill` · `Money` · `Percentage` · `Address` · `DateRange` · `Rating` · `JobId` · `ApplicationId`

### 5.3 Domain Services

| Service | Responsibilities |
|---|---|
| Matching Service | Candidate-Job Matching · Skill Similarity · Score Calculation · Fit Recommendation |
| Screening Service | Resume Screening · Skill Extraction · Experience Evaluation · Shortlisting Logic |
| Evaluation Scoring Service | Score Normalization · Competency Mapping · Feedback Aggregation · Bias Mitigation |
| Decision Service | Decision Rules · Stage Progression · Offer Generation · Decision Validation |

### 5.4 Domain Events (Past-Tense Facts)
`CandidateCreated` · `JobPosted` · `ApplicationSubmitted` · `ApplicationAdvanced` · `InterviewScheduled` · `InterviewCompleted` · `EvaluationSubmitted` · `DecisionMade` · `OfferExtended` · `OfferAccepted` · `CandidateRejected`

### 5.6 Domain Invariants & Business Rules
- A candidate can apply to a job only once
- An interview must belong to a valid application
- A decision can be made only in the correct stage
- Scores must be within the defined scale
- An offer can be extended only after approval
- Candidate email must be unique
- Job must have at least one required skill
- System must maintain stage progression rules

### 5.8 End-to-End Domain Flow (10 Steps)
1. Command/Use Case — from Layer 4
2. Validate Command — Input Validation
3. Load Aggregates — via Repository Ports
4. Apply Business Rules — Domain Logic
5. Enforce Invariants — Consistency Checks
6. Update Aggregates — State Changes
7. Publish Domain Events — Past Facts
8. Return Result — Success / Failure
9. Persist Changes — via Repositories
10. Events to L6 — Event Bus / Store

---

## LAYER 6 — DATA & INFRASTRUCTURE LAYER
**Badge:** Persistent Storage · Messaging Backbone · Compute Runtime · Infrastructure Services
**Rule:** Stateless infra · Event-driven · Security by design · Observability built-in

### 6.1 Persistent Data Stores

| Store | Role | Details |
|---|---|---|
| PostgreSQL / Aurora | Operational DB (ACID · Strong Consistency) | Candidates, Jobs, Applications, Interviews, Decisions, Users & Roles, Audit Logs |
| Kafka / Redpanda | Event Store (Append-Only · Immutable History) | Domain Events, State Transitions, Agent Decisions, Workflow Events, Audit Events |
| Redis | Cache & Session (Low Latency · High Throughput) | Session Memory, Job Cache, Feature Flags, Rate Limiting, Idempotency Keys |
| OpenSearch / ElasticSearch | Search Index (Full-text + Semantic · Fast Retrieval) | Resume Search, Candidate Search, Skill Search, Full-text Search, Faceted Search |
| S3 / GCS | Blob Storage (Durable · Scalable Object Storage) | Resumes, Documents, Interview Recordings, Attachments, Reports, Media Files |
| Pinecone / FAISS | Vector Database (Vector Similarity · ANN Search) | Candidate Embeddings, Job Embeddings, Skill Embeddings, Matching Vectors, Semantic Similarity |

### 6.2 Messaging & Eventing

**Event Bus (Kafka/Redpanda)**
- Domain Events · Agent Events · System Events
- High Throughput · Durable · Ordered

**Dead Letter Queue (DLQ)**
- Failed Events · Poison Messages · Exhausted Retries
- Manual Inspection · Replay Support · Reliability & Failure Handling

**Stream Processing (Flink / Kafka Streams)**
- Event Enrichment · Real-time Aggregation · Rule Evaluation
- Anomaly Detection · State Management

### 6.3 Compute & Runtime

**Container Platform (Kubernetes)**
- Auto Scaling · Self Healing · Rolling Updates
- Service Discovery · Resource Isolation

**Microservices (All Domain Services)**
- API Services · Workflow Services · Matching Services
- Notification Services · Utility Services
- High Availability · Independent Deploy

**Serverless / Functions (Lambda / Cloud Run)**
- Event Handlers · File Processing · Scheduled Jobs
- Integrations · On-demand Tasks · Pay-per-Use · Auto Scale

### 6.4 Infrastructure Services
- API Gateway (Kong / AWS GW) — Routing · Rate Limiting · Authentication · Request Validation
- Service Mesh (Istio / Linkerd) — mTLS · Load Balancing · Traffic Control · Observability
- CDN (CloudFront / Fastly) — Static Assets · Edge Caching · DDoS Protection · Geo Distribution
- Monitoring (Prometheus / Grafana) — Infra Metrics · App Metrics · Alerts · Dashboards · SLO Monitoring
- Logging (ELK / Loki) — Centralized Logs · Log Aggregation · Search & Filter · Retention Policies
- Tracing (OpenTelemetry / Jaeger) — Distributed Tracing · Request Flow · Latency Analysis · Service Map
- Backup & DR (CloudFront) — Automated Backups · PITR · Cross-Region Replication · DR Drills

### 6.5 Data Governance & Lifecycle
- Data Quality — Validation Rules · Data Profiling · Cleansing · Deduplication · Consistency
- Data Lineage — Source Tracking · Transformation Flow · Impact Analysis · Metadata Catalog
- Data Retention — Retention Policies · TTL Management · Auto Purge · Legal Hold
- Data Security — Encryption at rest/transit · Tokenization · PII Masking · Access Control · Row-Level Security
- Compliance — Audit Trails · Regulatory Policies · Data Privacy (GDPR) · Compliance Reports

---

## LAYER 7 — CROSS-CUTTING CONCERNS
**Badge:** Applies to ALL Layers · Observability · Security · Governance · Operational Excellence
**Principle:** Observability is built-in, not bolted-on · Security is everyone's responsibility

### Tech Stack
- Logging: ELK / OpenSearch / Loki
- Metrics: Prometheus / Grafana
- Tracing: OpenTelemetry / Jaeger
- Security: Vault / AWS KMS / WAF
- SIEM: Splunk / Microsoft Sentinel
- Compliance: OneTrust / Drata
- IAM: Okta / Azure AD / KeyCloak

### 7.1 Observability & Monitoring

**Centralized Logging (ELK/Loki)**
- Application Logs · Security Logs · Audit Logs · Access Logs · Infrastructure Logs
- Correlation & Search — Unified · Searchable · Retained

**Metrics & Monitoring (Prometheus/Grafana)**
- Infra Metrics (CPU, Mem) · App Metrics (RPS, Errors) · Business Metrics (KPIs)
- Custom Dashboards · Threshold Alerts · Anomaly Detection — Real-time Visibility

**Distributed Tracing (OpenTelemetry/Jaeger)**
- Request Tracing · Event Tracing · Service Dependencies
- Latency Analysis · Error Correlation · Trace Visualization — End-to-End Visibility

**Business Observability**
- Workflow Metrics · SLA/SLA Violations · Conversion Metrics
- Agent Performance · Decision Accuracy · Operational KPIs

**Health & Availability**
- Health Checks · Synthetic Monitoring · Dependency Checks
- Service Status · Uptime Monitoring · Incident Detection

**Alerting & Notification (AlertManager/SNS)**
- Multi-channel Alerts · Severity Routing · Escalation Policies
- On-call Routing · Alert Deduplication · Noise Reduction

### 7.2 Security & Privacy

**Identity & Access Mgmt (IAM/Cognito/KeyCloak)**
- SSO / OAuth / OIDC · RBAC / ABAC · MFA / 2FA · User Lifecycle Mgmt · Service Accounts

**Data Protection (Encryption/KMS)**
- Encryption At Rest · Encryption In Transit · Data Masking · Tokenization · Key Management · No Secrets in Code

**Secrets Management (Vault/AWS SM)**
- API Keys · DB Credentials · Tokens · Certificates · Rotation & TTL · Key Management · Access Control

**Application Security (DevSecOps)**
- Input Validation · OWASP Top 10 · Dependency Scanning · SAST/DAST · Security Testing · Secure by Design

**Network Security (VPC/WAF/Firewall)**
- VPC & Subnet Isolation · Security Groups · WAF/DDoS Protection · API Gateway Security · Private Endpoints

**Compliance & Privacy (GDPR/SOC2/ISO)**
- Data Classification · PII Detection · Consent Management · Right to Erasure · Audit & Evidence · Privacy by Design

### 7.3 Governance & Compliance
- Policy Management — Security, Access, Data, Retention Policies · Naming Standards · Centralized Policy Hub
- Audit & Accountability — Audit Logs · Data Access Logs · Admin Actions · Config Changes · Immutable Audit Trail

### 7.4 Operational Excellence
- Performance Management — Capacity Planning · Performance Testing · Load Testing · Bottleneck Analysis
- Reliability Engineering — SLO/SLI/SLA · Error Budgeting · Availability Targets · Chaos Testing
- Incident Management — Detection · Triage & Prioritization · Response Playbooks · Postmortems · RCA
- Continuous Improvement — Metrics Review · Process Improvement · Automation Optimization · Feedback Loops

---

## LAYER 8 — GOVERNANCE & COMPLIANCE LAYER
**Badge:** Regulatory Compliance · Policy Enforcement · Risk Management · Ethics · Auditability
**Principle:** Governance is built-in · Policies are centralized · Compliance is continuous

### Governance Domains
- **Data Governance:** Data Ownership, Quality, Classification, Lineage, Catalog
- **Access Governance:** Identity & Access, Role Mgmt, Access Reviews, Segregation of Duties
- **Policy Governance:** Policy Definition, Versioning, Lifecycle, Distribution, Enforcement
- **Risk Governance:** Risk ID, Assessment, Scoring, Monitoring, Reporting
- **Ethics & AI Governance:** AI Model Governance, Bias & Fairness, Explainability, Human Oversight
- **Vendor Governance:** Assessment, Contracts & SLA, Risk Management, Third-Party Compliance

### Compliance Frameworks
`GDPR` · `CCPA / CPRA` · `SOC 2` · `ISO 27001` · `HIPAA` · `AI Act (EU)` · `NIST CSF` · `PCI DSS`

### 8.2 Core Capabilities

**Policy Engine (Decision as Code)**
- Rule Evaluation · Regulation Mapping · Context-Aware · Dynamic Enforcement
- Tech: OPA / Open Policy Agent

**Rule & Control Library**
- Predefined Controls · Preventive Controls · Business Rules · Risk Controls · Reusable Controls

**Control Enforcement (Enforce Everywhere)**
- Real-time Enforcement · Regulatory Checks · Detective Controls · Corrective Controls

**Continuous Monitoring (Always Monitoring)**
- Real-time Monitoring · Policy Monitoring · Threshold Alerts · Drift Detection

**Audit & Evidence Mgmt (Evidence Ready)**
- Evidence Collection · Audit Trails (Immutable) · Logs & Time Stamping

**Reporting & Dashboards (Insights & Visibility)**
- Compliance Reports · Audit Reports · Executive Dashboards · Risk Reports

**Approval & Exception Mgmt (Controlled Exceptions)**
- Exception Requests · Risk-based Approval · SoD Approvals · Exception Tracking

**5 Key Controls (Applied System-wide)**
- Access Control (RBAC, ABAC, MFA)
- Data Classification (Public / PII / Confidential)
- Data Encryption (Transit & Rest)
- Audit Logging (All Actions, Tamper-Proof)
- Retention & Disposal · Segregation of Duties

### 8.7 End-to-End Governance Flow (11 Steps)
1. **Event / Action** — Occurs in any layer (1–9)
2. **Event Logged** — Logs, Metrics, Traces, Detail
3. **Ingest & Classify** — Governance Layer: classify PII, sensitivity type
4. **Policy Evaluation** — Rules Applied (Policy Engine)
5. **Control Check** — Controls Library: compliance check
6. **Risk Assessment** — Risk Engine: score & impact
7. **Decision** — Allow/Block · Alert/Approve
8. **Action Taken** — Enforced in original layer
9. **Audit & Evidence** — Recorded in immutable store
10. **Dashboards & Detect** — Real-time dashboards updated
11. **Feedback Loop** — Improve policies & controls

---

## LAYER 9 — FAILURE & RESILIENCE LAYER
**Badge:** Fault Tolerance · Graceful Degradation · Incident Response · Business Continuity
**Principle:** Resilience is built-in · Fail fast, recover faster · Detect early · Contain fast

### Tech Stack
- Monitoring: Prometheus / Grafana / Datadog
- Logging: ELK / OpenSearch / Loki
- Tracing: OpenTelemetry / Jaeger / Tempo
- Alerting: AlertManager / PagerDuty
- Chaos Engg: Gremlin / Litmus / Chaos Mesh
- Incident Mgmt: PagerDuty / ServiceNow / Jira
- Backup/DR: AWS Backup / Velero / Veeam

### 9.1 Failure Detection & Signaling

**Health Checks** — Liveness Checks · Readiness Checks · Startup Probes · Dependency Checks · Synthetic Checks
**Metrics & Thresholds** — Infra Metrics · App Metrics · Business Metrics · SLO/SLA Tracking · Error Rate Thresholds
**Anomaly Detection** — Behavior Anomalies · Traffic Anomalies · Latency Anomalies · Noise Reduction · ML-based Detection
**Log Analysis** — Error Pattern Detection · Exception Correlation · Trace Correlation · Root Cause Hints
**Event Correlation** — Multi-source Events · Causal Correlation · Timeline Reconstruction · Impact Analysis · Blast Radius Detection
**Alerting & Routing** — Smart Alerting · Deduplication · Escalation Policies · On-call Routing · Noise Suppression

### 9.2 Resilience Mechanisms

**Retry Mechanisms** — Exponential Backoff · Jittered Retries · Max Attempts · Idempotent Retries · Retry Budget
**Timeouts & Cancellation** — Per-call Timeouts · Circuit-level Timeouts · Global Deadlines · Cancellation Tokens · Hedged Requests
**Circuit Breaker** — Closed / Open / Half-Open · Failure Threshold · Success Threshold · Regional Failover · Auto Recovery
**Bulkhead Isolation** — Thread Pools · Connection Pools · Resource Pools · Service Isolation · Traffic Throttling
**Rate Limiting** — Per-user / Per-tenant · Per-service / Global · Dynamic Limits · Adaptive Throttling · Backpressure Support
**Fallback & Degradation** — Cached Fallbacks · Static Fallbacks · Graceful Degradation · Feature Toggling · Alternative Paths
**Idempotency** — Idempotency Keys · Duplicate Detection · Exactly-Once Effect · Safe Retries · State Consistency
**Compensation (Sagas)** — Saga Rollbacks · State Undo · Reverse Operations · Consistency Repair

### 9.3 Recovery & Self-Healing

**Auto Recovery** — Auto Restart Services · Auto Scale Resources · Auto Rebalance Traffic · Auto Clear Stuck State · Auto Reconnect
**Failover (Active/Passive & Active/Active)** — Multi-AZ Failover · Regional Failover · Data Failover
**Replication** — Data Replication · Queue Replication · Cross-Region Replication · Read Replica Failover · State Sync
**Dead Letter Handling** — DLQ Capture · DLQ Alerting · DLQ Replay · Poison Message Handling · Quarantine & Fix

### 9.4 Business Continuity

**Backup Strategy** — Automated Backups · Point-in-Time Recovery · Multi-AZ · Immutable Backups · Backup Verification
**Disaster Recovery** — DR Runbooks · RTO/RPO Targets · Cross-Region DR · Infra as Code · Failover Drills
**Chaos Engineering** — Failure Injection · Game Days · Chaos Experiments · Resilience Testing · Learn & Improve
**SLA / SLO Management** — Define SLOs · Error Budgets · Capacity Scaling · SLA Monitoring · SLO Alerts · SLO Reviews
**Capacity & Scaling** — Auto Scaling · Predictive Scaling · Headroom Management · Load Shedding · Burst Capacity

### 9.6 Resilience Lifecycle (10 Steps)
1. **Problem Occurs** — Detected in any layer
2. **Detection** — Health Check / Alert / Anomaly / Threshold
3. **Signal & Correlate** — Retry / Timeout / Circuit Breaker / Throttle
4. **Mitigation** — Correlate Impact
5. **Fallback / Degrade** — Use Fallback Path · Graceful Degradation
6. **Recovery** — Auto Recovery / Failover · Fix / Restart / Heal
7. **Validation** — Health Verification · Data / State Check
8. **Restore Normal** — Traffic Ramp-up · Return to Normal
9. **Post-Incident** — Analysis / RCA
10. **Continuous Improve** — Update Policies · Prevent Recurrence

**Principles:** Detect Early → Contain Fast → Recover Automatically → Learn Continuously → Strengthen Resilience

---

## ARCHITECTURE SUMMARY — Key Design Principles

1. Hexagonal Architecture: all external calls go through Ports → Adapters
2. Domain Core (L5) has zero dependency on frameworks or infrastructure
3. Event-driven async backbone (Kafka) decouples all layers
4. L1 Agents are stateless; only the Orchestrator holds execution state
5. All I/O are structured, versioned, schema-validated JSON events
6. LLM calls are minimized: rules-first, LLM only when necessary (cost-aware routing)
7. Every decision is auditable, traceable, and explainable by design
8. PII is encrypted at rest & in transit; masked in logs everywhere
9. Resilience is built-in at every layer: retry, circuit break, saga, DLQ
10. L7, L8, L9 are horizontal — they apply to every other layer simultaneously

**Data access routing:** L4 (Application) → L3 (Ports) → L2 (Adapters) → L6 (Data & Infrastructure)
— ensures consistency, security, and separation of concerns
