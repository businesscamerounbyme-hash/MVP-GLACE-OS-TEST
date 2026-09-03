import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, message: 'Accès réservé aux fournisseurs.' },
        { status: 403 }
      );
    }

    const boutique = await prisma.boutique.findFirst({
      where: { utilisateurId: user.id }
    });

    if (!boutique) {
      return NextResponse.json(
        { success: false, message: 'Aucune boutique associée à votre compte.' },
        { status: 404 }
      );
    }

    const { produitReferenceId, prix, devise, unite, quantiteDisponible, description, photoUrl } = await request.json();

    if (!produitReferenceId || !prix || !unite) {
      return NextResponse.json(
        { success: false, message: 'Le produit de référence, le prix et l’unité sont obligatoires.' },
        { status: 400 }
      );
    }

    // Vérification que le produit de référence existe bien dans le catalogue
    const refProduit = await prisma.produitReference.findUnique({
      where: { id: produitReferenceId }
    });

    if (!refProduit) {
      return NextResponse.json(
        { success: false, message: 'Produit de référence introuvable dans le catalogue officiel.' },
        { status: 404 }
      );
    }

    const nouvelleOffre = await prisma.offre.create({
      data: {
        boutiqueId: boutique.id,
        produitReferenceId,
        prix: parseFloat(prix),
        devise: devise || 'XOF',
        unite: unite.trim(),
        quantiteDisponible: quantiteDisponible ? parseFloat(quantiteDisponible) : 1,
        description: description ? description.trim() : null,
        photoUrl: photoUrl || null
      },
      include: {
        produitReference: true
      }
    });

    return NextResponse.json({
      success: true,
      offre: nouvelleOffre,
      message: 'Offre ajoutée avec succès au comparateur de prix !'
    });

  } catch (error: any) {
    console.error('Erreur ajout offre fournisseur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l’offre.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const offreId = searchParams.get('id');

    if (!offreId) {
      return NextResponse.json({ success: false, message: 'ID offre manquant' }, { status: 400 });
    }

    const boutique = await prisma.boutique.findFirst({
      where: { utilisateurId: user.id }
    });

    if (!boutique) {
      return NextResponse.json({ success: false, message: 'Boutique introuvable' }, { status: 404 });
    }

    await prisma.offre.deleteMany({
      where: {
        id: offreId,
        boutiqueId: boutique.id
      }
    });

    return NextResponse.json({ success: true, message: 'Offre supprimée.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Erreur suppression' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json({ success: false, message: 'Accès réservé aux fournisseurs.' }, { status: 403 });
    }

    const boutique = await prisma.boutique.findFirst({
      where: { utilisateurId: user.id }
    });

    if (!boutique) {
      return NextResponse.json({ success: false, message: 'Boutique introuvable.' }, { status: 404 });
    }

    const body = await request.json();
    const { id, produitReferenceId, prix, unite, quantiteDisponible, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Identifiant de l’offre manquant.' }, { status: 400 });
    }

    const offreExistante = await prisma.offre.findFirst({
      where: {
        id,
        boutiqueId: boutique.id,
      },
    });

    if (!offreExistante) {
      return NextResponse.json(
        { success: false, message: 'Cette offre n’existe pas ou ne vous appartient pas.' },
        { status: 404 }
      );
    }

    const donneesMAJ: Record<string, any> = {};

    if (produitReferenceId) {
      const refProduit = await prisma.produitReference.findUnique({
        where: { id: produitReferenceId },
      });
      if (!refProduit) {
        return NextResponse.json(
          { success: false, message: 'Produit de référence introuvable dans le catalogue officiel.' },
          { status: 404 }
        );
      }
      donneesMAJ.produitReferenceId = produitReferenceId;
    }

    if (prix !== undefined) {
      const p = parseFloat(prix);
      if (isNaN(p) || p <= 0) {
        return NextResponse.json({ success: false, message: 'Le prix doit être un nombre positif.' }, { status: 400 });
      }
      donneesMAJ.prix = p;
    }

    if (unite !== undefined) {
      const u = String(unite).trim();
      if (!u) {
        return NextResponse.json({ success: false, message: 'L’unité est obligatoire.' }, { status: 400 });
      }
      donneesMAJ.unite = u;
    }

    if (quantiteDisponible !== undefined) {
      const q = parseFloat(quantiteDisponible);
      donneesMAJ.quantiteDisponible = isNaN(q) || q < 0 ? 0 : q;
    }

    if (description !== undefined) {
      donneesMAJ.description = description ? String(description).trim() : null;
    }

    const offreMAJ = await prisma.offre.update({
      where: { id },
      data: donneesMAJ,
      include: {
        produitReference: true,
      },
    });

    return NextResponse.json({
      success: true,
      offre: offreMAJ,
      message: 'Offre mise à jour avec succès !',
    });
  } catch (error: any) {
    console.error('Erreur mise à jour offre:', error);
    return NextResponse.json({ success: false, message: 'Erreur lors de la mise à jour de l’offre.' }, { status: 500 });
  }
}

