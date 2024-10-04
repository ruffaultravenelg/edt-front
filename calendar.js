let allEvents = []; // Stocker tous les événements
const size = 1.6;

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
    clearCalendar(); // Vider le calendrier avant d'afficher les nouveaux événements

    // Déterminer le lundi de la semaine et la fin de la semaine (dimanche)
    const startDate = getMonday(day);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4);
    endDate.setHours(23, 59, 59);

    // Mettre à jour la vue avec la date du début de semaine (lundi)
    document.getElementById('week_p').textContent = 
        `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;

    // Filtrer et afficher les événements de la semaine
    const weekEvents = allEvents.filter(event => {
        const eventDate = parseDay(event.jour); // Convertir la date de l'événement en objet Date
        return eventDate >= startDate && eventDate <= endDate; // Vérifier si l'événement est dans la semaine
    });

    // Afficher les événements filtrés dans le calendrier
    weekEvents.forEach(displayEvent);

    // Ajouter un indicateur pour la date actuelle, si elle est dans la semaine
    const currentDate = new Date();
    if (currentDate >= startDate && currentDate <= endDate) {
        const dayColumn = document.querySelector('.calendar').children[getDayColumn(currentDate.getDay())];
        const container = dayColumn.querySelector('.day-content');
        
        const line = document.createElement('div');
        line.className = 'current';
        line.style.top = `${((currentDate.getHours() - 8) * 60 + currentDate.getMinutes()) * size}px`;
        
        container.appendChild(line);
    }
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
 * @param {string} event.guid - Identifiant de l'événement.
 * @param {string} event.titre - Le titre de l'événement.
 * @param {string} event.heure_debut - L'heure de début de l'événement (format "HH:MM").
 * @param {string} event.heure_fin - L'heure de fin de l'événement (format "HH:MM").
 * @param {string} event.professeur - Le nom du professeur responsable.
 * @param {string} event.salle - Le lieu où se déroule l'événement.
 * @param {string} event.jour - Le jour de l'événement au format "DD/MM/YYYY".
 */
function displayEvent(event) {
    const eventElement = document.createElement('div');
    eventElement.classList.add('event');

    // Set event color
    const { r, g, b } = stringToColor(event.titre);
    eventElement.style.setProperty('--r', r);
    eventElement.style.setProperty('--g', g);
    eventElement.style.setProperty('--b', b);

    // Ajouter les détails de l'événement
    eventElement.innerHTML = `
        <p class="time">${event.heure_debut} - ${event.heure_fin}</p>
        <p class="title">${event.titre}</p>
        <div class="tag-container"></div>
    `;

    if (event.salle)
        eventElement.querySelector('.tag-container').innerHTML += `<p class="tag">${event.salle}</p>`;
    if (event.professeur)
        eventElement.querySelector('.tag-container').innerHTML += `<p class="tag">${event.professeur}</p>`;


    const eventDate = parseDay(event.jour);
    const dayColumn = getDayColumn(eventDate.getDay());

    // Calculer la position en fonction de l'heure de début
    const [startHour, startMinute] = event.heure_debut.split(':').map(Number);
    const [endHour, endMinute] = event.heure_fin.split(':').map(Number);

    // Convertir l'heure en pixels dans l'échelle (chaque heure = 60px)
    const topPosition = size * (((startHour - 8) * 60) + (startMinute)); // Distance en pixels depuis 8h
    const eventDuration = size * (((endHour - startHour) * 60) + (endMinute - startMinute)); // Durée de l'événement en minutes

    // Appliquer la position et la hauteur
    eventElement.style.top = `${Math.floor(topPosition)}px`;
    eventElement.style.height = `${Math.floor(eventDuration)}px`;

    // set event container size
    const container = document.querySelector('.calendar').children[dayColumn].querySelector('.day-content');
    const pixelSize = (60 * (19 - 8)) * size;
    container.style.height = `${pixelSize}px`;

    // Add object
    container.appendChild(eventElement);
    
    // Fix padding
    const computedStyle = window.getComputedStyle(eventElement, null);
    const padding = parseInt(computedStyle.getPropertyValue('padding'));
    const borderWidth = parseInt(computedStyle.getPropertyValue('border-width'));
    eventElement.style.height = Math.floor(topPosition) - (2 * padding) - (2 * borderWidth); // -2 pour les bordures 

}


/**
 * Renvoie la date correspondant au lundi de la semaine de la date fournie.
 *
 * @param {Date} date - La date à partir de laquelle trouver le lundi de la semaine.
 * @returns {Date} - La date du lundi de la semaine contenant la date fournie.
 */
function getMonday(date) {
    const givenDate = new Date(date); // Créer une copie de la date pour éviter les modifications de l'originale
    const day = givenDate.getDay(); // 0 (dimanche) à 6 (samedi)
    const distanceFromMonday = (day + 6) % 7; // Calculer la distance entre le jour actuel et le lundi
    givenDate.setDate(givenDate.getDate() - distanceFromMonday); // Ajuster la date au lundi de la semaine
    givenDate.setHours(0, 0, 0, 0);
    return givenDate;
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
    const days = document.querySelectorAll('.calendar .day .day-content');
    days.forEach(day => {
        while (day.children.length > 0) { // On ne supprime pas le titre du jour
            day.removeChild(day.lastChild);
        }
    });
}

/**
 * Génère une couleur aléatoire basée sur une seed (graine) et qui est suffisamment sombre pour un texte blanc lisible.
 * 
 * @param {string} seed - La graine utilisée pour générer la couleur.
 * @returns {object} - La couleur sous la forme d'un objet {r, g, b}.
 */
function stringToColor(seed) {

    // Fonction pour transformer un caractère en code numérique
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    // Convertir la seed en une valeur numérique
    let hash = hashCode(seed);

    // Convertir le hash en valeurs RGB
    let r = (hash & 0xFF0000) >> 16;
    let g = (hash & 0x00FF00) >> 8;
    let b = (hash & 0x0000FF);

    // Assurer que la couleur soit sombre en réduisant les valeurs RGB
    r = Math.floor((r + 255) / 2);
    g = Math.floor((g + 255) / 2);
    b = Math.floor((b + 255) / 2);

    // Retourner la couleur sous forme hexadécimale
    return {r, g, b};
}