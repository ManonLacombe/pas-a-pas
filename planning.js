/**
 * Générateur de planning basé sur le carnet d'entraînement 25 000 pas
 * Adapté pour commencer le 12 octobre 2026
 */

const TRAINING_START = new Date(2026, 9, 12); // 12 octobre 2026

// Structure type d'une semaine du carnet
const WEEK_TYPES = {
    ENDURANCE: {
        name: "Endurance",
        minSteps: 7000,
        maxSteps: 9000,
        rangeLabel: "7–9k pas/j",
        objective: "45–60 min de marche. Test ponctuel 10–12k pas."
    },
    GROS_VOLUME: {
        name: "Gros volume",
        minSteps: 9000,
        maxSteps: 11000,
        rangeLabel: "9–11k pas/j",
        objective: "60–90 min de marche. Quelques journées 12–16k pas."
    },
    SPECIFIQUE: {
        name: "Spécifique voyage",
        minSteps: 11000,
        maxSteps: 13000,
        rangeLabel: "11–13k pas/j",
        objective: "Blocs 16–20k pas + lendemain plus léger. Objectif : jours consécutifs."
    },
    FINALE: {
        name: "Préparation finale",
        minSteps: 13000,
        maxSteps: 15000,
        rangeLabel: "13–15k pas/j",
        objective: "Simulation 18k → 20k → 15k."
    }
};

// Progression des semaines (inspirée du document)
const PROGRESSION = [
    // Phase 1 : Endurance (semaines 1-3)
    { type: "ENDURANCE", weeks: 3 },
    // Phase 2 : Gros volume (semaines 4-12)
    { type: "GROS_VOLUME", weeks: 9 },
    // Phase 3 : Spécifique voyage (semaines 13-22)
    { type: "SPECIFIQUE", weeks: 10 },
    // Phase 4 : Préparation finale (semaines 23-24)
    { type: "FINALE", weeks: 2 }
];

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/**
 * Génère le planning complet à partir du 12 octobre 2026
 */
function generatePlanning(startDate) {
    const weeks = [];
    let currentDate = new Date(startDate);
    let weekNum = 1;

    for (const phase of PROGRESSION) {
        const weekType = WEEK_TYPES[phase.type];

        for (let w = 0; w < phase.weeks; w++) {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const days = generateDays(weekStart, weekType);

            weeks.push({
                number: weekNum,
                phase: weekType.name,
                phaseType: phase.type,
                rangeLabel: weekType.rangeLabel,
                objective: weekType.objective,
                minSteps: weekType.minSteps,
                maxSteps: weekType.maxSteps,
                start: weekStart,
                end: weekEnd,
                days: days
            });

            currentDate.setDate(currentDate.getDate() + 7);
            weekNum++;
        }
    }

    return weeks;
}

/**
 * Génère les jours d'une semaine type
 */
function generateDays(weekStart, weekType) {
    const days = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);

        let task, targetSteps;

        switch (i) {
            case 0: // Lundi
                task = "Marche facile + mobilité 10 min";
                targetSteps = weekType.minSteps;
                break;
            case 1: // Mardi
                task = "Bureau : 30 min aller + 30 min retour ou marche 20-30 min";
                targetSteps = weekType.minSteps + 500;
                break;
            case 2: // Mercredi
                task = "Renforcement A + 10-20 min facile";
                targetSteps = weekType.minSteps;
                break;
            case 3: // Jeudi
                task = "Bureau : 30 min aller + 30 min retour ou marche 20-30 min";
                targetSteps = weekType.minSteps + 500;
                break;
            case 4: // Vendredi
                task = "Bureau : 30 min aller + 30 min retour ou marche 20-30 min";
                targetSteps = weekType.minSteps + 500;
                break;
            case 5: // Samedi
                if (weekType === WEEK_TYPES.FINALE) {
                    task = "Marche longue / simulation";
                    targetSteps = weekType.maxSteps + 2000;
                } else if (weekType === WEEK_TYPES.SPECIFIQUE) {
                    task = "Marche longue / simulation";
                    targetSteps = weekType.maxSteps + 3000;
                } else {
                    task = "Roller 1h30 ou marche longue";
                    targetSteps = weekType.maxSteps + 2000;
                }
                break;
            case 6: // Dimanche
                task = "Renforcement B léger ou marche longue selon fatigue";
                targetSteps = weekType.minSteps + 1000;
                break;
        }

        days.push({
            name: DAYS[i],
            fullName: DAYS_FULL[i],
            date: date,
            task: task,
            targetSteps: targetSteps
        });
    }

    return days;
}

/**
 * Trouve la semaine et le jour actuels
 */
function getCurrentWeek(planning, date = new Date()) {
    for (const week of planning) {
        if (date >= week.start && date <= week.end) {
            const dayIndex = date.getDay();
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Lundi = 0
            return {
                week: week,
                day: week.days[adjustedIndex],
                dayIndex: adjustedIndex
            };
        }
    }
    return null;
}

/**
 * Calcule le numéro de semaine ISO
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Formate une date en français
 */
function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Formate une plage de dates
 */
function formatDateRange(start, end) {
    const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${startStr} – ${endStr}`;
}

/**
 * Génère le planning global
 */
const PLANNING = generatePlanning(TRAINING_START);
