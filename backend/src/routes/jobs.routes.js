const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

/**
 * POST /jobs
 * body: { taskName: string, payload: object, priority: "low"|"medium"|"high" }
 */
router.post("/", async (req, res) => {
  try {
    const { taskName, payload, priority } = req.body;

    // basic validation
    if (!taskName || typeof taskName !== "string") {
      return res.status(400).json({ message: "taskName is required (string)" });
    }

    if (payload === undefined || payload === null || typeof payload !== "object") {
      return res.status(400).json({ message: "payload must be a JSON object" });
    }

    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({ message: "priority must be low|medium|high" });
    }

    const job = await prisma.job.create({
      data: {
        taskName,
        payload,
        priority, // Prisma enum
        status: "pending",
      },
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error("POST /jobs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /jobs
 * optional query: status, priority
 */
router.get("/", async (req, res) => {
  try {
    const { status, priority } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(jobs);
  } catch (err) {
    console.error("GET /jobs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /jobs/:id (job detail)
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json(job);
  } catch (err) {
    console.error("GET /jobs/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
