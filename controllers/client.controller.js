import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, "");

  if (!digits.startsWith('+212')) {
    if (digits.startsWith('0')) {
      return `+212${digits.slice(1)}`;
    }
    return `+212${digits}`;
  }
  return digits;
};
export const createClient = async (req, res) => {
  const { name, phone,email, notes } = req.body;
  const userId = req.user.id;
  console.log(formatPhoneNumber(phone));
  

  try {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone:formatPhoneNumber(phone),
        notes,
        userId,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
      return res.status(400).json({ message: "Ce numéro de téléphone existe déjà." });
    }

    console.error("Erreur createClient:", error);
    res.status(500).json({ message: "Erreur lors de la création du client." });
  }
};

export const getClients = async (req, res) => {
  const userId = req.user.id;

  try {
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(clients);
  } catch (error) {
    console.error("Erreur getClients:", error);
    res.status(500).json({ message: "Erreur lors du chargement des clients." });
  }
};

export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, phone, notes } = req.body;

  try {
    const updated = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { name, phone, notes },
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
      return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
    }

    console.error("Erreur updateClient:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du client." });
  }
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.client.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Client supprimé avec succès." });
  } catch (error) {
    console.error("Erreur deleteClient:", error);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
