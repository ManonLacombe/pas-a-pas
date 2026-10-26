/**
 * Programmes de renforcement — repris du carnet d'entraînement.
 *
 * Le carnet demande de rester facile à modéré : ~2 répétitions « en réserve »,
 * technique propre. On n'augmente que si toutes les séries sont propres et
 * sans douleur pendant 2 séances.
 */

/** Repères de progression par jour de programme, index 0 = début. */
const SEANCE_A = [
    { nom: 'Squats', debut: '2 × 8', cible: '3 × 10–12', consigne: 'Contrôle la descente, genoux dans l’axe' },
    { nom: 'Pont fessier', debut: '2 × 10', cible: '3 × 12–15', consigne: 'Pause 1 s en haut' },
    { nom: 'Élévations sur la pointe des pieds', debut: '2 × 12', cible: '3 × 15–20', consigne: 'Dos contre un mur si besoin, talons au sol' },
    { nom: 'Tibial — relever l’avant du pied', debut: '2 × 12', cible: '3 × 15–20', consigne: 'Dos au mur si besoin' },
    { nom: 'Gainage avant', debut: '2 × 20 s', cible: '3 × 30–45 s', consigne: 'Respirer normalement' },
    { nom: 'Équilibre sur une jambe', debut: '2 × 20 s / jambe', cible: '3 × 30–45 s', consigne: 'Garder le buste droit' }
];

const SEANCE_B = [
    { nom: 'Fente arrière assistée', debut: '2 × 6 / jambe', cible: '3 × 8–10 / jambe', consigne: 'Se tenir à un support' },
    { nom: 'Montées sur marche stable', debut: '2 × 8 / jambe', cible: '3 × 10–12 / jambe', consigne: 'Monter sans se propulser' },
    { nom: 'Good morning sans charge', debut: '2 × 10', cible: '3 × 10–15', consigne: 'Dos neutre, mouvement lent' },
    { nom: 'Élévations, une jambe', debut: '2 × 8 / jambe', cible: '3 × 10–22', consigne: 'Appui stable' },
    { nom: 'Gainage latéral', debut: '2 × 15 s / côté', cible: '3 × 25–40 s', consigne: 'Hanches dans l’axe' },
    { nom: 'Bird-dog', debut: '2 × 6 / côté', cible: '3 × 10 / côté', consigne: 'Bassin stable' }
];

const REFORTS = 'Repos : 45–60 secondes entre les séries.';

/**
 * Renforceurs : certains exercices sollicitent davantage les jambes.
 * Un renforcementemis le jour meme reduit legerement l'objectif de pas.
 */
const COUT_RENFORCEMENT = {
    A: 0.95, // cuisses, mollets, fessiers : on marche un peu moins le soir meme
    B: 0.97  // plus mixte, gainage unilateral
};

/**
 * Facteur lie a la seance de roller de la veille.
 * Roller = effort intense la veille -> on reduit aujourd'hui.
 */
const COUT_ROLLER = 0.9;

/**
 * Associe une seance a chaque jour de la semaine.
 * Mercredi = A, Dimanche = B (comme dans le carnet).
 */
const SEANCE_DU_JOUR = {
    Mer: 'A',
    Dim: 'B'
};

/**
 * Adjuste l'objectif du jour.
 *
 * @param {number} base objectif theorique du jour
 * @param {object} opts
 * @param {boolean} opts.renfoA fait-on le renforcement A aujourd'hui ?
 * @param {boolean} opts.renfoB fait-on le renforcement B aujourd'hui ?
 * @param {boolean} opts.rollerAujourdhui y a-t-il eu du roller aujourd'hui ?
 * @returns {{objectif:number, motifs:string[]}}
 */
function getObjectifAjuste(base, opts) {
    const { renfoA = false, renfoB = false, rollerAujourdhui = false } = opts || {};

    let facteur = 1;
    const motifs = [];

    if (rollerAujourdhui) {
        facteur *= COUT_ROLLER;
        motifs.push('roller aujourd’hui');
    }

    // Le renforcement du jour conduit a reduire legerement la marche.
    // On prend la contrainte la plus forte des deux seances.
    if (renfoA) {
        facteur *= COUT_RENFORCEMENT.A;
        motifs.push('renforcement A aujourd’hui');
    } else if (renfoB) {
        facteur *= COUT_RENFORCEMENT.B;
        motifs.push('renforcement B aujourd’hui');
    }

    return {
        objectif: Math.max(1000, Math.round(base * facteur / 100) * 100),
        motifs: motifs
    };
}

/**
 * Programme du jour, ou null si la journee ne prevoit pas de renforcement.
 */
function getSeanceDuJour(nomJour) {
    const seance = SEANCE_DU_JOUR[nomJour];
    if (!seance) return null;
    return {
        lettre: seance,
        titre: 'Séance ' + seance,
        duree: '20 à 30 min',
        exercices: seance === 'A' ? SEANCE_A : SEANCE_B,
        repos: REFORTS
    };
}
