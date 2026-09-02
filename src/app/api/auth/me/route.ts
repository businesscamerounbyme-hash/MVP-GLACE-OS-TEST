import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    // `success` est ajouté pour s'aligner sur le reste de l'API : son absence ici a
    // déjà provoqué une boucle de redirection dans une page qui le testait.
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
