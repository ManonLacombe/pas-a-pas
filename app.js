/**
 * Application de comptage de pas — Carnet d'entraînement 25 000 pas
 */

const STORAGE_KEY = 'pasapas_data';

// État de l'application
let state = {
    steps: {},        // { "2026-10-12": 5000 }
    bilans: {},       // { "2026-W42": { fatigue: 5, douleur: 0, note: "..." } }
    settings: {
        defaultGoal: 8000,
        unit: 'steps',
        strideLength: 70  // cm
    }
};

// Éléments DOM
const screens = document.querySelectorAll('.screen');
const navBtns = document.querySelectorAll('.nav-btn');

/**
 * Initialisation
 */
function init() {
    loadData();
    setupNavigation();
    setupModals();
    setupSettings();
    renderToday();
    // Si l'app tourne dans le natif Android, active la synchro du capteur.
    demarrerSyncAuto();
    window.syncPasEtAfficher();
}

/**
 * Chargement des données locales
 */
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            state = { ...state, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Erreur de chargement:', e);
        }
    }
}

/**
 * Sauvegarde des données
 */
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Navigation entre écrans
 */
function setupNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const screenId = btn.dataset.screen;
            showScreen(screenId);

            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function showScreen(screenId) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');

    if (screenId === 'today') renderToday();
    if (screenId === 'planning') renderPlanning();
    if (screenId === 'history') renderHistory();
}

/**
 * Aujourd'hui
 */
function renderToday() {
    const today = new Date();
    const dateStr = formatDateKey(today);

    // Date
    document.getElementById('current-date').textContent = formatDate(today);

    // Semaine
    const current = getCurrentWeek(PLANNING, today);
    if (current) {
        document.getElementById('week-badge').textContent =
            `Semaine ${current.week.number} — ${current.week.phase}`;
    } else {
        document.getElementById('week-badge').textContent = 'Hors planning';
    }

    // Pas du jour
    const todaySteps = state.steps[dateStr] || 0;
    const goal = current ? current.day.targetSteps : state.settings.defaultGoal;

    document.getElementById('steps-count').textContent = todaySteps.toLocaleString('fr-FR');
    document.getElementById('steps-goal').textContent = `/ ${goal.toLocaleString('fr-FR')} pas`;

    // Progression circulaire
    const ring = document.getElementById('progress-ring');
    const circumference = 2 * Math.PI * 90; // r=90
    const progress = Math.min(todaySteps / goal, 1);
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - progress);

    // Plan du jour
    if (current) {
        const planHtml = `
            <div class="plan-card">
                <div class="plan-title">
                    <span>${getDayEmoji(current.day.name)}</span>
                    ${current.day.fullName}
                </div>
                <div class="plan-details">${current.day.task}</div>
                <div class="plan-target">🎯 Objectif : ~${current.day.targetSteps.toLocaleString('fr-FR')} pas</div>
            </div>
        `;
        document.getElementById('daily-plan').innerHTML = planHtml;
    } else {
        document.getElementById('daily-plan').innerHTML = `
            <div class="plan-card">
                <div class="plan-details">Journée hors planning. Repos ou activité libre.</div>
            </div>
        `;
    }

    // Statistiques
    renderStats();
}

/**
 * Point d'entree appele par l'application Android native.
 * Le telephone mesure les pas en arriere-plan et pousse la valeur ici.
 */
window.updateSteps = function (steps) {
    const dateStr = formatDateKey(new Date());
    const current = state.steps[dateStr] || 0;

    // On ne remplace que si le capteur natif a mesure davantage.
    if (steps > current) {
        state.steps[dateStr] = steps;
        saveData();
        renderToday();
        showSensorBadge();
    }
};

/**
 * Indique visuellement que le comptage est automatique.
 */
function showSensorBadge(texte) {
    let badge = document.getElementById('sensor-badge');
    if (!badge) {
        const card = document.querySelector('.steps-card');
        if (!card) return;
        badge = document.createElement('div');
        badge.id = 'sensor-badge';
        card.appendChild(badge);
    }
    badge.textContent = texte || '📡 Comptage automatique actif';
    badge.style.cssText = 'margin-top:12px;text-align:center;font-size:13px;font-weight:600;color:#4ade80;';
}

window.syncPasEtAfficher = function () {
    if (window.Android && typeof window.Android.getStepsToday === 'function') {
        try {
            const steps = window.Android.getStepsToday();
            if (steps > 0) { window.updateSteps(steps); } else { showSensorBadge(); }
        } catch (e) { console.error(e); }
    }
};

let syncInterval = null;
function demarrerSyncAuto() {
    if (syncInterval || !window.Android) return;
    syncInterval = setInterval(window.syncPasEtAfficher, 20000);
}

