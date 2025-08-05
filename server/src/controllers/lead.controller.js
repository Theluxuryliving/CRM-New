const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const normalizePhone = (phone) => {
  return phone.replace(/^(\+92|0092|92|0)/, '').replace(/[^0-9]/g, '').slice(-10);
};

// 🔍 GET all leads
const getLeads = async (req, res) => {
  const { role, userId } = req.user;
  const { page = 1, limit = 10, search = '', status = '', projectId = '', agentId = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let where = {};
  if (role === 'AGENT') {
    where.assignedToId = userId;
  } else if (role === 'MANAGER') {
    where.OR = [{ assignedTo: { managerId: userId } }, { assignedToId: userId }];
  } else if (role === 'SR_MANAGER') {
    where.OR = [{ assignedTo: { srManagerId: userId } }, { assignedToId: userId }];
  } else if (role === 'DIRECTOR') {
    where.OR = [{ assignedTo: { directorId: userId } }, { assignedToId: userId }];
  }

  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (projectId) where.projectId = parseInt(projectId);
  if (agentId) where.assignedToId = parseInt(agentId);

  try {
    const [items, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { name: true } },
          project: { select: { name: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lead.count({ where })
    ]);

    const leads = items.map(l => ({
      ...l,
      agentName: l.assignedTo?.name || '',
      projectName: l.project?.name || ''
    }));

    res.json({ items: leads, totalCount, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) {
    console.error("❌ Failed to fetch leads:", err);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

// 👁️ GET lead by ID
const getLeadById = async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  try {
    const where = { id: parseInt(id) };

    if (role === 'AGENT') {
      where.assignedToId = userId;
    } else if (role === 'MANAGER') {
      where.OR = [{ assignedTo: { managerId: userId } }, { assignedToId: userId }];
    } else if (role === 'SR_MANAGER') {
      where.OR = [{ assignedTo: { srManagerId: userId } }, { assignedToId: userId }];
    } else if (role === 'DIRECTOR') {
      where.OR = [{ assignedTo: { directorId: userId } }, { assignedToId: userId }];
    }

    const lead = await prisma.lead.findFirst({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true } }
      }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found or unauthorized' });
    }

    res.json(lead);
  } catch (error) {
    console.error('❌ Failed to fetch lead by ID:', error);
    res.status(500).json({ message: 'Error fetching lead' });
  }
};

// ➕ CREATE Lead
const createLead = async (req, res) => {
  try {
    const data = req.body;
    const phoneKey = normalizePhone(data.phone);

    const existing = await prisma.lead.findFirst({
      where: { phone: { contains: phoneKey } },
      include: { assignedTo: { select: { name: true } } }
    });

    if (existing) {
      return res.status(200).json({ exists: true, message: `Lead already exists with Agent ${existing.assignedTo?.name || 'Unknown'}` });
    }

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        country: data.country,
        city: data.city,
        areaInterestedIn: data.areaInterestedIn,
        planInterestedIn: data.planInterestedIn,
        propertyType: data.propertyType,
        projectId: data.projectId ? parseInt(data.projectId) : null,
        budget: parseInt(data.budget) || 0,
        planToPurchase: data.planToPurchase,
        leadSource: data.leadSource,
        notes: data.notes || '',
        status: data.status || 'NEW',
        assignedToId: data.assignedToId || req.user.userId,
        createdById: req.user.userId
      }
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error("❌ Lead creation failed:", err);
    res.status(500).json({ message: 'Create failed' });
  }
};

// 📥 IMPORT Leads
const importLeads = async (req, res) => {
  try {
    let leads = [];
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const buffer = fs.readFileSync(req.file.path);
      fs.unlinkSync(req.file.path);

      if (ext === '.csv') {
        leads = parse(buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } else if (ext === '.xlsx') {
        const workbook = xlsx.read(buffer);
        const sheetName = workbook.SheetNames[0];
        leads = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        return res.status(400).json({ message: 'Unsupported file format' });
      }
    } else if (Array.isArray(req.body)) {
      leads = req.body;
    } else {
      return res.status(400).json({ message: 'Invalid import format' });
    }

    const errors = [];
    const validLeads = [];

    for (const [i, l] of leads.entries()) {
      const phoneKey = normalizePhone(l.phone);
      if (!l.name || !l.phone || !l.country || !l.city || !l.areaInterestedIn || !l.planInterestedIn || !l.propertyType || !l.planToPurchase || !l.leadSource) {
        errors.push({ row: i + 2, ...l, error: 'Missing required fields' });
        continue;
      }

      const duplicate = await prisma.lead.findFirst({
        where: { phone: { contains: phoneKey } },
        include: { assignedTo: { select: { name: true } } }
      });

      if (duplicate) {
        errors.push({ row: i + 2, ...l, error: `Duplicate - already with ${duplicate.assignedTo?.name || 'Unknown'}` });
        continue;
      }

      let projectId = null;
      if (l.projectName) {
        let project = await prisma.project.findFirst({ where: { name: l.projectName } });
        if (!project) {
          project = await prisma.project.create({ data: { name: l.projectName } });
        }
        projectId = project.id;
      }

      validLeads.push({
        name: l.name,
        phone: l.phone,
        email: l.email,
        country: l.country,
        city: l.city,
        areaInterestedIn: l.areaInterestedIn,
        planInterestedIn: l.planInterestedIn,
        propertyType: l.propertyType,
        projectId,
        budget: parseInt(l.budget) || 0,
        planToPurchase: l.planToPurchase,
        leadSource: l.leadSource,
        notes: l.notes || '',
        status: l.status || 'NEW',
        assignedToId: req.user.userId,
        createdById: req.user.userId
      });
    }

    const created = await prisma.lead.createMany({ data: validLeads });
    res.json({ message: `Imported ${created.count} leads`, errors });
  } catch (err) {
    console.error('❌ Import failed:', err);
    res.status(500).json({ message: 'Import failed' });
  }
};

// ✏️ UPDATE
const updateLead = async (req, res) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(lead);
  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(500).json({ message: 'Update failed' });
  }
};

// ❌ DELETE
const deleteLead = async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    res.status(500).json({ message: 'Delete failed' });
  }
};

// 🔁 REASSIGN
const reassignLead = async (req, res) => {
  const { assignedToId } = req.body;
  try {
    const updated = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: { assignedToId }
    });
    res.json(updated);
  } catch (err) {
    console.error("❌ Reassignment failed:", err);
    res.status(500).json({ message: 'Reassignment failed' });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  importLeads,
  updateLead,
  deleteLead,
  reassignLead
};
