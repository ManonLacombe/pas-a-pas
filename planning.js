/**
 * Générateur de planning — Carnet d'entraînement 25 000 pas
 *
 * Paliers repris du carnet d'origine (carnet_entrainement_25000_pas).
 * Progression sur 7 paliers, du 12 octobre 2026 jusqu'au voyage (déc. 2027).
 */

const TRAINING_START = new Date(2026, 9, 12); // 12 octobre 2026

/**
 * Les 7 paliers du carnet, avec leur repère quotidien (min/max en pas).
 *
 * Le point de départ réel est d'environ 2 600 pas/jour (18 000/semaine,
 * avant les trajets domicile-travail). Le premier palier démarre donc
 * à 3 000 pas, pas à 7 000.
 */
const PHASES = [
    {
        name: 'Mise en route',
        min: 3000,
        max: 4000,
        weeks: 3,
        objective: "Marquer le rythme. 2–3 jours de trajet vers le bureau + roller 1h30 le samedi.",
        detail: "Dimanche : 30–45 min de marche facile si envie. Course 15–25 min facultative."
    },
    {
        name: 'Base',
        min: 4000,
        max: 5000,
        weeks: 9,
        objective: "Consolider l'habitude. 2–3 jours de bureau à pied, roller le samedi.",
        detail: "Petite marche + course facultative."
    },
    {
        name: 'Montée',
        min: 5000,
        max: 7000,
        weeks: 13,
        objective: "Allonger les sorties. Marche 30–45 min certains dimanches.",
        detail: "Le volume augmente sans jamais dépasser le repère du jour."
    },
    {
        name: 'Endurance',
        min: 7000,
        max: 9000,
        weeks: 13,
        objective: "45–60 min de marche. Test ponctuel 10–12k pas.",
        detail: "Marche 45–60 min ; test 12k quand la récupération est bonne."
    },
    {
        name: 'Gros volume',
        min: 9000,
        max: 11000,
        weeks: 13,
        objective: "60–90 min de marche. Quelques journées à 12–16k pas.",
        detail: "Longues marches ; tests 12–16k pas."
    },
    {
        name: 'Spécifique voyage',
        min: 11000,
        max: 13000,
        weeks: 9,
        objective: "Blocs de 16–20k pas puis lendemain plus léger. Objectif : jours consécutifs.",
        detail: "Tests 16–20k et premiers enchaînements."
    },
    {
        name: 'Préparation finale',
        min: 13000,
        max: 15000,
        weeks: 3,
        objective: "Simulation 18k → 20k → 15k, puis 20k → 22k → 18k.",
        detail: "Simulations 18–22k sur plusieurs jours. Test 20–25k : on vise la répétition, pas le record."
    }
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/**
 * Construit le planning complet à partir du 12 octobre 2026.
 */
function generatePlanning(startDate) {
    const weeks = [];
    let current = new Date(startDate);
    let weekNum = 1;

    for (const phase of PHASES) {
        for (let w = 0; w < phase.weeks; w++) {
            const start = new Date(current);
            const end = new Date(current);
            end.setDate(end.getDate() + 6);

            weeks.push({
                number: weekNum,
                phase: phase.name,
                minSteps: phase.min,
                maxSteps: phase.max,
                rangeLabel: `${formatK(phase.min)}–${formatK(phase.max)} pas/j`,
                objective: phase.objective,
                detail: phase.detail,
                start: start,
                end: end,
                days: generateDays(start, phase)
            });

            current.setDate(current.getDate() + 7);
            weekNum++;
        }
    }

    return weeks;
}

/**
 * Semaine type du carnet. Les jours de bureau sont les jours privilégiés
 * pour marcher ; les autres servent au renforcement ou au repos.
 *
 * @param {number} weekNumber numéro de semaine (1 = première)
 */
function generateDays(weekStart, phase) {
    const days = [];
    const min = phase.min;
    const max = phase.max;
    const span = max - min;

    // Progression douce à l'intérieur de la semaine : on commence au bas
    // du repère et on finit plus haut, pour ne pas Sauter d'un coup.
    const step = Math.round(span / 6);

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);

        // Objectif du jour : palier croissant selon le jour de la semaine.
        let target = min + step * i;

        let task;
        switch (i) {
            case 0: // Lundi
                task = 'Marche facile + mobilité 10 min';
                break;
            case 1: // Mardi
                task = 'Bureau si présent : 30 min aller + 30 min retour. Sinon marche facile 20–30 min';
                break;
            case 2: // Mercredi
                task = 'Renforcement A (20–30 min) + 10–20 min de marche facile si possible';
                break;
            case 3: // Jeudi
                task = 'Bureau si présent : 30 min aller + 30 min retour. Sinon marche facile 20–30 min';
                break;
            case 4: // Vendredi
                task = 'Bureau si présent : 30 min aller + 30 min retour. Sinon marche facile 20–30 min';
                break;
            case 5: // Samedi
                task = 'Roller 1h30';
                target = max; // le samedi est le point haut de la semaine
                break;
            case 6: // Dimanche
                task = 'Renforcement B léger, ou marche longue selon fatigue';
                target = Math.round((min + max) / 2); // dimanche plus doux
                break;
        }

        days.push({
            name: DAYS[i],
            fullName: DAYS_FULL[i],
            date: date,
            task: task,
            targetSteps: Math.round(target / 100) * 100 // arrondi au centieme de k
        });
    }

    return days;
}

