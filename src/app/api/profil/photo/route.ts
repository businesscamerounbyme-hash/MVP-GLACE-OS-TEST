import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, authErrorResponse } from '@/lib/guard';

const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
const TAILLE_MAX = 2 * 1024 * 1024; // 2 Mo

/**
 * Téléversement de la photo de profil.
 *
 * Le fichier transite par le serveur plutôt que d'être envoyé directement au stockage :
 * pour un avatar de quelques dizaines de kilo-octets c'est sans conséquence, et cela
 * permet de contrôler le type et la taille avant que quoi que ce soit ne soit écrit.
 *
 * Le type déclaré par le navigateur n'est pas cru sur parole : les octets d'en-tête
 * sont vérifiés, sinon n'importe quel fichier pourrait être publié en se présentant
 * comme une image.
 */
export async function POST(request: Request) {
  try {
    const user = requireUser(await getCurrentUser());

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Stockage d’images non configuré. Créez un store Blob dans Vercel (Storage → Create → Blob), puis renseignez BLOB_READ_WRITE_TOKEN.',
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const fichier = formData.get('photo');

    if (!(fichier instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Aucun fichier reçu.' },
        { status: 400 }
      );
    }

    if (!TYPES_AUTORISES.includes(fichier.type)) {
      return NextResponse.json(
        { success: false, message: 'Format accepté : JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    if (fichier.size > TAILLE_MAX) {
      return NextResponse.json(
        { success: false, message: 'Image trop lourde (2 Mo maximum).' },
        { status: 400 }
      );
    }

    const octets = Buffer.from(await fichier.arrayBuffer());
    if (!estImage(octets)) {
      return NextResponse.json(
        { success: false, message: 'Ce fichier n’est pas une image valide.' },
        { status: 400 }
      );
    }

    const extension =
      fichier.type === 'image/png' ? 'png' : fichier.type === 'image/webp' ? 'webp' : 'jpg';

    const blob = await put(`avatars/${user.id}-${Date.now()}.${extension}`, octets, {
      access: 'public',
      contentType: fichier.type,
    });

    const precedent = await prisma.utilisateur.findUnique({
      where: { id: user.id },
      select: { photoUrl: true },
    });

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { photoUrl: blob.url },
    });

    // Purge de l'ancienne image, sans faire échouer la requête si elle a déjà disparu.
    if (precedent?.photoUrl?.includes('.public.blob.vercel-storage.com')) {
      // Une suppression qui echoue ne doit pas faire echouer la requete — la nouvelle
      // photo est deja en place — mais elle est tracee, sinon des fichiers orphelins
      // s accumulent dans le stockage sans que rien ne le signale.
      await del(precedent.photoUrl).catch((e) =>
        console.error("Blob orphelin, suppression echouee:", precedent.photoUrl, e)
      );
    }

    return NextResponse.json({ success: true, photoUrl: blob.url });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur téléversement photo:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l’envoi de l’image.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = requireUser(await getCurrentUser());

    const actuel = await prisma.utilisateur.findUnique({
      where: { id: user.id },
      select: { photoUrl: true },
    });

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { photoUrl: null },
    });

    if (actuel?.photoUrl?.includes('.public.blob.vercel-storage.com')) {
      await del(actuel.photoUrl).catch((e) =>
        console.error("Blob orphelin, suppression echouee:", actuel.photoUrl, e)
      );
    }

    return NextResponse.json({ success: true, message: 'Photo supprimée.' });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur suppression photo:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression.' },
      { status: 500 }
    );
  }
}

/** Contrôle des octets de signature : JPEG, PNG ou WebP (RIFF....WEBP). */
function estImage(b: Buffer): boolean {
  if (b.length < 12) return false;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true; // JPEG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true; // PNG
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return true;
  return false;
}
