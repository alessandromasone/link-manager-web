document.addEventListener('DOMContentLoaded', () => {

    const tree = document.querySelector('.tree');
    let draggedItem = null;

    // Evento dragstart: avviato quando viene iniziato il trascinamento di un elemento
    tree.addEventListener('dragstart', (event) => {
        draggedItem = event.target.closest('li'); // Recupera l'elemento <li> più vicino
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', draggedItem.outerHTML);
        draggedItem.classList.add('drag-over');
    });

    // Evento dragend: avviato quando il trascinamento di un elemento viene completato o annullato
    tree.addEventListener('dragend', (event) => {
        draggedItem = event.target.closest('li');
        draggedItem.classList.remove('drag-over');
    });

    // Evento dragover: avviato quando un elemento viene trascinato sopra un'area di destinazione valida
    tree.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const dropZone = event.target.closest('li');
        const dropZoneType = dropZone.getAttribute('data-attrib-type');

        if (dropZone && dropZone !== draggedItem && dropZoneType !== 'link') {
            dropZone.classList.add('drag-over');
        }
    });

    // Evento dragleave: avviato quando un elemento viene trascinato fuori da un'area di destinazione valida
    tree.addEventListener('dragleave', (event) => {
        const dropZone = event.target.closest('li');
        const dropZoneType = dropZone.getAttribute('data-attrib-type');

        if (dropZone && dropZone !== draggedItem && dropZoneType !== 'link') {
            dropZone.classList.remove('drag-over');
        }
    });

    // Evento drop: avviato quando viene rilasciato un elemento trascinato su un'area di destinazione valida
    tree.addEventListener('drop', (event) => {
        event.preventDefault();
        const dropZone = event.target.closest('li');
        const dropZoneType = dropZone.getAttribute('data-attrib-type');

        if (dropZone && dropZone !== draggedItem && dropZoneType !== 'link') {
            const dropZoneAncestors = getAncestors(dropZone);
            const isParent = dropZoneAncestors.includes(draggedItem);
            const isSelf = dropZone === draggedItem;

            if (!isParent && !isSelf) {
                dropZone.classList.remove('drag-over');

                const dropZoneList = dropZone.querySelector('ul');
                const sourceList = draggedItem.parentNode;

                // Crea l'elemento <ul> nella cartella di destinazione se è vuota
                if (!dropZoneList) {
                    const newUl = document.createElement('ul');
                    dropZone.appendChild(newUl);
                }

                draggedItem.parentNode.removeChild(draggedItem);
                dropZone.querySelector('ul').appendChild(draggedItem);

                // Rimuovi l'elemento <ul> vuoto dalla cartella di origine se diventa vuota dopo il trascinamento
                if (sourceList.childElementCount === 0 && sourceList.parentNode !== tree) {
                    sourceList.remove();
                }

                // Aggiorna il genitore dell'elemento nel database
                const itemId = draggedItem.getAttribute('data-attrib-id');
                const newParentId = dropZone.getAttribute('data-attrib-id');
                updateDatabase(itemId, newParentId);
            }
        }
    });

    // Funzione per ottenere gli elementi genitori di un elemento
    function getAncestors(element) {
        const ancestors = [];
        let currentElement = element.parentElement;

        while (currentElement !== null && currentElement !== tree) {
            ancestors.push(currentElement);
            currentElement = currentElement.parentElement;
        }

        return ancestors;
    }

    // Funzione per aggiornare il database con le informazioni del trascinamento
    function updateDatabase(itemId, newParentId) {
        // Effettua la richiesta AJAX per l'aggiornamento del database utilizzando jQuery
        $.ajax({
            url: 'php/move.php',
            method: 'POST',
            data: { itemId: itemId, newParentId: newParentId },
            success: function (response) { },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    }

});
