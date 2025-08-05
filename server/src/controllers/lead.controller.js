// ✅ server/src/controllers/lead.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const normalizePhone = (phone) => {
  return phone.replace(/^\+92|0092|92|0/, '').replace(/[^0-9]/g, '').slice(-10);
};

// 🔍 GET all leads
exports.getLeads = async (req, res) => {
  const { role, userId } = req.user;
  const { page = 1, limit = 10, search = '', status = '', projectId = '', agentId = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let where = {};
  if (role === 'AGENT') where.assignedToId = userId;
  else if (role === 'MANAGER') where.OR = [{ assignedTo: { managerId: userId } }, { assignedToId: userId }];
  else if (role === 'SR_MANAGER') where.OR = [{ assignedTo: { srManagerId: userId } }, { assignedToId: userId }];
  else if (role === 'DIRECTOR') where.OR = [{ assignedTo: { directorId: userId } }, { assignedToId: userId }];

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
exports.getLeadById = async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  try {
    const where = { id: parseInt(id) };
    if (role === 'AGENT') where.assignedToId = userId;
    else if (role === 'MANAGER') where.OR = [{ assignedTo: { managerId: userId } }, { assignedToId: userId }];
    else if (role === 'SR_MANAGER') where.OR = [{ assignedTo: { srManagerId: userId } }, { assignedToId: userId }];
    else if (role === 'DIRECTOR') where.OR = [{ assignedTo: { directorId: userId } }, { assignedToId: userId }];

    const lead = await prisma.lead.findFirst({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true } }
      }
    });

    if (!lead) return res.status(404).json({ message: 'Lead not found or unauthorized' });
    res.json(lead);
  } catch (error) {
    console.error('❌ Failed to fetch lead by ID:', error);
    res.status(500).json({ message: 'Error fetching lead' });
  }
};

// ➕ CREATE Lead
exports.createLead = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user?.userId;
    const phoneKey = normalizePhone(data.phone);

    if (!data.name || !data.phone || !data.country || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.lead.findFirst({
      where: { phone: { contains: phoneKey } },
      include: { assignedTo: { select: { name: true } } }
    });

    if (existing) {
      return res.status(200).json({
        exists: true,
        message: `Lead already exists with Agent ${existing.assignedTo?.name || 'Unknown'}`
      });
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
        projectId: data.projectId ? Number(data.projectId) : null,
        budget: isNaN(Number(data.budget)) ? 0 : Number(data.budget),
        planToPurchase: data.planToPurchase,
        leadSource: data.leadSource,
        notes: data.notes || '',
        status: data.status || 'NEW',
        assignedToId: data.assignedToId ? Number(data.assignedToId) : userId,
        createdById: userId
      }
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error("❌ Lead creation failed:", err);
    res.status(500).json({ message: 'Create failed' });
  }
};
