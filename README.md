# 🚶 Pas à Pas — Carnet d'entraînement 25 000 pas

Application web de comptage de pas créée à partir d'un carnet d'entraînement.
Planning de 24 semaines démarrant le **12 octobre 2026**.

## 📱 Utilisation

Ouvrir `index.html` dans un navigateur (mobile ou desktop).
Sur mobile : menu du navigateur → **Ajouter à l'écran d'accueil** pour l'installer comme une application.

## 📅 Le planning

4 phases progressives, 24 semaines :

| Phase | Semaines | Repère quotidien |
|-------|----------|-------------------|
| Endurance | 1 – 3 | 7 000 – 9 000 pas |
| Gros volume | 4 – 12 | 9 000 – 11 000 pas |
| Spécifique voyage | 13 – 22 | 11 000 – 13 000 pas |
| Préparation finale | 23 – 24 | 13 000 – 15 000 pas |

### Structure d'une semaine type

| Jour | Activité |
|------|----------|
| Lundi | Marche facile + mobilité 10 min |
| Mardi | Bureau : 30 min aller + 30 min retour |
| Mercredi | Renforcement A + 10–20 min facile |
| Jeudi | Bureau : 30 min aller + 30 min retour |
| Vendredi | Bureau : 30 min aller + 30 min retour |
| Samedi | Roller 1h30 / marche longue |
| Dimanche | Renforcement B léger ou marche longue |

## ⚙️ Fonctionnalités

- **Aujourd'hui** : compteur circulaire, objectif du jour, statistiques
- **Planning** : les 24 semaines avec l'activité prévue chaque jour
- **Bilans** : total et moyenne par semaine, fatigue (0–10), douleur (0–10), notes
- **Réglages** : objectif par défaut, longueur de pas, réinitialisation

## 💾 Stockage

Les données sont enregistrées localement dans le navigateur (`localStorage`).
Rien n'est envoyé sur un serveur.

## 📁 Fichiers

```
index.html      Structure de l'application
styles.css      Design mobile-first
planning.js     Générateur de planning
app.js          Logique applicative
manifest.json   Configuration PWA
```

## ⚠️ Avertissement

Cette application est un outil de suivi. En cas de douleur inhabituelle ou persistante,
consulter un professionnel de santé. Ne pas forcer sur une douleur.