function showCapteurAbsent() {
    showSensorBadge('Aucun capteur de pas detecte sur ce telephone');
    const b = document.getElementById('sensor-badge');
    if (b) b.style.color = '#fb923c';
}

function getDayEmoji(dayName) {
    const emojis = {
        'Lun': '🌅', 'Mar': '🚶', 'Mer': '💪', 'Jeu': '🏢',
        'Ven': '🎉', 'Sam': '🏔️', 'Dim': '🌿'
    };
    return emojis[dayName] || '📅';
}

/**
 * Statistiques
 */
function renderStats() {
    // Moyenne semaine courante
    const current = getCurrentWeek(PLANNING, new Date());
    let weekAvg = '—';

    if (current) {
        let total = 0;
        let count = 0;
        for (let i = 0; i <= current.dayIndex; i++) {
            const d = current.week.days[i].date;
            const key = formatDateKey(d);
            if (state.steps[key]) {
                total += state.steps[key];
                count++;
            }
        }
        if (count > 0) {
            weekAvg = Math.round(total / count).toLocaleString('fr-FR');
        }
    }
    document.getElementById('stat-week-avg').textContent = weekAvg;

    // Total global
    const totalSteps = Object.values(state.steps).reduce((a, b) => a + b, 0);
    document.getElementById('stat-total').textContent = totalSteps > 0
        ? (totalSteps / 1000).toFixed(1) + 'k'
        : '—';

    // Série (jours consécutifs avec objectif atteint)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = formatDateKey(d);
        const steps = state.steps[key] || 0;
        const currentW = getCurrentWeek(PLANNING, d);
        const goal = currentW ? currentW.day.targetSteps : state.settings.defaultGoal;

        if (steps >= goal) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    document.getElementById('stat-streak').textContent = streak > 0 ? streak : '—';
}

/**
 * Planning
 */
