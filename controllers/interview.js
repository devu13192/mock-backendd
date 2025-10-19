
const InterviewSchema = require("../models/interviewSchema.js")
const UserInterviewSchema = require("../models/userInterviewSchema.js")
const mongoose = require("mongoose")



exports.getInterviews = async (req,res) =>{
    
    const data = await InterviewSchema.find();
    
    // Log existing types for debugging
    const existingTypes = [...new Set(data.map(interview => interview.type).filter(Boolean))];
    console.log('Existing interview types in database:', existingTypes);
    
    // Migrate existing interviews that don't have difficulty field
    const interviewsToUpdate = data.filter(interview => !interview.difficulty);
    if (interviewsToUpdate.length > 0) {
        console.log(`Migrating ${interviewsToUpdate.length} interviews to add difficulty field`);
        try {
            await InterviewSchema.updateMany(
                { difficulty: { $exists: false } },
                { $set: { difficulty: 'Medium' } }
            );
            console.log('Difficulty migration completed successfully');
        } catch (error) {
            console.error('Difficulty migration failed:', error);
        }
    }
    
    // Automatic cleanup of orphaned user interviews (runs periodically)
    try {
        const existingInterviews = await InterviewSchema.find({}, 'company role');
        const validCombinations = new Set();
        existingInterviews.forEach(interview => {
            validCombinations.add(`${interview.company}|${interview.role}`);
        });
        
        const orphanedUserInterviews = await UserInterviewSchema.find({});
        const toDelete = orphanedUserInterviews.filter(userInterview => {
            const combination = `${userInterview.company}|${userInterview.role}`;
            return !validCombinations.has(combination);
        });
        
        if (toDelete.length > 0) {
            console.log(`Auto-cleanup: Found ${toDelete.length} orphaned user interviews`);
            const deletePromises = toDelete.map(userInterview => 
                UserInterviewSchema.findByIdAndDelete(userInterview._id)
            );
            await Promise.all(deletePromises);
            console.log(`Auto-cleanup: Removed ${toDelete.length} orphaned user interviews`);
        }
    } catch (error) {
        console.error('Auto-cleanup error:', error);
    }
    
    // Fetch updated data
    const updatedData = await InterviewSchema.find();
    res.send(updatedData)
}
// Server-side validation functions
const isValidCompany = (company) => {
  const trimmed = company.trim();
  
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  
  // Check for repeated characters (more than 3 consecutive)
  if (/(.)\1{3,}/.test(trimmed)) return false;
  
  // Check for keyboard patterns
  const keyboardPatterns = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
    'qwerty', 'asdf', 'zxcv', 'qazwsx', '1q2w3e', '1234567890', '0987654321',
    'dfghjklkjhg', 'sdfghjklkjhgfdsdfghjkjhgfddfghjhg', 'wertyuioiuytreert',
    'rtyuigkjbnmn', 'qwertyuiopasdfghjklzxcvbnm'
  ];
  
  const lower = trimmed.toLowerCase();
  if (keyboardPatterns.some(pattern => lower.includes(pattern))) return false;
  
  // Company names should contain letters and basic punctuation only
  if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(trimmed)) return false;
  
  // Must have at least one meaningful word
  const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
  if (words.length < 1) return false;
  
  return true;
};

const isValidRole = (role) => {
  const trimmed = role.trim();
  
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  
  // Check for repeated characters (more than 3 consecutive)
  if (/(.)\1{3,}/.test(trimmed)) return false;
  
  // Check for keyboard patterns
  const keyboardPatterns = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
    'qwerty', 'asdf', 'zxcv', 'qazwsx', '1q2w3e', '1234567890', '0987654321',
    'dfghjklkjhg', 'sdfghjklkjhgfdsdfghjkjhgfddfghjhg', 'wertyuioiuytreert',
    'rtyuigkjbnmn', 'qwertyuiopasdfghjklzxcvbnm'
  ];
  
  const lower = trimmed.toLowerCase();
  if (keyboardPatterns.some(pattern => lower.includes(pattern))) return false;
  
  // Role names should contain letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s&.,'-/]+$/.test(trimmed)) return false;
  
  // Must have at least one meaningful word
  const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
  if (words.length < 1) return false;
  
  return true;
};

