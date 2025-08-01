const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ Exported async controller function
exports.createTestProject = async (req, res) => {
  try {
    const {
      name = "Test Project",
      type = "Apartment",
      priceRange = "70 Lac – 2 Crore",
      commissionType = "PERCENTAGE",
      commissionValue = "3%"
    } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        type,
        priceRange,
        commissionType,
        commissionValue
      },
    });

    res.json(project);
  } catch (err) {
    console.error("❌ Project creation failed:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
};