/**
 * Phase immédiatement supérieure : sert à la simulation (18k → 20k → 15k).
 */
function getPhase(index) {
    return PHASES[Math.min(index + 1, PHASES.length - 1)];
}

/**
 * Adapte l'objectif du jour selon la fatigue et la douleur d'hier.
 *
 * Regle du carnet : « Une douleur articulaire, une douleur qui augmente,
 * une fatigue anormale = reduction du volume et recuperation. »
 *
 * @param {{fatigue:number, douleur:number}|undefined} veille bilan d'hier
 * @returns {{facteur:number, message:string|null}}
 */
function getAdaptation(veille) {
    if (!veille) return { facteur: 1, message: null };

    const { fatigue = 0, douleur = 0 } = veille;
    let facteur = 1;
    const raisons = [];

    // La douleur est le signal le plus fort : elle plafonne vite.
    if (douleur >= 7) {
        facteur = 0.5;
        raisons.push('douleur importante');
    } else if (douleur >= 4) {
        facteur = Math.min(facteur, 0.75);
        raisons.push('douleur modérée');
    }

    if (fatigue >= 8) {
        facteur = Math.min(facteur, 0.6);
        raisons.push('fatigue élevée');
    } else if (fatigue >= 5) {
        facteur = Math.min(facteur, 0.85);
        raisons.push('fatigue à surveiller');
    }

    if (facteur === 1) {
        return {
            facteur: 1,
            message: 'Objectif normal : tu récupères bien, on continue sur la progression prévue.'
        };
    }

    const reduction = Math.round((1 - facteur) * 100);
    return {
        facteur: facteur,
        message: `Journée allégée : objectif réduit de ${reduction} % (${raisons.join(' + ')} d'hier).`
    };
}

/**
 * Calories brûlées pour un nombre de pas.
 *
 * Marche ≈ 0,78 kcal par kg et par kilomètre.
 * distance_km = pas x longueur_de_pas (cm) / 100 000
 */
function getCalories(steps, poidsKg = 65, longueurPasCm = 70) {
    const distanceKm = (steps * longueurPasCm) / 100000;
    return Math.round(distanceKm * poidsKg * 0.78);
}

/**
 * Distance parcourue en kilometres.
 */
function getDistanceKm(steps, longueurPasCm = 70) {
    return (steps * longueurPasCm) / 100000;
}

function formatK(n) {
    return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace('.', ',') + 'k';
}

/**
 * Trouve la semaine et le jour courants dans le planning.
 */
function getCurrentWeek(planning, date = new Date()) {
    // Comparaison sur la date du jour : week.end vaut minuit, donc une
    // comparaison d'instant mettrait le dimanche soir hors planning.
    const jour = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    for (const week of planning) {
        const debut = new Date(week.start.getFullYear(), week.start.getMonth(), week.start.getDate());
        const fin = new Date(week.end.getFullYear(), week.end.getMonth(), week.end.getDate());

        if (jour >= debut && jour <= fin) {
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
            return { week: week, day: week.days[dayIndex], dayIndex: dayIndex };
        }
    }
    return null;
}

/**
 * Numéro de semaine ISO.
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

function formatDateRange(start, end) {
    const s = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const e = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${s} – ${e}`;
}

/** Planning global */
const PLANNING = generatePlanning(TRAINING_START);