const isValidQuestion = (question) => {
  const trimmed = question.trim();
  
  if (trimmed.length < 15 || trimmed.length > 500) return false;
  
  // Check for repeated characters (more than 3 consecutive)
  if (/(.)\1{3,}/.test(trimmed)) return false;
  
  // Questions should end with question mark
  if (!trimmed.endsWith('?')) return false;
  
  // Check for keyboard patterns
  const keyboardPatterns = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
    'qwerty', 'asdf', 'zxcv', 'qazwsx', '1q2w3e', '1234567890', '0987654321',
    'dfghjklkjhg', 'sdfghjklkjhgfdsdfghjkjhgfddfghjhg', 'wertyuioiuytreert',
    'rtyuigkjbnmn', 'qwertyuiopasdfghjklzxcvbnm'
  ];
  
  const lower = trimmed.toLowerCase();
  if (keyboardPatterns.some(pattern => lower.includes(pattern))) return false;
  
  // Must have meaningful words
  const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
  if (words.length < 3) return false;
  
  // Check for excessive word repetition
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
  });
  const maxWordRepetition = Math.max(...Object.values(wordCounts));
  if (maxWordRepetition > Math.ceil(words.length / 2)) return false;
  
  return true;
};

const isValidAnswer = (answer) => {
  const trimmed = answer.trim();
  
  if (trimmed.length < 3 || trimmed.length > 1000) return false;
  
  // Check for repeated characters (more than 3 consecutive)
  if (/(.)\1{3,}/.test(trimmed)) return false;
  
  // Check for keyboard patterns
  const keyboardPatterns = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
    'qwerty', 'asdf', 'zxcv', 'qazwsx', '1q2w3e', '1234567890', '0987654321',
    'dfghjklkjhg', 'sdfghjklkjhgfdsdfghjkjhgfddfghjhg', 'wertyuioiuytreert',
    'rtyuigkjbnmn', 'qwertyuiopasdfghjklzxcvbnm'
  ];
  
  const lower = trimmed.toLowerCase();
  if (keyboardPatterns.some(pattern => lower.includes(pattern))) return false;
  
  // Must have meaningful words
  const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
  if (words.length < 1) return false;
  
  // Check for excessive word repetition
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
  });
  const maxWordRepetition = Math.max(...Object.values(wordCounts));
  if (maxWordRepetition > Math.ceil(words.length / 2)) return false;
  
  return true;
};

