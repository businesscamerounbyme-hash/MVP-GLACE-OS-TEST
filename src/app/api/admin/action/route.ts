import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { estRoleValide } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé.' },
        { status: 403 }
      );
    }

    const { typeCible, cibleId, action, motif, roleNouveau, unitesAutorisees, image } = await request.json();

    if (!typeCible || !cibleId || !action) {
      return NextResponse.json(
        { success: false, message: 'Paramètres d’action incomplets.' },
        { status: 400 }
      );
    }

    // 1. Action sur une BOUTIQUE
    if (typeCible === 'BOUTIQUE') {
      if (action === 'APPROUVER') {
        await prisma.boutique.update({
          where: { id: cibleId },
          data: {
            statut: 'PUBLIEE',
            dateValidation: new Date()
          }
        });
      } else if (action === 'REJETER') {
        await prisma.boutique.update({
          where: { id: cibleId },
          data: { statut: 'REJETEE' }
        });
      } else if (action === 'SUSPENDRE') {
        await prisma.boutique.update({
          where: { id: cibleId },
          data: { statut: 'INACTIVE' }
        });
      }
    }

    // 2. Action sur une PROPOSITION DE PRODUIT
    else if (typeCible === 'PRODUIT_PROPOSE') {
      const prop = await prisma.propositionProduit.findUnique({
        where: { id: cibleId }
      });

      if (!prop) {
        return NextResponse.json({ success: false, message: 'Proposition introuvable' }, { status: 404 });
      }

      if (action === 'APPROUVER') {
        // Créer le produit dans le catalogue de référence
        const createdProd = await prisma.produitReference.create({
          data: {
            nom: prop.nom,
            categorie: prop.categorie,
            sousCategorie: prop.sousCategorie,
            unitesAutorisees: unitesAutorisees || 'kg, sac 25kg, boîte 1kg, litre, pièce',
            description: prop.description,
            image: image || 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80',
            creePar: user.id
          }
        });

        // Marquer la proposition comme validée
        await prisma.propositionProduit.update({
          where: { id: cibleId },
          data: { statut: 'VALIDE' }
        });
      } else if (action === 'REJETER') {
        await prisma.propositionProduit.update({
          where: { id: cibleId },
          data: {
            statut: 'REJETE',
            motifRejet: motif || 'Doublon ou non conforme aux standards de glacerie'
          }
        });
      }
    }

    // 3. Action sur un AVIS
    else if (typeCible === 'AVIS') {
      const avis = await prisma.avis.findUnique({
        where: { id: cibleId }
      });

      if (!avis) {
        return NextResponse.json({ success: false, message: 'Avis introuvable' }, { status: 404 });
      }

      if (action === 'APPROUVER') {
        await prisma.avis.update({
          where: { id: cibleId },
          data: { statut: 'PUBLIE' }
        });

        // Recalculer la note moyenne de la boutique
        const allAvis = await prisma.avis.findMany({
          where: { boutiqueId: avis.boutiqueId, statut: 'PUBLIE' }
        });

        const totalNotes = allAvis.reduce((acc, a) => acc + a.note, 0);
        const nouvelleMoyenne = allAvis.length > 0 ? Math.round((totalNotes / allAvis.length) * 10) / 10 : 0.0;

        await prisma.boutique.update({
          where: { id: avis.boutiqueId },
          data: { noteMoyenne: nouvelleMoyenne }
        });

      } else if (action === 'REJETER') {
        await prisma.avis.update({
          where: { id: cibleId },
          data: { statut: 'REJETE' }
        });
      }
    }

    // 4. Action sur DEMANDE DE BADGE CERTIFIÉ
    else if (typeCible === 'DEMANDE_BADGE') {
      const demande = await prisma.demandeBadge.findUnique({
        where: { id: cibleId }
      });

      if (!demande) {
        return NextResponse.json({ success: false, message: 'Demande introuvable' }, { status: 404 });
      }

      if (action === 'APPROUVER') {
        await prisma.demandeBadge.update({
          where: { id: cibleId },
          data: { statut: 'VALIDEE', dateValidation: new Date() }
        });

        await prisma.boutique.update({
          where: { id: demande.boutiqueId },
          data: { badgeCertifie: true }
        });
      } else if (action === 'REJETER') {
        await prisma.demandeBadge.update({
          where: { id: cibleId },
          data: { statut: 'REJETEE' }
        });
      }
    }

    // 5. Action sur RÔLE UTILISATEUR (Admin uniquement)
    else if (typeCible === 'UTILISATEUR') {
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'Seul le Super Admin peut modifier les rôles' }, { status: 403 });
      }

      // Sans liste blanche, n’importe quelle chaine devenait un role. Un role inconnu
      // ne correspond a aucune regle d’autorisation : le compte deviendrait inclassable.
      if (!estRoleValide(roleNouveau)) {
        return NextResponse.json(
          { success: false, message: 'Role invalide.' },
          { status: 400 }
        );
      }

      if (cibleId === user.id) {
        return NextResponse.json(
          { success: false, message: 'Vous ne pouvez pas modifier votre propre role.' },
          { status: 400 }
        );
      }

      await prisma.utilisateur.update({
        where: { id: cibleId },
        data: { role: roleNouveau }
      });
    }

    // Enregistrer dans le Journal d'audit de modération
    await prisma.journalModeration.create({
      data: {
        cibleId,
        typeCible,
        moderateurId: user.id,
        action,
        motif: motif || null
      }
    });

    return NextResponse.json({
      success: true,
      message: `Action [${action}] enregistrée avec succès dans le journal de modération.`
    });

  } catch (error: any) {
    console.error('Erreur action modération:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l’action de modération.' },
      { status: 500 }
    );
  }
}
