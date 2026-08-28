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
        { success: false, message: 'Aucune boutique associée.' },
        { status: 404 }
      );
    }

    const { nom, categorie, sousCategorie, description } = await request.json();

    if (!nom || !categorie || !sousCategorie) {
      return NextResponse.json(
        { success: false, message: 'Le nom, la catégorie et la sous-catégorie sont requis.' },
        { status: 400 }
      );
    }

    // Vérifier si un produit similaire existe déjà
    const doublon = await prisma.produitReference.findUnique({
      where: { nom: nom.trim() }
    });

    if (doublon) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ce produit existe déjà dans le catalogue de référence. Vous pouvez ajouter directement une offre pour celui-ci.',
          existingProductId: doublon.id
        },
        { status: 400 }
      );
    }

    const proposition = await prisma.propositionProduit.create({
      data: {
        boutiqueId: boutique.id,
        nom: nom.trim(),
        categorie,
        sousCategorie,
        description: description ? description.trim() : null,
        statut: 'EN_ATTENTE'
      }
    });

    return NextResponse.json({
      success: true,
      proposition,
      message: 'Proposition de produit envoyée avec succès aux modérateurs.'
    });

  } catch (error: any) {
    console.error('Erreur proposition produit:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la proposition du produit.' },
      { status: 500 }
    );
  }
}
