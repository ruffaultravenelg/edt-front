let allEvents = []; // Stocker tous les événements

/**
 * Charge les événements à partir d'un fichier JSON et affiche la semaine actuelle.
 */
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allEvents = data; // Stocker toutes les données
        const today = new Date(); // Obtenir la date d'aujourd'hui
        displayWeek(today); // Afficher les événements de la semaine en cours
    });

/**
 * Affiche les événements pour la semaine contenant la date spécifiée.
 * 
 * @param {Date} day - Une date quelconque de la semaine à afficher.
 */
export function displayWeek(day) {
    clearCalendar(); // Vider le calendrier actuel avant d'afficher les nouveaux événements

    const startDate = getMonday(day); // Déterminer le lundi de la semaine
    startDate.setDate(startDate.getDate() - 1) //Là franchement jsp
    const endDate = new Date(startDate); 
    endDate.setDate(startDate.getDate() + 5); // J'en sais rien non plus

    // Filtrer les événements qui se produisent dans la semaine
    const weekEvents = allEvents.filter(event => {
        const eventDate = parseDay(event.jour); // Convertir la date de l'événement en objet Date
        return eventDate >= startDate && eventDate <= endDate; // Vérifier si l'événement est dans la semaine
    });

    // Afficher les événements filtrés
    weekEvents.forEach(event => {
        displayEvent(event);
    });

}

/**
 * Convertit une chaîne de caractères au format "DD/MM/YYYY" en objet Date.
 * 
 * @param {string} dateString - La date au format "DD/MM/YYYY".
 * @returns {Date} - L'objet Date correspondant.
 */
function parseDay(dateString) {
    const dateParts = dateString.split('/');
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); // Le mois est basé sur 0 (janvier = 0)
}

/**
 * Affiche un événement sur l'interface en fonction de ses données.
 * 
 * @param {Object} event - L'événement à afficher.
 * @param {string} event.titre - Le titre de l'événement.
 * @param {string} event.heure_debut - L'heure de début de l'événement.
 * @param {string} event.heure_fin - L'heure de fin de l'événement.
 * @param {string} event.professeur - Le nom du professeur responsable.
 * @param {string} event.salle - Le lieu où se déroule l'événement.
 * @param {string} event.jour - Le jour de l'événement au format "DD/MM/YYYY".
 */
function displayEvent(event) {
    // Créer un élément pour l'événement
    const eventElement = document.createElement('div');
    eventElement.classList.add('event');

    // Ajouter les détails de l'événement à l'élément
    eventElement.innerHTML = `
        <div class="time">${event.heure_debut} - ${event.heure_fin}</div>
        <div class="details">
            <strong>${event.titre}</strong><br>
            ${event.professeur}<br>
            Salle : ${event.salle}
        </div>
    `;

    // Obtenir la colonne correspondant au jour de l'événement (lundi = 0, mardi = 1, etc.)
    const eventDate = parseDay(event.jour);
    const dayColumn = getDayColumn(eventDate.getDay());

    // Ajouter l'événement à la colonne appropriée
    document.querySelector('.calendar').children[dayColumn].appendChild(eventElement);
}

/**
 * Renvoie la date du lundi de la semaine à partir d'une date donnée.
 *
 * @param {Date} date - La date pour laquelle on veut trouver le lundi de la semaine.
 * @returns {Date} - La date du lundi de la même semaine.
 */
function getMonday(date) {
    const dayOfWeek = date.getDay(); // 0 pour dimanche, 1 pour lundi, etc.
    const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche (0), on recule de 6 jours, sinon on ajuste en fonction.
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + difference);
    
    return monday;
}

/**
 * Retourne l'indice de la colonne correspondant à un jour de la semaine (0 = lundi, 1 = mardi, ...).
 * 
 * @param {number} day - Le numéro du jour (lundi = 1, mardi = 2, ..., dimanche = 0).
 * @returns {number} - L'indice de la colonne dans la grille (lundi = 0, mardi = 1, ...).
 */
function getDayColumn(day) {
    switch (day) {
        case 1: return 0; // Lundi
        case 2: return 1; // Mardi
        case 3: return 2; // Mercredi
        case 4: return 3; // Jeudi
        case 5: return 4; // Vendredi
        default: return 0; // Par défaut, retour au lundi
    }
}

/**
 * Vide le calendrier en supprimant tous les événements actuellement affichés.
 */
function clearCalendar() {
    const days = document.querySelectorAll('.calendar .day');
    days.forEach(day => {
        while (day.children.length > 0) { // On ne supprime pas le titre du jour
            day.removeChild(day.lastChild);
        }
    });
}