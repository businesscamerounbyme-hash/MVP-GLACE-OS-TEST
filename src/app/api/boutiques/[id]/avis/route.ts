import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: boutiqueId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Vous devez être connecté pour laisser un avis.' },
        { status: 401 }
      );
    }

    const { note, commentaire, photoUrl } = await request.json();

    if (!note || note < 1 || note > 5 || !commentaire || !commentaire.trim()) {
      return NextResponse.json(
        { success: false, message: 'Veuillez attribuer une note entre 1 et 5 et rédiger un commentaire.' },
        { status: 400 }
      );
    }

    const boutique = await prisma.boutique.findUnique({
      where: { id: boutiqueId }
    });

    if (!boutique) {
      return NextResponse.json(
        { success: false, message: 'Boutique introuvable.' },
        { status: 404 }
      );
    }

    // RÈGLE MÉTIER STRICTE : Tous les avis sont créés en 'EN_ATTENTE' de modération
    const nouvelAvis = await prisma.avis.create({
      data: {
        boutiqueId,
        utilisateurId: user.id,
        note: parseInt(note),
        commentaire: commentaire.trim(),
        photoUrl: photoUrl || null,
        statut: 'EN_ATTENTE'
      }
    });

    return NextResponse.json({
      success: true,
      avis: nouvelAvis,
      message: 'Votre avis a été soumis avec succès ! Il sera publié dès validation par un modérateur.'
    });

  } catch (error: any) {
    console.error('Erreur API Avis:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l’envoi de votre avis.' },
      { status: 500 }
    );
  }
}