function renderPlanning() {
    const container = document.getElementById('planning-list');
    const today = new Date();
    const todayKey = formatDateKey(today);

    container.innerHTML = PLANNING.map(week => {
        const daysHtml = week.days.map(day => {
            const isToday = formatDateKey(day.date) === todayKey;
            const key = formatDateKey(day.date);
            const steps = state.steps[key];
            const stepsLabel = steps ? `${steps.toLocaleString('fr-FR')} pas` : '';

            return `
                <div class="schedule-day ${isToday ? 'today' : ''}">
                    <span class="day-name">${day.name}</span>
                    <span class="day-task">${day.task}</span>
                    <span class="day-steps">${stepsLabel}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="week-card">
                <div class="week-header">
                    <span class="week-title">Semaine ${week.number}</span>
                    <span class="week-phase">${week.phase}</span>
                </div>
                <div class="week-range">${formatDateRange(week.start, week.end)} · ${week.rangeLabel}</div>
                <div class="week-schedule">${daysHtml}</div>
                <div class="week-objective">${week.objective}</div>
            </div>
        `;
    }).join('');
}

/**
 * Historique et bilans
 */
function renderHistory() {
    const container = document.getElementById('history-list');

    // Trier les semaines par date
    const weeksWithData = PLANNING.filter(week => {
        return week.days.some(day => state.steps[formatDateKey(day.date)]);
    });

    if (weeksWithData.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Aucune donnée enregistrée</p>';
        return;
    }

    container.innerHTML = weeksWithData.map(week => {
        const stepsData = week.days.map(day => ({
            day: day,
            steps: state.steps[formatDateKey(day.date)] || 0
        }));

        const total = stepsData.reduce((sum, d) => sum + d.steps, 0);
        const avg = Math.round(total / 7);
        const max = Math.max(...stepsData.map(d => d.steps));

        // Bilan de la semaine
        const weekNum = getISOWeek(week.start);
        const bilanKey = `${week.start.getFullYear()}-W${weekNum}`;
        const bilan = state.bilans[bilanKey];

        let bilanHtml = '';
        if (bilan) {
            bilanHtml = `
                <div class="history-bilan">
                    <div class="bilan-meters">
                        <div class="bilan-meter">😓 Fatigue: <strong>${bilan.fatigue}/10</strong></div>
                        <div class="bilan-meter">🩹 Douleur: <strong>${bilan.douleur}/10</strong></div>
                    </div>
                    ${bilan.note ? `<div class="bilan-note">"${bilan.note}"</div>` : ''}
                </div>
            `;
        } else {
            bilanHtml = `<button class="btn-bilan" onclick="openBilan(${week.number})">+ Ajouter un bilan</button>`;
        }

        return `
            <div class="history-card">
                <div class="history-week">Semaine ${week.number} — ${week.phase}</div>
                <div class="history-stats">
                    <div class="history-stat"><span>Total :</span> ${total.toLocaleString('fr-FR')}</div>
                    <div class="history-stat"><span>Moy. :</span> ${avg.toLocaleString('fr-FR')}</div>
                    <div class="history-stat"><span>Max :</span> ${max.toLocaleString('fr-FR')}</div>
                </div>
                ${bilanHtml}
            </div>
        `;
    }).join('');
}

/**
 * Modals
 */
function setupModals() {
    // Ajout de pas
    document.getElementById('btn-add-steps').addEventListener('click', () => {
        document.getElementById('modal-add').classList.add('active');
        document.getElementById('input-steps').value = '';
        document.getElementById('input-steps').focus();
    });

    document.getElementById('btn-cancel-add').addEventListener('click', () => {
        document.getElementById('modal-add').classList.remove('active');
    });

    document.getElementById('btn-confirm-add').addEventListener('click', () => {
        const input = document.getElementById('input-steps');
        const value = parseInt(input.value, 10);

        if (value > 0 && value <= 50000) {
            const today = new Date();
            const key = formatDateKey(today);
            state.steps[key] = (state.steps[key] || 0) + value;
            saveData();
            document.getElementById('modal-add').classList.remove('active');
            renderToday();
        } else {
            alert('Veuillez entrer un nombre de pas valide (1 à 50 000)');
        }
    });

    // Bilan
    document.getElementById('btn-cancel-bilan').addEventListener('click', () => {
        document.getElementById('modal-bilan').classList.remove('active');
    });

    document.getElementById('btn-save-bilan').addEventListener('click', () => {
        saveBilan();
    });

    // Sliders bilan
    document.getElementById('bilan-fatigue').addEventListener('input', (e) => {
        document.getElementById('bilan-fatigue-val').textContent = e.target.value;
    });

    document.getElementById('bilan-douleur').addEventListener('input', (e) => {
        document.getElementById('bilan-douleur-val').textContent = e.target.value;
    });

    // Fermer modals en cliquant en dehors
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

let currentBilanWeek = null;

function openBilan(weekNumber) {
    currentBilanWeek = weekNumber;
    const week = PLANNING.find(w => w.number === weekNumber);

    document.getElementById('bilan-title').textContent =
        `Bilan — Semaine ${weekNumber} (${week.phase})`;

    // Afficher les stats de la semaine
    const stepsData = week.days.map(day => ({
        day: day,
        steps: state.steps[formatDateKey(day.date)] || 0
    }));
    const total = stepsData.reduce((sum, d) => sum + d.steps, 0);
    const avg = Math.round(total / 7);

    document.getElementById('bilan-stats').innerHTML = `
        <div class="history-stats">
            <div class="history-stat"><span>Total :</span> ${total.toLocaleString('fr-FR')}</div>
            <div class="history-stat"><span>Moy. :</span> ${avg.toLocaleString('fr-FR')}</div>
        </div>
    `;

    document.getElementById('modal-bilan').classList.add('active');
}

function saveBilan() {
    if (!currentBilanWeek) return;

    const week = PLANNING.find(w => w.number === currentBilanWeek);
    const weekNum = getISOWeek(week.start);
    const bilanKey = `${week.start.getFullYear()}-W${weekNum}`;

    state.bilans[bilanKey] = {
        fatigue: parseInt(document.getElementById('bilan-fatigue').value, 10),
        douleur: parseInt(document.getElementById('bilan-douleur').value, 10),
        note: document.getElementById('bilan-note').value.trim()
    };

    saveData();
    document.getElementById('modal-bilan').classList.remove('active');
    renderHistory();
}

/**
 * Paramètres
 */
function setupSettings() {
    const goalInput = document.getElementById('setting-goal');
    const unitSelect = document.getElementById('setting-unit');
    const strideInput = document.getElementById('setting-stride');

    goalInput.value = state.settings.defaultGoal;
    unitSelect.value = state.settings.unit;
    strideInput.value = state.settings.strideLength;

    goalInput.addEventListener('change', () => {
        state.settings.defaultGoal = parseInt(goalInput.value, 10) || 8000;
        saveData();
        renderToday();
    });

    unitSelect.addEventListener('change', () => {
        state.settings.unit = unitSelect.value;
        saveData();
    });

    strideInput.addEventListener('change', () => {
        state.settings.strideLength = parseInt(strideInput.value, 10) || 70;
        saveData();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
            state = {
                steps: {},
                bilans: {},
                settings: {
                    defaultGoal: 8000,
                    unit: 'steps',
                    strideLength: 70
                }
            };
            saveData();
            renderToday();
        }
    });

    // Bouton synchroniser
    document.getElementById('btn-sync').addEventListener('click', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                alert('Application synchronisée !');
            });
        } else {
            alert('Synchronisation manuelle effectuée.');
        }
    });
}

/**
 * Utilitaires
 */
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);
