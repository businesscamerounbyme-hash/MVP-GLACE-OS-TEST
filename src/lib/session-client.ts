'use client';

import { useEffect } from 'react';

/**
 * Renvoie un utilisateur déjà connecté hors des pages d'authentification.
 *
 * Le contrôle se fait ici et non dans le middleware, volontairement. Le middleware
 * tourne sur le runtime Edge : il ne vérifie que la signature du jeton, sans accès à
 * la base. Or une session peut être cryptographiquement valide et pourtant révoquée —
 * c'est exactement ce que produit une réinitialisation de mot de passe.
 *
 * Dans ce cas, un middleware renverrait l'utilisateur de /login vers /espace, où
 * /api/auth/me répondrait « non connecté » et le renverrait vers /login : une boucle
 * infinie qui rendrait la connexion impossible. En interrogeant /api/auth/me, qui fait
 * autorité, les deux côtés s'accordent toujours.
 */
export function useRedirectionSiConnecte(destination = '/espace') {
  // Le formulaire est rendu immediatement et la redirection intervient apres coup.
  // Bloquer l affichage le temps de la verification imposerait un aller-retour a tous
  // les visiteurs anonymes — la quasi-totalite — pour le confort du cas rare.
  useEffect(() => {
    let annule = false;

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (annule) return;
        if (d.user) window.location.assign(destination);
      })
      // Un échec de vérification laisse simplement le formulaire en place : mieux vaut
      // afficher une connexion superflue que bloquer quelqu'un qui doit se connecter.
      .catch(() => undefined);

    return () => {
      annule = true;
    };
  }, [destination]);

}
