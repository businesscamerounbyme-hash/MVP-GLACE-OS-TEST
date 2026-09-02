import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PAYS_TRIES, drapeau } from '@/lib/pays';

/**
 * Liste publique des pays africains, avec l'indication de ceux ouverts à la création
 * de boutique. Le drapeau est calculé ici plutôt que stocké : il se déduit du code ISO.
 */
export async function GET() {
  try {
    const marches = await prisma.marchePays.findMany({ select: { code: true, ouvert: true } });
    const ouverts = new Set(marches.filter((m) => m.ouvert).map((m) => m.code));

    return NextResponse.json({
      success: true,
      pays: PAYS_TRIES.map((p) => ({
        code: p.code,
        nom: p.nom,
        indicatif: p.indicatif,
        drapeau: drapeau(p.code),
        ouvertAuxBoutiques: ouverts.has(p.code),
      })),
    });
  } catch (error) {
    console.error('Erreur liste des pays:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des pays.' },
      { status: 500 }
    );
  }
}
