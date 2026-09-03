import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, authErrorResponse } from '@/lib/guard';

const MAX = 120;

function texte(valeur: unknown, max = MAX): string | null {
  if (typeof valeur !== 'string') return null;
  const v = valeur.trim();
  if (!v || v.length > max) return null;
  return v;
}

export async function GET() {
  try {
    const user = requireUser(await getCurrentUser(), ['SUPPLIER', 'ADMIN', 'MODERATOR']);

    const boutique = await prisma.boutique.findFirst({
      where: { utilisateurId: user.id },
      include: {
        offres: {
          include: {
            produitReference: true,
          },
          orderBy: { dateCreation: 'desc' },
        },
      },
    });

    if (!boutique) {
      return NextResponse.json(
        { success: false, message: 'Aucune boutique associée à ce compte.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, boutique });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;
    console.error('Erreur GET boutique fournisseur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement de la boutique.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = requireUser(await getCurrentUser(), ['SUPPLIER', 'ADMIN', 'MODERATOR']);

    const boutique = await prisma.boutique.findFirst({
      where: { utilisateurId: user.id },
    });

    if (!boutique) {
      return NextResponse.json(
        { success: false, message: 'Aucune boutique associée à ce compte.' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const nom = texte(body.nom, 100);
    if (!nom) {
      return NextResponse.json(
        { success: false, message: 'Le nom de la boutique est obligatoire.' },
        { status: 400 }
      );
    }

    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!description || description.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'La description est obligatoire (2000 caractères max).' },
        { status: 400 }
      );
    }

    const quartier = texte(body.quartier, 120);
    if (!quartier) {
      return NextResponse.json(
        { success: false, message: 'Le quartier ou l’adresse est obligatoire.' },
        { status: 400 }
      );
    }

    const telephone = texte(body.telephone, 30);
    if (!telephone || !/^[+0-9\s-]{8,30}$/.test(telephone)) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone commercial invalide.' },
        { status: 400 }
      );
    }

    const whatsapp = texte(body.whatsapp, 30);
    if (!whatsapp || !/^[+0-9\s-]{8,30}$/.test(whatsapp)) {
      return NextResponse.json(
        { success: false, message: 'Numéro WhatsApp commercial invalide.' },
        { status: 400 }
      );
    }

    const donneesMAJ: Record<string, any> = {
      nom,
      description,
      quartier,
      telephone,
      whatsapp,
    };

    if (body.ville && typeof body.ville === 'string') {
      const v = body.ville.trim();
      if (v) donneesMAJ.ville = v;
    }

    if (body.latitude !== undefined && body.longitude !== undefined) {
      const lat = Number(body.latitude);
      const lon = Number(body.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        donneesMAJ.latitude = lat;
        donneesMAJ.longitude = lon;
      }
    }

    const boutiqueMAJ = await prisma.boutique.update({
      where: { id: boutique.id },
      data: donneesMAJ,
    });

    return NextResponse.json({
      success: true,
      boutique: boutiqueMAJ,
      message: 'Informations de la boutique mises à jour avec succès !',
    });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;
    console.error('Erreur mise à jour boutique fournisseur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de la boutique.' },
      { status: 500 }
    );
  }
}
