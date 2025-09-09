
const InterviewSchema = require("../models/interviewSchema.js")
const mongoose = require("mongoose")



exports.getInterviews = async (req,res) =>{
    
    const data = await InterviewSchema.find();
    res.send(data)
}
exports.addInterview = async(req,res) =>{
    const interview = req.body
    const newInterview= new InterviewSchema(interview)
    try {
        newInterview.save()
        res.status(201).json(newInterview);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }

}

exports.getInterviewById= async (req,res) =>{
    const id = req.params.id
    const data = await InterviewSchema.findById(id);
    res.send(data)
}

exports.updateCount= async (req,res) =>{
    const id = req.params.id
    const data = await InterviewSchema.findByIdAndUpdate(id, { $inc: { count: 1 } }, { new: true })
    .then((updatedInterview) => {
      // Handle the updated interview
      console.log(updatedInterview);
    })
    .catch((error) => {
      // Handle the error
      console.error(error);
    });
    res.send(data)
}

exports.updateInterview = async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    
    try {
        const updatedInterview = await InterviewSchema.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        res.status(200).json(updatedInterview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteInterview = async (req, res) => {
    const id = req.params.id;
    
    try {
        const deletedInterview = await InterviewSchema.findByIdAndDelete(id);
        
        if (!deletedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        res.status(200).json({ message: "Interview deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Seed a multi-company interview with 11 realistic questions
exports.seedInterviews = async (req, res) => {
    try {
        const seedDoc = {
            company: "Multi-Company Prep",
            role: "Software Engineer",
            type: "Mixed",
            questions: [
                {
                    question: "Given an array of integers, return the length of the longest increasing subsequence.",
                    answer: "Use O(n log n) patience sorting approach: maintain a tails array and place each number via binary search.",
                    type: "Algorithms/DP"
                },
                {
                    question: "Tell me about a time you disagreed with a manager and how you handled it.",
                    answer: "STAR: data-driven reasoning, align with customer impact, respectful escalation, outcome and learnings.",
                    type: "HR/Leadership"
                },
                {
                    question: "Design a news feed system that supports ranking, personalization, and real-time updates.",
                    answer: "Choose fan-out on write/read, timeline storage, ranker with feature store, caches, async pipelines, backfills, rate limits.",
                    type: "System Design"
                },
                {
                    question: "Implement a thread-safe bounded blocking queue with enqueue/dequeue APIs.",
                    answer: "Mutex with two condition variables (notEmpty, notFull); handle spurious wakeups and fairness.",
                    type: "Concurrency/OS"
                },
                {
                    question: "Explain how HTTPS establishes a secure connection and how certificate pinning helps.",
                    answer: "TLS handshake, session keys, CA trust chain; pinning binds to expected cert/key to mitigate MITM.",
                    type: "Networking/Security"
                },
                {
                    question: "When choose write-through vs write-back caching for a high-read service?",
                    answer: "Write-through favors consistency/durability with higher latency; write-back lowers latency but risks on evict/crash.",
                    type: "Systems/Caching"
                },
                {
                    question: "Explain exactly-once processing semantics in a streaming pipeline.",
                    answer: "Idempotent sinks, dedup keys, transactional writes, checkpointing of offsets+state, EOS producers/consumers.",
                    type: "Distributed Systems"
                },
                {
                    question: "Model listings, bookings, and users to prevent double-booking and allow flexible search.",
                    answer: "Bookings with unique (listing,date); transactional booking; geo and inverted indexes for search.",
                    type: "DBMS/Data Modeling"
                },
                {
                    question: "Design an idempotent payment API to handle retries safely.",
                    answer: "Idempotency key per request with stored request hash+result; dedupe; TTL and conflict rules; safe side-effects.",
                    type: "API/Idempotency"
                },
                {
                    question: "How would you detect and mitigate a slow memory leak in production?",
                    answer: "Observe RSS/heap trends; capture heap profiles; identify growth paths; guardrails, canaries, limits; fix and verify.",
                    type: "Observability/Performance"
                },
                {
                    question: "Describe priority inversion and how to mitigate it.",
                    answer: "Low-priority task holding a lock blocks high-priority; use priority inheritance/ceilings and shorten critical sections.",
                    type: "OS/Real-time"
                }
            ]
        };

        const existing = await InterviewSchema.findOne({ company: seedDoc.company, role: seedDoc.role });
        if (existing) {
            existing.questions = seedDoc.questions;
            existing.type = seedDoc.type;
            const saved = await existing.save();
            return res.status(200).json({ message: "Seed updated", interview: saved });
        }

        const created = await InterviewSchema.create(seedDoc);
        return res.status(201).json({ message: "Seed created", interview: created });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Replace all interviews with six new company sets
exports.seedReplaceSix = async (req, res) => {
    try {
        // Remove all existing interview documents
        await InterviewSchema.deleteMany({});

        const docs = [
            {
                company: "Google",
                role: "Software Engineer",
                type: "Algorithms & Systems",
                questions: [
                    { question: "Find the length of the longest increasing subsequence.", answer: "O(n log n) with patience sorting and binary search on tails.", type: "Algorithms" },
                    { question: "Given a binary tree, return its level order traversal.", answer: "Use BFS with a queue; collect nodes level by level.", type: "Data Structures" },
                    { question: "Top-K frequent elements in an array.", answer: "Hash map for counts + min-heap of size K or bucket sort.", type: "Algorithms" },
                    { question: "Design a URL shortener.", answer: "HashID/base62 keys, read-heavy cache, write path with collision checks, DB sharding.", type: "System Design" },
                    { question: "Detect a cycle in a linked list.", answer: "Floyd’s tortoise-hare two-pointer technique.", type: "Data Structures" },
                    { question: "Concurrency issues in a shared counter.", answer: "Use atomic operations/mutex; avoid lost updates; consider contention.", type: "Concurrency" },
                    { question: "Explain CAP theorem.", answer: "In partitions, you choose Consistency or Availability; CP vs AP trade-offs.", type: "Distributed Systems" },
                    { question: "Optimize a hot CPU function.", answer: "Profile first, reduce allocations, precompute, vectorize if possible.", type: "Performance" }
                ]
            },
            {
                company: "Amazon",
                role: "SDE",
                type: "Leadership & Backend",
                questions: [
                    { question: "Tell me about a time you disagreed with a decision.", answer: "Use STAR; data-driven, customer-obsession, respectfully escalate, results.", type: "Leadership" },
                    { question: "Design an inventory service for an e-commerce checkout.", answer: "Reserve stock, idempotent operations, saga/compensation, eventual consistency.", type: "System Design" },
                    { question: "Implement LRU cache.", answer: "Hash map + doubly linked list for O(1) get/put.", type: "Data Structures" },
                    { question: "Make a service resilient to downstream latency spikes.", answer: "Timeouts, retries with backoff, circuit breakers, bulkheads, caching.", type: "Reliability" },
                    { question: "Difference between at-least-once and exactly-once.", answer: "At-least-once needs idempotency; exactly-once via transactions/dedup.", type: "Distributed Systems" },
                    { question: "Paginate a large dataset efficiently.", answer: "Keyset pagination over offset for stability and performance.", type: "Databases" },
                    { question: "Secure a public API.", answer: "AuthN (OAuth/JWT), AuthZ (scopes), rate limits, audit logs, WAF.", type: "Security" },
                    { question: "Design a metrics pipeline.", answer: "Agents → collectors → queue → TSDB; cardinality control; downsampling; SLOs.", type: "Observability" }
                ]
            },
            {
                company: "Microsoft",
                role: "Software Engineer",
                type: "OS & Cloud",
                questions: [
                    { question: "Implement a bounded blocking queue.", answer: "Mutex + two condition variables; handle spurious wakeups.", type: "Concurrency" },
                    { question: "Explain virtual memory and page faults.", answer: "Address translation, TLB, demand paging, minor/major faults implications.", type: "Operating Systems" },
                    { question: "Design a blob storage service.", answer: "Sharded metadata, object storage, consistency model, multipart upload, CDN.", type: "System Design" },
                    { question: "When to use gRPC vs REST?", answer: "gRPC for low-latency typed RPC; REST for web compatibility and simplicity.", type: "APIs" },
                    { question: "Implement topological sort.", answer: "Kahn’s algorithm with indegree queue or DFS post-order reverse.", type: "Algorithms" },
                    { question: "Diagnose high CPU in production.", answer: "Capture flamegraphs/profiles, isolate hot paths, roll out fix via canary.", type: "Performance" },
                    { question: "Eventual vs strong consistency.", answer: "Latency and availability trade-offs; choose per use case.", type: "Distributed Systems" },
                    { question: "Deadlock conditions and prevention.", answer: "Mutual exclusion, hold-and-wait, no preemption, circular wait; order locks.", type: "Operating Systems" }
                ]
            },
            {
                company: "Meta",
                role: "Backend Engineer",
                type: "Feeds & Relevance",
                questions: [
                    { question: "Design a personalized news feed.", answer: "Write/read fanout trade-offs, feature store, ranking, caching, backfills.", type: "System Design" },
                    { question: "Implement rate limiting across a fleet.", answer: "Token bucket with Redis/memcache, sharding, per-user+global quotas.", type: "Reliability" },
                    { question: "Message deduplication at scale.", answer: "Idempotency keys, bloom filters, time-bounded stores.", type: "Distributed Systems" },
                    { question: "Database sharding strategies.", answer: "Hash/range/geo sharding; rebalancing; hotspots handling.", type: "Databases" },
                    { question: "Cache invalidation tactics.", answer: "Write-through, write-back, TTL, explicit invalidation on writes.", type: "Caching" },
                    { question: "Design A/B experimentation infra.", answer: "Bucketing, exposure logging, metrics, guardrails, CUPED, stats power.", type: "Experimentation" },
                    { question: "Serialize and compress large payloads.", answer: "Protobuf/Avro + gzip/zstd; schema evolution; back-compat.", type: "Systems" },
                    { question: "Implement consistent hashing.", answer: "Ring with virtual nodes to distribute load and ease rebalancing.", type: "Algorithms" }
                ]
            },
            {
                company: "Apple",
                role: "iOS Engineer",
                type: "Mobile & Security",
                questions: [
                    { question: "Explain TLS handshake and pinning.", answer: "ECDHE, cert chain, session keys; pin public key to prevent MITM.", type: "Security" },
                    { question: "Optimize app launch time.", answer: "Lazy load heavy deps, defer work, measure with instruments, reduce I/O.", type: "Performance" },
                    { question: "Persist offline data securely.", answer: "Keychain for secrets, encrypted Core Data/SQLite, background sync.", type: "Mobile" },
                    { question: "Handle background tasks reliably.", answer: "Use background fetch/URLSession, respect OS limits, retries.", type: "Mobile" },
                    { question: "UI rendering pipeline on iOS.", answer: "Layout → display → Core Animation; avoid main-thread blocking.", type: "iOS" },
                    { question: "Memory management in Swift ARC.", answer: "Strong/weak/unowned refs; avoid cycles with weak/delegate patterns.", type: "iOS" },
                    { question: "Accessibility best practices.", answer: "Labels, traits, dynamic type, contrast, VoiceOver testing.", type: "UX" },
                    { question: "Network reachability and retries.", answer: "Monitor path changes, exponential backoff, idempotent requests.", type: "Networking" }
                ]
            },
            {
                company: "Uber",
                role: "Backend Engineer",
                type: "Real-time & Maps",
                questions: [
                    { question: "Match riders to drivers at scale.", answer: "Geo-index (quadtrees), dispatch windows, surge pricing, load shedding.", type: "System Design" },
                    { question: "Exactly-once in streaming.", answer: "Transactional sinks, checkpointed state+offsets, idempotent producers.", type: "Streaming" },
                    { question: "Estimate ETA with live traffic.", answer: "Graph weights from telemetry, incremental updates, ML corrections.", type: "Algorithms" },
                    { question: "Design trip state machine.", answer: "Enumerate states, idempotent transitions, durability, audit logging.", type: "Backend" },
                    { question: "Hot partition mitigation in Kafka.", answer: "Better partition key, sticky partitioning, batching, scaling consumers.", type: "Distributed Systems" },
                    { question: "Circuit breaker design.", answer: "Closed/Open/Half-open states, failure thresholds, jittered backoff.", type: "Reliability" },
                    { question: "Idempotent charge API.", answer: "Idempotency keys, dedup store, side-effect containment, retries.", type: "APIs" },
                    { question: "Blue/green vs canary deployments.", answer: "Blast radius control, automated rollbacks, metric guardrails.", type: "DevOps" }
                ]
            }
        ];

        const created = await InterviewSchema.insertMany(docs);
        return res.status(201).json({ message: "Replaced all interviews with six new companies", count: created.length, ids: created.map(d => d._id) });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Normalize all interview.type and nested questions[].type to a single allowed value
// Allowed examples (per UI): DBMS, Operating System, System Software, Computer Networks, HR
exports.normalizeTypes = async (req, res) => {
    try {
        const requestedType = (req.body && typeof req.body.type === 'string' && req.body.type.trim()) || 'HR'
        const typeValue = requestedType
        const interviews = await InterviewSchema.find({})
        let updated = 0
        for (const doc of interviews) {
            doc.type = typeValue
            if (Array.isArray(doc.questions)) {
                doc.questions = doc.questions.map(q => ({
                    ...q,
                    type: typeValue
                }))
            }
            await doc.save()
            updated += 1
        }
        return res.status(200).json({ message: 'Normalized types', type: typeValue, updated })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}