exports.addInterview = async(req,res) =>{
    const interview = req.body;
    
    // Server-side validation
    if (!interview.company || !interview.role || !interview.questions || !Array.isArray(interview.questions)) {
        return res.status(400).json({ 
            success: false,
            message: 'Missing required fields: company, role, and questions are required' 
        });
    }
    
    // Validate company
    if (!isValidCompany(interview.company)) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter a valid company name (avoid keyboard patterns, repeated characters, or gibberish)' 
        });
    }
    
    // Validate role
    if (!isValidRole(interview.role)) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter a valid role (avoid keyboard patterns, repeated characters, or gibberish)' 
        });
    }
    
    // Validate questions
    if (interview.questions.length < 10) {
        return res.status(400).json({ 
            success: false,
            message: 'Minimum 10 questions required' 
        });
    }
    
    if (interview.questions.length > 50) {
        return res.status(400).json({ 
            success: false,
            message: 'Maximum 50 questions allowed' 
        });
    }
    
    // Validate each question and answer
    for (let i = 0; i < interview.questions.length; i++) {
        const q = interview.questions[i];
        
        if (!q.question || !q.answer) {
            return res.status(400).json({ 
                success: false,
                message: `Question ${i + 1}: Both question and answer are required` 
            });
        }
        
        if (!isValidQuestion(q.question)) {
            return res.status(400).json({ 
                success: false,
                message: `Question ${i + 1}: Please enter a meaningful question (avoid keyboard patterns, repeated characters, or gibberish)` 
            });
        }
        
        if (!isValidAnswer(q.answer)) {
            return res.status(400).json({ 
                success: false,
                message: `Answer ${i + 1}: Enter a meaningful answer (avoid keyboard patterns, repeated characters, or gibberish)` 
            });
        }
    }
    
    // Check for duplicate questions
    const questionTexts = interview.questions.map(q => q.question.toLowerCase().trim());
    const duplicates = questionTexts.filter((text, index) => questionTexts.indexOf(text) !== index);
    if (duplicates.length > 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Duplicate questions are not allowed' 
        });
    }
    
    const newInterview = new InterviewSchema(interview);
    try {
        await newInterview.save();
        res.status(201).json({
            success: true,
            message: 'Interview created successfully',
            data: newInterview
        });
    } catch (error) {
        res.status(409).json({ 
            success: false,
            message: 'Failed to create interview',
            error: error.message 
        });
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

// Helper function to cleanup orphaned user interviews
const cleanupOrphanedUserInterviews = async (deletedInterview) => {
    try {
        // Find and delete user interviews that match the deleted interview's company and role
        const result = await UserInterviewSchema.deleteMany({
            company: deletedInterview.company,
            role: deletedInterview.role
        });
        
        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} orphaned user interviews for ${deletedInterview.company} - ${deletedInterview.role}`);
        }
        
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up orphaned user interviews:', error);
        return 0;
    }
};

exports.deleteInterview = async (req, res) => {
    const id = req.params.id;
    
    try {
        // First, get the interview details before deleting
        const interviewToDelete = await InterviewSchema.findById(id);
        
        if (!interviewToDelete) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        // Delete the interview
        const deletedInterview = await InterviewSchema.findByIdAndDelete(id);
        
        // Cleanup orphaned user interviews
        const cleanedCount = await cleanupOrphanedUserInterviews(deletedInterview);
        
        res.status(200).json({ 
            message: "Interview deleted successfully",
            cleanedUserInterviews: cleanedCount
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Function to cleanup all orphaned user interviews
exports.cleanupAllOrphanedUserInterviews = async (req, res) => {
    try {
        console.log('Starting comprehensive cleanup of orphaned user interviews...');
        
        // Get all existing interviews
        const existingInterviews = await InterviewSchema.find({}, 'company role');
        
        // Create multiple sets for different matching strategies
        const validCombinations = new Set();
        const validCombinationsLower = new Set();
        const validCombinationsTrimmed = new Set();
        
        existingInterviews.forEach(interview => {
            const combination = `${interview.company}|${interview.role}`;
            const combinationLower = `${interview.company.toLowerCase()}|${interview.role.toLowerCase()}`;
            const combinationTrimmed = `${interview.company.trim()}|${interview.role.trim()}`;
            
            validCombinations.add(combination);
            validCombinationsLower.add(combinationLower);
            validCombinationsTrimmed.add(combinationTrimmed);
        });
        
        // Get all user interviews
        const allUserInterviews = await UserInterviewSchema.find({});
        
        // Find orphaned user interviews using multiple matching strategies
        const orphanedUserInterviews = allUserInterviews.filter(userInterview => {
            const combination = `${userInterview.company}|${userInterview.role}`;
            const combinationLower = `${userInterview.company.toLowerCase()}|${userInterview.role.toLowerCase()}`;
            const combinationTrimmed = `${userInterview.company.trim()}|${userInterview.role.trim()}`;
            
            // Check all matching strategies
            return !validCombinations.has(combination) && 
                   !validCombinationsLower.has(combinationLower) && 
                   !validCombinationsTrimmed.has(combinationTrimmed);
        });
        
        console.log(`Found ${orphanedUserInterviews.length} orphaned user interviews out of ${allUserInterviews.length} total`);
        
        if (orphanedUserInterviews.length === 0) {
            return res.status(200).json({ 
                message: "No orphaned user interviews found",
                cleanedCount: 0,
                totalUserInterviews: allUserInterviews.length,
                totalInterviews: existingInterviews.length
            });
        }
        
        // Log orphaned interviews before deletion
        console.log('Orphaned interviews to be deleted:');
        orphanedUserInterviews.forEach(orphaned => {
            console.log(`  - ${orphaned.company} - ${orphaned.role} (User: ${orphaned.uid})`);
        });
        
        // Delete orphaned user interviews
        const deletePromises = orphanedUserInterviews.map(userInterview => 
            UserInterviewSchema.findByIdAndDelete(userInterview._id)
        );
        
        await Promise.all(deletePromises);
        
        console.log(`Successfully cleaned up ${orphanedUserInterviews.length} orphaned user interviews`);
        
        res.status(200).json({ 
            message: `Successfully cleaned up ${orphanedUserInterviews.length} orphaned user interviews`,
            cleanedCount: orphanedUserInterviews.length,
            totalUserInterviews: allUserInterviews.length,
            totalInterviews: existingInterviews.length,
            orphanedInterviews: orphanedUserInterviews.map(ui => ({
                company: ui.company,
                role: ui.role,
                uid: ui.uid
            }))
        });
        
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({ message: "Error during cleanup", error: error.message });
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